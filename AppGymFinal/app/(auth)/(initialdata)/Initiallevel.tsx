import { Link, router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useCommunication } from '@/contexts/comunicationcontext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const { updateusuario } = useCommunication();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Función para limpiar los datos temporales
  const clearTemporaryData = async () => {
    try {
      // Limpiar todos los datos temporales del AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const tempDataKeys = keys.filter(key=> key.startsWith('@tempForm_'));
      if (tempDataKeys.length > 0) {
        await AsyncStorage.multiRemove(tempDataKeys);
      }
    } catch (error) {
      console.error('Error clearing temporary data:', error);
    }
  };

  const options = [
    { key: 'beginner', label: 'Principiante' },
    { key: 'intermediate', label: 'Medio' },
    { key: 'advanced', label: 'Avanzado' },
  ];

  const handleContinue = async () => {
    if (!selectedLevel) {
      Toast.show({
        type: 'error',
        text1: 'Select your level',
        text2: 'Please select your experience level to continue'
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateusuario('initial_level', selectedLevel);
      // Limpiar los datos temporales y de formulario
      await clearTemporaryData();
      const keys = await AsyncStorage.getAllKeys();
      const formKeys = keys.filter(key => key.startsWith('@form_'));
      if (formKeys.length > 0) {
        await AsyncStorage.multiRemove(formKeys);
      }
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Your level has been saved.'
      });
      router.push('../../(tabs)/Profile');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An unknown error occurred.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Link href="../Goal" dismissTo style={[styles.link2, styles.backButton]}> 
        <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>

      <ThemedText type="title">What's your starter point</ThemedText>
      <ThemedView style={styles.linkContainer}> 
        <View style={styles.optionsRow}>
          {options.map(opt => {
            const isSelected = selectedLevel === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSelectedLevel(opt.key)}
                style={[
                  styles.optionButton,
                  isSelected ? styles.optionSelected : null,
                ]}
                disabled={isUpdating}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={styles.selectedText.color} style={styles.checkIcon} />
                )}
                <ThemedText type="default" style={[styles.buttonText, isSelected && styles.selectedText]}>
                  {opt.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          onPress={handleContinue}
          disabled={isUpdating}
          style={[styles.link, styles.button]}
        >
          <ThemedText type="default" style={styles.buttonText}>
            {isUpdating ? 'Saving...' : '¡Comenzar!'}
          </ThemedText>
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
    width: '85%', 
    alignItems: 'center', 
  },
  optionsRow: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff40',
    backgroundColor: '#00000033',
    marginVertical: 6,
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
    margin: 15,
    paddingVertical: 15,
  },
  button: {
    backgroundColor: '#ca1818ff', 
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
    fontSize: 18,
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