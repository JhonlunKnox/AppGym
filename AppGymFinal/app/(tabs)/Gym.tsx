import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { getExercisesByTarget, getTargetList, Exercise } from '../../api/exercises';

export default function GymScreen() {
  const [targets, setTargets] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar lista de músculos al iniciar
  useEffect(() => {
    getTargetList()
      .then(setTargets)
      .catch(console.error);
  }, []);

  // Buscar ejercicios cuando se selecciona un músculo
  useEffect(() => {
    if (selectedTarget) {
      setLoading(true);
      getExercisesByTarget(selectedTarget)
        .then((data) => setExercises(data.slice(0, 1))) // limitar a 10 para no sobrecargar
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedTarget]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un grupo muscular 💪</Text>

      <FlatList
        data={targets}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chip,
              selectedTarget === item && styles.chipSelected,
            ]}
            onPress={() => setSelectedTarget(item)}
          >
            <Text
              style={[
                styles.chipText,
                selectedTarget === item && styles.chipTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        style={{ marginVertical: 12 }}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.gifUrl }} style={styles.gif} />
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.subText}>
                {item.bodyPart} | {item.equipment}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  chip: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: { color: '#333', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  card: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  gif: { width: '100%', height: 200 },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 8,
    marginTop: 8,
  },
  subText: { color: '#666', marginHorizontal: 8 },
});
