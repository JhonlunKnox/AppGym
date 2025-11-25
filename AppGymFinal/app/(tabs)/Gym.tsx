import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput, Modal
} from "react-native";
import { router } from "expo-router";

import {
  getExercisesFromDB,
  getExercisesByTargetDB,
  getTargetListDB,
  Exercise,
} from "../../api/exercises";

export default function GymScreen() {
  const [targets, setTargets] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Cargar todo desde Supabase
  useEffect(() => {
    async function load() {
      setLoading(true);

      const list = await getExercisesFromDB();
      setAllExercises(list);
      setFiltered(list);

      const targetList = await getTargetListDB();
      setTargets(targetList);

      setLoading(false);
    }
    load();
  }, []);

  // Filtro por target
  useEffect(() => {
    if (!selectedTarget) {
      setFiltered(searchQuery ? filtered : allExercises);
      return;
    }

    setLoading(true);
    getExercisesByTargetDB(selectedTarget)
      .then((res) => {
        setExercises(res);
        setFiltered(res);
      })
      .finally(() => setLoading(false));
  }, [selectedTarget]);

  // Búsqueda
  useEffect(() => {
    const base = selectedTarget ? exercises : allExercises;

    if (!searchQuery.trim()) {
      setFiltered(base);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFiltered(base.filter((e) => e.name.toLowerCase().includes(q)));
  }, [searchQuery, selectedTarget, exercises, allExercises]);

  const openExercise = (item: Exercise) => {
    router.push({
      pathname: "/exercise/[id]",
      params: { id: item.id },
    });
  };

  return (
    <View style={styles.container}>

      {/* 🔥 TOP: Dos tarjetas grandes */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.bigCard}
          onPress={() => router.push("/routines")}
        >
          <Text style={styles.bigCardIcon}>🏋️</Text>
          <Text style={styles.bigCardTitle}>Rutinas</Text>
          <Text style={styles.bigCardSub}>Ver rutinas guardadas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bigCard}
          onPress={() => router.push("/routines/new")}
        >
          <Text style={styles.bigCardIcon}>➕</Text>
          <Text style={styles.bigCardTitle}>Crear Rutina</Text>
          <Text style={styles.bigCardSub}>Arma tu propia rutina</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Busca ejercicios 💪</Text>

      {/* Buscador */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Buscar..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "#fff" }}>Filtros</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openExercise(item)}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.sub}>{item.bodyPart} • {item.target}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal filtro */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecciona un músculo</Text>

            <FlatList
              data={targets}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    selectedTarget === item && styles.chipSelected
                  ]}
                  onPress={() => {
                    setSelectedTarget(item);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedTarget === item && styles.chipTextSel
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  /* 🔥 NUEVOS ESTILOS TOP */
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  bigCard: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 5,
  },
  bigCardIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  bigCardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  bigCardSub: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },

  /* Título y búsqueda */
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  searchRow: { flexDirection: "row" },
  searchInput: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
  },
  filterButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 8,
  },

  /* Cards de ejercicios */
  card: {
    padding: 14,
    marginVertical: 6,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  exerciseName: { fontWeight: "700", fontSize: 16 },
  sub: { color: "#666" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000077",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  chip: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 12,
    marginVertical: 4,
  },
  chipSelected: { backgroundColor: "#007AFF" },
  chipText: { fontSize: 16 },
  chipTextSel: { color: "#fff" },
  closeModal: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
