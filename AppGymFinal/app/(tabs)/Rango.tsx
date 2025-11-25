import { Image } from 'expo-image';
import { StyleSheet, ScrollView, View ,TouchableOpacity, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useCommunication } from '@/contexts/comunicationcontext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

const RED_ACCENT = '#CA1818';

const RANK_THRESHOLDS = [
  { rank: 'PRINCIPIANTE', minPoints: 0 },
  { rank: 'INTERMEDIO', minPoints: 150 },
  { rank: 'AVANZADO', minPoints: 300 },
  { rank: 'ESTETICO', minPoints: 750 },
  { rank: 'MR OLYMPIA', minPoints: 1500 },
];

/**
 * Validates the user's points against rank thresholds, updates rank if necessary,
 * and returns the new rank.
 */
export async function validateAndUpdateRank(
  puntos: number,
  rangoActual: string,
  updateusuario: (fieldNameOrObject: string | Record<string, any>, newValue?: any) => Promise<any> | null
): Promise<string> {
  let newRank = 'PRINCIPIANTE';

  // Iterate thresholds in ascending order, assign highest rank user qualifies for
  for (const threshold of RANK_THRESHOLDS) {
    if (puntos >= threshold.minPoints) {
      newRank = threshold.rank;
    } else {
      break; // No need to check further if puntos < minPoints
    }
  }

  if (newRank !== rangoActual) {
    try {
      await updateusuario('rango', newRank);
    } catch (error) {
      console.warn('Fallo al actualizar rango en BD:', error);
    }
  }
  return newRank;
}

export default function ProfileScreenTemplate() {
  const { getfromusuario, updateusuario } = useCommunication();
  const [puntos, setPuntos] = useState<number | null>(null);
  const [rango, setRango] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Calculates progress towards the next rank as a number between 0 and 1.
   * Returns 1 if at highest rank or puntos is not set.
   */
  const getProgress = () => {
    if (puntos === null) return 0;

    // Find the current rank threshold user qualifies for
    let currentIndex = 0;
    for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
      if (puntos >= RANK_THRESHOLDS[i].minPoints) {
        currentIndex = i;
      } else {
        break; // puntos less than this threshold's minPoints, stop loop
      }
    }

    const current = RANK_THRESHOLDS[currentIndex];
    const next = RANK_THRESHOLDS[currentIndex + 1];

    // If no next rank, progress is complete
    if (!next) return 1;

    const range = next.minPoints - current.minPoints;
    if (range <= 0) return 1; // Prevent division by zero or invalid range

    const progress = puntos - current.minPoints;

    return Math.min(Math.max(progress / range, 0), 1);
  };

  /**
   * Calculates points missing to reach the next rank.
   * Returns 0 if at highest rank or puntos is not set.
   */
  const getPointsToNextRank = (): number => {
    if (puntos === null) return 0;

    // Find the current rank threshold user qualifies for
    let currentIndex = 0;
    for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
      if (puntos >= RANK_THRESHOLDS[i].minPoints) {
        currentIndex = i;
      } else {
        break;
      }
    }

    const next = RANK_THRESHOLDS[currentIndex + 1];
    if (!next) return 0;

    const pointsNeeded = next.minPoints - puntos;
    return pointsNeeded > 0 ? pointsNeeded : 0;
  };


  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const puntosData = await getfromusuario('puntos');
        const rangoData = await getfromusuario('rango');

        setPuntos(puntosData?.puntos ?? null);
        setRango(rangoData?.rango ?? null);
      } catch (err: any) {
        setError(err.message || 'Error al obtener datos');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [getfromusuario]);

  const handleValidateRank = async () => {
    if (puntos === null || rango === null) return;

    try {
      const newRank = await validateAndUpdateRank(puntos, rango, updateusuario);
      setRango(newRank);
    } catch (err: any) {
      setError(err.message || 'Error al validar rango');
    }
  };

  const getRangoImage = () => {
    switch ((rango ?? '').toUpperCase()) {
      case 'PRINCIPIANTE':
        return require('@/assets/images/RANGO 1s.png');
      case 'INTERMEDIO':
        return require('../../assets/images/INTERMEDIOs.png');
      case 'AVANZADO':
        return require('../../assets/images/AVANZADOs.png');
      case 'ESTETICO':
        return require('../../assets/images/ESTETICOs.png');
      case 'MR OLYMPIA':
        return require('../../assets/images/MR OLYMPIAs.png');
      default:
        return require('@/assets/images/RANGO 1s.png');
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const puntosData = await getfromusuario('puntos');
      const rangoData = await getfromusuario('rango');
      setPuntos(puntosData?.puntos ?? null);
      setRango(rangoData?.rango ?? null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al obtener datos');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.profileHeaderContainer}>
          <View style={styles.headerTopRow}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title" style={styles.titleText}>
                {loading ? 'Cargando...' : rango ?? 'Desconocido'}
              </ThemedText>
            </ThemedView>
          </View>
          <Image
            style={styles.image}
            source={getRangoImage()}
            transition={1000}
          />
        </ThemedView>

        <ThemedView style={[styles.infoBlock, styles.attributeBlock]}>
          <ThemedText style={[styles.blockTitle, styles.centeredTitle]}>
            TU AVANCE
          </ThemedText>
          <ThemedText style={styles.blockText}>
            {loading ? 'Cargando puntos...' : `Puntos: ${puntos ?? 'No disponibles'}`}
          </ThemedText>
          {!loading && puntos !== null && (
            <ThemedText style={styles.blockText}>
              {getPointsToNextRank() > 0
                ? `Faltan ${getPointsToNextRank()} puntos para el siguiente rango.`
                : '¡Has alcanzado el rango máximo!'}
            </ThemedText>
          )}
          <View style={styles.progressWrapper}>
  <View style={styles.progressGlow}>
    <View
      style={[
        styles.progressFill,
        { width: `${getProgress() * 100}%` }
      ]}
    />
  </View>

  <ThemedText style={styles.progressText}>
    {`${Math.round(getProgress() * 100)}% DE ${rango?.toUpperCase()}`}
  </ThemedText>
</View>

          <TouchableOpacity
            onPress={handleValidateRank}
            style={styles.menuButton}
            accessibilityLabel="Toggle dropdown menu"
          >
            <ThemedText style={styles.menuButtonText}>Validar Rango</ThemedText>
          </TouchableOpacity>
          {error && <ThemedText style={[styles.blockText, { color: 'red' }]}>{error}</ThemedText>}

        </ThemedView>

        <ThemedView style={styles.infoBlock}>
          <ThemedText style={styles.blockTitle}>COMO FUNCIONA?</ThemedText>
          <ThemedText style={styles.blockText}>
            {"Para subir de nivel y desbloquear los siguientes rangos en la aplicación, debes acumular Puntos de Experiencia (PX).\n\n"}
            {"Tu progreso se mide por la superación y la disciplina:\n\n"}
            {"Aumenta la Carga: La forma más efectiva de ganar PX es registrando el aumento de pesos que levantas en tus ejercicios. La fuerza que ganas se convierte en puntos.\n\n"}
            {"Sé Constante: Gana PX por cada entrenamiento completado y recibe bonificaciones por mantener una racha de días activos.\n\n"}
            {"Los rangos se disponen de la siguiente manera: \n\n"}
          </ThemedText>

          <Image
            style={styles.rankImage}
            source={require('@/assets/images/PRINCIPIANTE.jpg')}
            transition={1000}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 40,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 280, 
    aspectRatio: 1,
    resizeMode: 'contain', 
    borderRadius: 999, 
  },
  titleContainer: {
    margin: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  titleText: {
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  menuButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ca1818',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoBlock: {
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
  },
  attributeBlock: {
    marginTop: 0,
    marginBottom: 20,
  },
  blockTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED_ACCENT,
    marginBottom: 10,
  },
  progressContainer: {
  marginTop: 20,
  width: '100%',
  alignItems: 'center',
},

progressWrapper: {
  width: '100%',
  marginTop: 20,
  alignItems: 'center',
},

progressGlow: {
  // *CORRECCIÓN 1: Quitar 'position: absolute'*
  // position: 'absolute', 

  // *CORRECCIÓN 2: Darle dimensiones para que sea visible (el fondo de la barra)*
  width: '90%', // Ancho de la barra completa
  height: 22, // Altura de la barra
  
  // Este será el fondo de la barra visible
  backgroundColor: 'rgba(255,255,255,0.08)', // Color de fondo (vacío)
  borderRadius: 20,
  overflow: 'hidden', // Muy importante para el relleno
  
  // Sombra (puedes mover esto al .progressFill si solo quieres la sombra en el relleno)
  shadowColor: '#CA1818', 
  shadowOpacity: 0.9,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 0 },
},

progressFill: {
  height: '100%',
  backgroundColor: '#CA1818', // Color del relleno (progreso)
  borderRadius: 20,
},

progressText: {
  marginTop: 8,
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

  rankImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    borderRadius: 50,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  centeredTitle: {
    textAlign: 'center',
  },
  blockText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  subscriptionText: {
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  attributeLabel: {
    color: RED_ACCENT,
  },
  attributeValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
