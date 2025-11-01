import { Link, router } from 'expo-router';
import { StyleSheet, TouchableOpacity, Alert, View } from 'react-native';
import {useState} from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useCommunication} from '@/contexts/comunicationcontext';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const { updateusuario } = useCommunication();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const options = [
    { key: 'cut', label: 'Cut' },
    { key: 'bulk', label: 'Bulk' },
    { key: 'rebuild', label: 'Rebuild' },
  ];

  const handleContinue = async () => {
    if (!selectedGoal) {
      Toast.show({ type: 'error', text1: 'Selecciona una meta', text2: 'Por favor elige Cut, Bulk o Rebuild' });
      return;
    }

    setIsUpdating(true);
    try {
      await updateusuario('goal', selectedGoal);
      Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'La meta ha sido actualizada.' });
      router.push('../Initiallevel');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Ocurrió un error desconocido.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>

      <Link href="../Build" dismissTo style={[styles.link2, styles.backButton]}> 
        <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>

      <ThemedText type="title">What's your Goal</ThemedText>
      <ThemedView style={styles.linkContainer}> 
        <View style={styles.optionsRow}>
          {options.map(opt => {
            const isSelected = selectedGoal === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSelectedGoal(opt.key)}
                style={[
                  styles.optionButton,
                  isSelected ? styles.optionSelected : null,
                ]}
                disabled={isUpdating}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={styles.selectedText.color} style={styles.checkIcon} />
                )}
                <ThemedText type="default" style={[styles.buttonText, isSelected && styles.selectedText]}>{opt.label}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          onPress={handleContinue}
          disabled={isUpdating}
          style={[styles.link, styles.button]}
        >
          <ThemedText type="default" style={styles.buttonText}>{isUpdating ? 'Guardando...' : 'Continuar'}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  
  linkContainer: {
    marginTop: 40, 
    width: '80%', 
    alignItems: 'center', 
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    // gap is not supported on all RN versions; spacing handled on optionButton
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff40',
    backgroundColor: '#00000033',
    marginHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#ca1818',
    borderColor: '#ca1818',
  },
  selectedText: {
    color: '#ffffff',
  },
  checkIcon: {
    marginRight: 8,
  },
  link: {
    width: '100%',
    marginTop: 20,
  },
  link2: {
    margin:15,
    paddingVertical: 15,
  },
  button: {
    backgroundColor: '#000000ff', 
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center', 
    borderColor: '#ffffff',
    borderWidth: 1,
  },
 
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
    backButton: {
    flexDirection: 'row',    
    alignItems: 'center',   
    paddingVertical: 8,       
    paddingHorizontal: 15,    
    borderRadius: 20,         
    backgroundColor: '#ca1818ff', 
    position: 'absolute', 
    top: 25,
    left: 10,
  },
});

