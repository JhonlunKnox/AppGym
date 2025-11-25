// GymScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Easing,
  Linking,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { supabase } from "../../utils/supabase";
import { router } from "expo-router";

import { searchExerciseVideo, YouTubeVideo } from "../../api/youtube";

type Exercise = {
  id: string;
  name: string;
  body_part?: string;
  target?: string;
  equipment?: string;
  gif_url?: string;
};

type Rutina = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
};

/**
 * RUTA LOCAL DEL ASSET SUBIDO POR EL USUARIO
 * (El desarrollador pidió enviar la ruta tal cual: /mnt/data/...)
 * Puedes transformarla/servirla desde tu backend si la necesitas como URL pública.
 */
const designImagePath = "/mnt/data/71acdf77-9e53-424d-807c-e6f77fe60db9.png";

export default function GymScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  // video states
  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoThumb, setVideoThumb] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  // UI/animation
  const thumbOpacity = useRef(new Animated.Value(1)).current;
  const webviewOpacity = useRef(new Animated.Value(0)).current;
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaybackReady, setIsPlaybackReady] = useState<boolean>(false);
  const webviewRef = useRef<WebView | null>(null);

  const [targets, setTargets] = useState<string[]>([]);
  const [filterTarget, setFilterTarget] = useState<string | null>(null);

  // Rutinas / modales
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [rutinaModalVisible, setRutinaModalVisible] = useState<boolean>(false); // ya lo usabas: para elegir rutina al añadir ejercicio
  const [creatingRutina, setCreatingRutina] = useState<boolean>(false);
  const [newRutinaName, setNewRutinaName] = useState<string>("");

  // New: top buttons open these modales
  const [routinesListVisible, setRoutinesListVisible] = useState<boolean>(false); // "Ver Rutinas"
  const [createRoutineVisible, setCreateRoutineVisible] = useState<boolean>(false); // "Crear Rutina (form)"
  // detail view of a selected routine
  const [viewRutinaModalVisible, setViewRutinaModalVisible] = useState<boolean>(false);
  const [viewRutinaExercises, setViewRutinaExercises] = useState<any[]>([]);
  const [viewRutinaTitle, setViewRutinaTitle] = useState<string>("");

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      } catch (e) {
        console.log("No auth user (guest):", e);
      }
      await loadAll();
    })();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("exercises").select("*").order("name", { ascending: true });
      if (error) throw error;
      const list = (data ?? []) as Exercise[];
      setExercises(list);
      setFiltered(list);

      // targets únicos y ordenados
      const t = Array.from(new Set(list.map((i) => (i.target || "").trim()).filter(Boolean)));
      t.sort((a, b) => a.localeCompare(b));
      setTargets(t);
    } catch (err) {
      console.error("loadAll err", err);
      Alert.alert("Error", "No se pudieron cargar los ejercicios.");
    } finally {
      setLoading(false);
    }
  }

  // filtro / búsqueda
  useEffect(() => {
    let base = exercises;
    if (filterTarget) base = base.filter((e) => (e.target || "").toLowerCase() === filterTarget.toLowerCase());

    if (!searchQuery.trim()) {
      setFiltered(base);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFiltered(
      base.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(q) ||
          (e.target || "").toLowerCase().includes(q) ||
          (e.body_part || "").toLowerCase().includes(q)
      )
    );
  }, [searchQuery, filterTarget, exercises]);

  // helpers para procesar URLs de YouTube
  function extractYouTubeIdFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      // Common patterns
      // watch?v=ID
      const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
      if (watchMatch && watchMatch[1]) return watchMatch[1];

      // youtu.be/ID
      const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
      if (shortMatch && shortMatch[1]) return shortMatch[1];

      // /embed/ID
      const embedMatch = url.match(/embed\/([A-Za-z0-9_-]{6,})/);
      if (embedMatch && embedMatch[1]) return embedMatch[1];

      // fallback: any long-ish id-like token
      const generic = url.match(/([A-Za-z0-9_-]{6,})/);
      if (generic) return generic[1];

      return null;
    } catch (e) {
      return null;
    }
  }

  // Construye URL embed + autoplay (mute según estado isMuted)
  function makeEmbedUrlFromId(id: string, muted = true) {
    // autoplay=1 required, but autoplay without mute is often blocked in mobile browsers; we keep default muted (user can unmute)
    const muteFlag = muted ? "1" : "0";
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${muteFlag}&playsinline=1&controls=1&rel=0&showinfo=0`;
  }

  // abrir detalle (con async para buscar, si hace falta)
  const openDetail = async (item: Exercise) => {
    setDetailExercise(item);
    setDetailVisible(true);

    // reset video UI states
    setVideoEmbedUrl(null);
    setVideoLoading(true);
    setVideoError(null);
    setVideoThumb(null);
    setVideoId(null);
    setIsPlaybackReady(false);
    thumbOpacity.setValue(1);
    webviewOpacity.setValue(0);

    try {
      const raw = (item.gif_url || "").trim();

      // If gif_url already contains youtube link -> use it
      const extracted = extractYouTubeIdFromUrl(raw);
      if (extracted) {
        setVideoId(extracted);
        // If we have direct youtube id we can optionally fetch thumbnail (high quality)
        setVideoThumb(`https://i.ytimg.com/vi/${extracted}/hqdefault.jpg`);
        setVideoEmbedUrl(makeEmbedUrlFromId(extracted, isMuted));
        setVideoLoading(false);
        return;
      }

      // Otherwise, try to search via API (you had searchExerciseVideo)
      const info: YouTubeVideo | null = await searchExerciseVideo(item.name);
      if (!info) {
        setVideoError("No se encontró video relacionado.");
        setVideoLoading(false);
        return;
      }

      setVideoThumb(info.thumbnail ?? null);
      setVideoId(info.videoId);
      setVideoEmbedUrl(makeEmbedUrlFromId(info.videoId, isMuted));
    } catch (err) {
      console.error("error buscando video", err);
      setVideoError("Error al buscar video.");
    } finally {
      setVideoLoading(false);
    }
  };

  // cargar rutinas del usuario
  async function loadRutinas() {
    if (!userId) {
      Alert.alert("No logueado", "Inicia sesión para gestionar tus rutinas.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from("rutina").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      setRutinas((data as Rutina[]) ?? []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar las rutinas.");
    } finally {
      setLoading(false);
    }
  }

  // crear rutina
  async function createRutina() {
    if (!userId) {
      Alert.alert("No logueado", "Inicia sesión para crear una rutina.");
      return;
    }
    if (!newRutinaName.trim()) {
      Alert.alert("Error", "Pon un nombre para la rutina.");
      return;
    }
    try {
      const { data, error } = await supabase.from("rutina").insert([{ user_id: userId, title: newRutinaName.trim() }]).select().single();
      if (error) throw error;
      setNewRutinaName("");
      setCreatingRutina(false);
      await loadRutinas();
      Alert.alert("Hecho", "Rutina creada.");
      // if createRoutineVisible is open, keep it open? we'll close it:
      setCreateRoutineVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo crear la rutina.");
    }
  }

  // añadir ejercicio a rutina
  async function addExerciseToRutina(rutinaId: string, exerciseId: string) {
    try {
      const { error } = await supabase.from("rutina_ejercicios").insert([{ rutina_id: rutinaId, exercise_id: exerciseId }]);
      if (error) throw error;
      Alert.alert("Añadido", "Ejercicio añadido a la rutina.");
      setRutinaModalVisible(false);
      setDetailVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo añadir a la rutina.");
    }
  }

  // Cargar ejercicios de una rutina para mostrar detalle
  async function loadRoutineExercises(rutinaId: string, title?: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rutina_ejercicios")
        .select("*, exercises(*)")
        .eq("rutina_id", rutinaId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      setViewRutinaExercises((data as any[]) ?? []);
      setViewRutinaTitle(title ?? "");
      setViewRutinaModalVisible(true);
    } catch (err) {
      console.error("loadRoutineExercises err", err);
      Alert.alert("Error", "No se pudo cargar los ejercicios de la rutina.");
    } finally {
      setLoading(false);
    }
  }

  // Animación: cuando WebView está listo -> fade thumbnail out, fade webview in
  function onWebViewReady() {
    setIsPlaybackReady(true);
    Animated.parallel([
      Animated.timing(thumbOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(webviewOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }

  // recargar/reiniciar reproducción
  function replayVideo() {
    if (!videoId) return;
    // rebuild embed url with current mute flag (if user toggled)
    const embed = makeEmbedUrlFromId(videoId, isMuted);
    // small trick: changing key prop forces WebView reload; here we set videoEmbedUrl to null briefly then set again
    setVideoEmbedUrl(null);
    setTimeout(() => {
      setVideoEmbedUrl(embed);
      setIsPlaybackReady(false);
      thumbOpacity.setValue(1);
      webviewOpacity.setValue(0);
    }, 80);
  }

  // abrir en YouTube (versión "watch")
  function openInYouTube() {
    if (!videoId) {
      Alert.alert("No disponible", "No se encontró el ID del video para abrir en YouTube.");
      return;
    }
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(url).catch((e) => {
      console.error("openInYouTube error", e);
      Alert.alert("Error", "No se pudo abrir YouTube.");
    });
  }

  // toggle mute: re-load video with mute flag updated
  function toggleMute() {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoId) {
        setVideoEmbedUrl(makeEmbedUrlFromId(videoId, next));
        // reset animations so thumbnail shows briefly while reloading
        thumbOpacity.setValue(1);
        webviewOpacity.setValue(0);
        setIsPlaybackReady(false);
      }
      return next;
    });
  }

  // Render card
  function renderCard({ item }: { item: Exercise }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.sub}>
          {item.body_part} • {item.target}
        </Text>
      </TouchableOpacity>
    );
  }

  // Detail Modal
  function DetailModal() {
    if (!detailExercise) return null;

    return (
      <Modal visible={detailVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailVisible(false)}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{detailExercise.name}</Text>

            <View style={{ width: 64 }} />
          </View>

          <View style={styles.videoContainer}>
            {/* Thumbnail (Animated) */}
            {videoThumb && (
              <Animated.Image
                source={{ uri: videoThumb }}
                style={[styles.thumbImage, { opacity: thumbOpacity }]}
                resizeMode="cover"
              />
            )}

            {/* Loading / Error / WebView */}
            {videoLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF3B3B" />
              </View>
            ) : videoError ? (
              <View style={styles.centered}>
                <Text style={styles.errorText}>{videoError}</Text>
              </View>
            ) : videoEmbedUrl ? (
              // WebView wrapped in Animated.View for fade-in
              <Animated.View style={{ ...styles.webviewWrap, opacity: webviewOpacity }}>
                <WebView
                    key={videoEmbedUrl} // force reload when url changes
                    ref={(r) => { webviewRef.current = r; }}
                    source={{ uri: videoEmbedUrl }}
                    style={styles.webview}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction={false}
                    allowsFullscreenVideo
                    onLoadEnd={() => {
                      // small delay to ensure video frame ready
                      setTimeout(onWebViewReady, 120);
                    }}
                  />
              </Animated.View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.noVideoText}>No hay video disponible</Text>
              </View>
            )}
          </View>

          {/* Controls + Info */}
          <View style={styles.detailBody}>
            <Text style={styles.detailName}>{detailExercise.name}</Text>
            <Text style={styles.detailSub}>
              {detailExercise.body_part} • {detailExercise.target}
            </Text>
            <Text style={styles.detailEquip}>Equipo: {detailExercise.equipment ?? "—"}</Text>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlBtn} onPress={replayVideo} disabled={!videoId}>
                <Text style={styles.controlBtnText}>Reproducir</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlBtn} onPress={toggleMute} disabled={!videoId}>
                <Text style={styles.controlBtnText}>{isMuted ? "Silenciar" : "Activar sonido"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlBtn} onPress={openInYouTube} disabled={!videoId}>
                <Text style={styles.controlBtnText}>Abrir en YouTube</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={async () => {
                if (!userId) {
                  Alert.alert("No logueado", "Inicia sesión para añadir a tu rutina.");
                  return;
                }
                await loadRutinas();
                setRutinaModalVisible(true);
              }}
            >
              <Text style={styles.addButtonText}>Añadir a rutina</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // Rutina Modal (usada para elegir rutina al añadir ejercicio)
  function RutinaModal() {
    return (
      <Modal visible={rutinaModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalOverlay}>
          <View style={styles.rutinaBox}>
            <Text style={styles.modalTitle}>Elegir rutina</Text>

            {creatingRutina ? (
              <>
                <TextInput placeholder="Nombre de la nueva rutina" value={newRutinaName} onChangeText={setNewRutinaName} style={styles.input} />
                <TouchableOpacity style={styles.btnPrimary} onPress={createRutina}>
                  <Text style={styles.btnPrimaryText}>Crear</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnSecondary, { marginTop: 8 }]} onPress={() => setCreatingRutina(false)}>
                  <Text style={{ color: "#333" }}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <FlatList
                  data={rutinas}
                  keyExtractor={(r) => r.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.rutinaItem}
                      onPress={() => {
                        if (!detailExercise) return;
                        addExerciseToRutina(item.id, detailExercise.id);
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>{item.title}</Text>
                      <Text style={{ color: "#666" }}>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={() => (
                    <View style={{ padding: 12 }}>
                      <Text style={{ color: "#666" }}>No tienes rutinas aún.</Text>
                    </View>
                  )}
                />

                <TouchableOpacity style={styles.btnPrimary} onPress={() => setCreatingRutina(true)}>
                  <Text style={styles.btnPrimaryText}>Crear nueva rutina</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnSecondary, { marginTop: 8 }]} onPress={() => setRutinaModalVisible(false)}>
                  <Text style={{ color: "#333" }}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // New: Modal to show list of user's routines (triggered by top "Rutinas" card)
  function RoutinesListModal() {
    return (
      <Modal visible={routinesListVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tus rutinas</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#FF3B3B" />
            ) : rutinas.length === 0 ? (
              <Text style={styles.noData}>No tienes rutinas aún.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {rutinas.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.routineCard}
                    onPress={() => {
                      // load detalle local y mostrar
                      loadRoutineExercises(r.id, r.title);
                      setRoutinesListVisible(false);
                    }}
                  >
                    <Text style={styles.routineName}>{r.title}</Text>
                    {r.description ? <Text style={styles.routineDesc}>{r.description}</Text> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => {
                  setRoutinesListVisible(false);
                  // open create modal
                  setCreateRoutineVisible(true);
                }}
              >
                <Text style={styles.btnPrimaryText}>Crear nueva rutina</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnSecondary, { marginTop: 8 }]} onPress={() => setRoutinesListVisible(false)}>
                <Text style={{ color: "#ccc" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // New: Modal to create a routine (triggered by top "Crear Rutina" card)
  function CreateRoutineModal() {
    return (
      <Modal visible={createRoutineVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Crear nueva rutina</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la rutina"
              placeholderTextColor="#888"
              value={newRutinaName}
              onChangeText={setNewRutinaName}
            />

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={async () => {
                await createRutina();
                // reload list
                await loadRutinas();
              }}
            >
              <Text style={styles.btnPrimaryText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnSecondary, { marginTop: 8 }]} onPress={() => setCreateRoutineVisible(false)}>
              <Text style={{ color: "#ccc" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // New: Modal to view a rutina's exercises
  function ViewRutinaModal() {
    return (
      <Modal visible={viewRutinaModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>{viewRutinaTitle || "Rutina"}</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#FF3B3B" />
            ) : viewRutinaExercises.length === 0 ? (
              <Text style={styles.noData}>La rutina no tiene ejercicios aún.</Text>
            ) : (
              <ScrollView style={{ marginTop: 8 }}>
                {viewRutinaExercises.map((item: any) => (
                  <View key={item.id} style={styles.routineCard}>
                    <Text style={styles.routineName}>{item.exercises?.name ?? "—"}</Text>
                    <Text style={styles.routineDesc}>
                      {item.sets ?? "-"} x {item.reps ?? "-"} — {item.weight ?? 0}kg
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={{ marginTop: 12 }}>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => setViewRutinaModalVisible(false)}>
                <Text style={styles.btnPrimaryText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      {/* top row with optional design reference (not required by user, only available locally) */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.bigCard}
          onPress={async () => {
            await loadRutinas();
            setRoutinesListVisible(true);
          }}
        >
          <Text style={styles.bigCardIcon}>🏋️</Text>
          <Text style={styles.bigCardTitle}>Rutinas</Text>
          <Text style={styles.bigCardSub}>Ver rutinas guardadas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bigCard}
          onPress={() => {
            setCreateRoutineVisible(true);
          }}
        >
          <Text style={styles.bigCardIcon}>➕</Text>
          <Text style={styles.bigCardTitle}>Crear Rutina</Text>
          <Text style={styles.bigCardSub}>Arma tu propia rutina</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Busca ejercicios 💪</Text>

      <View style={styles.searchRow}>
        <TextInput placeholder="Buscar por nombre, target, body part..." style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterTarget(null)}>
          <Text style={{ color: "#fff" }}>Todos</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginVertical: 8 }}>
        <FlatList
          horizontal
          data={["All", ...targets]}
          keyExtractor={(i) => i}
          renderItem={({ item }) => {
            const isSelected = (filterTarget ?? "All") === item;
            return (
              <TouchableOpacity style={[styles.chip, isSelected && styles.chipSelected]} onPress={() => setFilterTarget(item === "All" ? null : item)}>
                <Text style={[styles.chipText, isSelected && styles.chipTextSel]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF3B3B" />
      ) : (
        <FlatList data={filtered} keyExtractor={(i) => i.id} renderItem={renderCard} contentContainerStyle={{ paddingBottom: 120 }} />
      )}

      {/* existing modals */}
      <DetailModal />
      <RutinaModal />

      {/* new top modals */}
      <RoutinesListModal />
      <CreateRoutineModal />
      <ViewRutinaModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    padding: 16,
  },

  // 🔥 Header Cards con Glow
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  bigCard: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.35)",
    shadowColor: "#FF1A1A",
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  bigCardIcon: { fontSize: 30, color: "#FF1A1A", marginBottom: 6 },
  bigCardTitle: { fontSize: 19, fontWeight: "800", color: "#fff" },
  bigCardSub: { color: "#999", fontSize: 12, marginTop: 4 },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginTop: 6,
    letterSpacing: 0.5,
  },

  // 🔍 Search mejorado
  searchRow: { flexDirection: "row", marginTop: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.35)",
  },
  filterButton: {
    backgroundColor: "#FF1A1A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginLeft: 8,
    shadowColor: "#FF0000",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },

  // 🔥 Chips Cyberpunk
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    backgroundColor: "#111",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.25)",
  },
  chipSelected: {
    backgroundColor: "#FF1A1A",
    borderColor: "#FF1A1A",
    shadowColor: "#FF0000",
    shadowOpacity: 0.55,
    shadowRadius: 8,
  },
  chipText: { color: "#999" },
  chipTextSel: { color: "#fff", fontWeight: "800" },

  // 📦 Cards de ejercicios
  card: {
    backgroundColor: "#0E0E0E",
    padding: 18,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.25)",
    shadowColor: "#FF1A1A",
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  exerciseName: {
    fontWeight: "800",
    fontSize: 18,
    color: "#fff",
    letterSpacing: 0.3,
  },
  sub: { color: "#aaa" },

  // 🟥 Modal (detail)
  modalSafe: { flex: 1, backgroundColor: "#050505" },
  modalHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeText: { color: "#FF1A1A", fontWeight: "800", fontSize: 18 },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // 🎥 Video Cyber Red Glow
  videoContainer: {
    height: 270,
    backgroundColor: "#000",
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.45)",
    shadowColor: "#FF1A1A",
    shadowRadius: 14,
    shadowOpacity: 0.55,
  },

  thumbImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
    opacity: 1,
  },
  webviewWrap: {
    flex: 1,
    width: "100%",
    height: "100%",
    zIndex: 2,
  },
  webview: { flex: 1, backgroundColor: "#000" },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#ff6666", fontWeight: "600" },
  noVideoText: { color: "#fff" },

  detailBody: { padding: 16 },
  detailName: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  detailSub: { color: "#bbb", marginTop: 10 },
  detailEquip: { color: "#eee", marginTop: 8 },

  controlsRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  controlBtn: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: "#1A0000",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.35)",
    alignItems: "center",
    shadowColor: "#FF0000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  controlBtnText: { color: "#fff", fontWeight: "800" },

  // ➕ Botón de agregar Cyber Red Pulse
  addButton: {
    backgroundColor: "#FF1A1A",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#FF1A1A",
    shadowRadius: 10,
    shadowOpacity: 0.6,
  },
  addButtonText: { color: "#fff", fontWeight: "900", fontSize: 17 },

  // 📦 Modal Rutinas (elegir)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  rutinaBox: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.35)",
  },
  rutinaItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#0E0E0E",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.2)",
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.35)",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#0D0D0D",
    color: "#fff",
    marginBottom: 12,
  },

  btnPrimary: {
    backgroundColor: "#FF1A1A",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#FF0000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "900" },

  btnSecondary: {
    backgroundColor: "#222",
    padding: 13,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },

  // --- New styles for top modals ---
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "88%",
    padding: 18,
    backgroundColor: "#121212",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.25)",
  },
  noData: { color: "#aaa", marginBottom: 8 },
  routineCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#0E0E0E",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.12)",
  },
  routineName: { color: "#fff", fontWeight: "800" },
  routineDesc: { color: "#888", marginTop: 4 },
});
