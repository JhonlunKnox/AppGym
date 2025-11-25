import { Image } from "expo-image";
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  View,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { askGemini } from "@/api/gemini";
import { supabase } from "@/utils/supabase";

// Header image (you can swap to a local require(...) if you prefer)
const imgcomida = { uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" };

export default function AlimentacionScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const [messages, setMessages] = useState<
    { from: "user" | "ai"; text: string }[]
  >([]);

  const [input, setInput] = useState("");
  const [chatList, setChatList] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // editar título modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // modal para nuevo chat
  const [newChatModalVisible, setNewChatModalVisible] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Crear un nuevo chat con nombre
  const confirmCreateChat = async () => {
    if (!newChatTitle.trim()) {
      Alert.alert("Título requerido", "Debes escribir un nombre para el chat.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("chats")
      .insert({
        user_id: user?.id,
        title: newChatTitle,
      })
      .select()
      .single();

    if (error) {
      console.error("createNewChat error", error);
      Alert.alert("Error", "No se pudo crear el chat.");
      return;
    }

    setNewChatModalVisible(false);
    setChatId(data.chat_id);

    await loadMessages(data.chat_id);
    await loadChatList();
    setModalVisible(true);
  };

  // Abrir modal para crear chat
  const openChat = () => {
    // pequeña animación para dar feedback al FAB
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.08, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    setNewChatModalVisible(true);
    setNewChatTitle("");
  };

  // Cargar mensajes
  const loadMessages = async (cid: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", cid)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("loadMessages error", error);
      return;
    }

    setMessages(
      data?.map((m) => ({ from: m.sender, text: m.text })) ?? []
    );
  };

  // Cargar lista de chats
  const loadChatList = async () => {
    setLoadingChats(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingChats(false);
      return;
    }

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadChatList error", error);
    }

    setChatList(data ?? []);
    setLoadingChats(false);
  };

  // Abrir chat existente
  const openExistingChat = async (cid: string) => {
    setChatId(cid);
    await loadMessages(cid);
    setModalVisible(true);
  };

  const closeChat = () => {
    setModalVisible(false);
  };

  // enviar mensaje
  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;

    const userMsg = { from: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);

    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender: "user",
      text: input,
    });

    let response = "";
    try {
      response = await askGemini(input);
    } catch (err) {
      console.error("askGemini error", err);
      response = "Lo siento, no puedo responder ahora.";
    }

    const aiMsg = { from: "ai" as const, text: response };
    setMessages((prev) => [...prev, aiMsg]);

    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender: "ai",
      text: response,
    });

    setInput("");
  };

  // borrar chat
  const deleteChat = async (cid: string) => {
    Alert.alert(
      "Eliminar chat",
      "¿Seguro que quieres eliminar este chat? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await supabase.from("chat_messages").delete().eq("chat_id", cid);
            await supabase.from("chats").delete().eq("chat_id", cid);

            if (chatId === cid) {
              setModalVisible(false);
              setChatId(null);
              setMessages([]);
            }

            await loadChatList();
          },
        },
      ]
    );
  };

  // abrir editor
  const openEditModal = (chat: any) => {
    setEditingChatId(chat.chat_id);
    setEditingTitle(chat.title ?? "");
    setEditModalVisible(true);
  };

  // guardar titulo editado
  const saveEditedTitle = async () => {
    if (!editingChatId) return;

    await supabase
      .from("chats")
      .update({ title: editingTitle })
      .eq("chat_id", editingChatId);

    setEditModalVisible(false);
    setEditingChatId(null);
    setEditingTitle("");
    await loadChatList();
  };

  useEffect(() => {
    loadChatList();

    // opcional: subscripciones realtime si usas supabase Realtime
    const subscription = supabase
      .channel('public:chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, payload => {
        loadChatList();
      })
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <>
      {/* CONTENIDO */}
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#3b0f0f", dark: "#0f0606" }}
        headerImage={
          <Image
            style={styles.image}
            source={imgcomida}
            contentFit="cover"
            transition={1000}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Con Tu Modo Premium, Te Armamos Tu Plan de Alimentación</ThemedText>
        </ThemedView>

        {/* LISTA DE CHATS */}
        <ThemedView style={{ padding: 15 }}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Tus chats</ThemedText>

          {loadingChats ? (
            <ActivityIndicator style={{ marginTop: 12 }} color="#ff8b8b" />
          ) : chatList.length === 0 ? (
            <ThemedText style={{ marginTop: 12, opacity: 0.8, color: "#ffbdbd" }}>
              No tienes chats todavía — crea uno nuevo ✨
            </ThemedText>
          ) : (
            <ScrollView style={{ marginTop: 12 }}>
              {chatList.map((chat) => (
                <Pressable
                  key={chat.chat_id}
                  onPress={() => openExistingChat(chat.chat_id)}
                  onLongPress={() =>
                    Alert.alert("Opciones", "¿Qué quieres hacer?", [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Editar título",
                        onPress: () => openEditModal(chat),
                      },
                      {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: () => deleteChat(chat.chat_id),
                      },
                    ])
                  }
                  style={({ pressed }) => [
                    styles.chatCard,
                    { backgroundColor: pressed ? "#380808" : "#2a0f0f" },
                  ]}
                >
                  <ThemedText type="defaultSemiBold" style={styles.chatTitle}>{chat.title}</ThemedText>
                  <ThemedText style={styles.timestamp}>
                    {chat.created_at
                      ? new Date(chat.created_at).toLocaleString()
                      : ""}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </ThemedView>
      </ParallaxScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity style={styles.fabBtn} onPress={openChat}>
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>
      </Animated.View>

      {/* MODAL CHAT */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Chat</ThemedText>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    const current = chatList.find((c) => c.chat_id === chatId);
                    if (current) openEditModal(current);
                  }}
                >
                  <ThemedText style={styles.iconAction}>✎</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeChat}>
                  <ThemedText style={styles.iconAction}>✖</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.chatBox} contentContainerStyle={{ paddingBottom: 12 }}>
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.msg,
                    msg.from === "user" ? styles.userMsg : styles.aiMsg,
                  ]}
                >
                  <ThemedText style={msg.from === "user" ? styles.userMsgText : styles.aiMsgText}>
                    {msg.text}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#ffbdbd"
                value={input}
                onChangeText={setInput}
                style={styles.input}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <ThemedText style={styles.sendBtnText}>Enviar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL EDITAR TÍTULO */}
      <Modal transparent visible={editModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { width: "85%", height: 220 }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Editar título</ThemedText>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <ThemedText style={styles.iconAction}>✖</ThemedText>
              </TouchableOpacity>
            </View>

            <TextInput
              value={editingTitle}
              onChangeText={setEditingTitle}
              placeholder="Nuevo título"
              placeholderTextColor="#ffbdbd"
              style={styles.editInput}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveEditedTitle}>
              <ThemedText style={styles.saveBtnText}>Guardar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL NUEVO CHAT */}
      <Modal transparent visible={newChatModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { width: "85%", height: 230 }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Nuevo chat</ThemedText>
              <TouchableOpacity onPress={() => setNewChatModalVisible(false)}>
                <ThemedText style={styles.iconAction}>✖</ThemedText>
              </TouchableOpacity>
            </View>

            <TextInput
              value={newChatTitle}
              onChangeText={setNewChatTitle}
              placeholder="Nombre del chat"
              placeholderTextColor="#ffbdbd"
              style={styles.editInput}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={confirmCreateChat}>
              <ThemedText style={styles.saveBtnText}>Crear chat</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 8 },

  image: {
    flex: 1,
    width: "100%",
    height: 220,
    opacity: 0.95,
  },

  /* LISTA DE CHATS */
  chatCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#4a1212",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: "#2a0f0f",
  },
  chatTitle: {
    color: "#ffd6d6",
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: { color: "#ffbdbd", opacity: 0.85, fontSize: 12 },

  /* FAB */
  fab: {
    position: "absolute",
    bottom: 28,
    right: 28,
  },
  fabBtn: {
    width: 68,
    height: 68,
    borderRadius: 50,
    backgroundColor: "#b70000",
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  fabText: { fontSize: 36, color: "white", marginTop: -2 },

  /* MODAL / OVERLAY */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    height: "70%",
    backgroundColor: "#2b0e0e",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#4a1212",
    elevation: 18,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  modalTitle: {
    color: "#ffdede",
    fontSize: 18,
  },

  iconAction: {
    fontSize: 18,
    color: "#ffdede",
  },

  /* CHAT BOX */
  chatBox: {
    flex: 1,
    marginVertical: 8,
    paddingHorizontal: 4,
  },

  msg: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 14,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },

  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#8b0000",
    borderBottomRightRadius: 6,
  },

  aiMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#3a0d0d", // rojo oscuro para Gemini
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#5c1a1a",
  },

  aiMsgText: {
    color: "#ffdede",
  },

  userMsgText: {
    color: "#fff7f7",
  },

  /* INPUT ROW */
  inputRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },

  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#5a1c1c",
    backgroundColor: "#2a0f0f",
    color: "#ffdede",
  },

  sendBtn: {
    paddingHorizontal: 16,
    backgroundColor: "#b70000",
    justifyContent: "center",
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },

  sendBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* EDIT / NEW CHAT INPUTS */
  editInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#5a1c1c",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#2a0f0f",
    color: "#ffdede",
  },

  saveBtn: {
    marginTop: 18,
    backgroundColor: "#b70000",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },

  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#ffdede",
  },
});
