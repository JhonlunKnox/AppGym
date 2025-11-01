import { Link, router } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useCommunication } from '@/contexts/comunicationcontext';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const { updateusuario } = useCommunication();
  const [heightText, setHeightText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleContinue = async () => {
    const trimmed = heightText.trim();
    if (!trimmed) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa tu altura' });
      return;
    }
    // Allow decimals, replace comma with dot
    const normalized = trimmed.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (isNaN(parsed) || parsed <= 0) {
      Toast.show({ type: 'error', text1: 'Altura inválida', text2: 'Por favor ingresa un número válido' });
      return;
    }

    setIsUpdating(true);
    try {
      await updateusuario('height', parsed);
      Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'Altura guardada correctamente' });
      router.push('../Weight');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'No se pudo guardar la altura' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>

    <Link href="../Age" dismissTo style={[styles.link2, styles.backButton]}> 
        <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>

      <ThemedText type="title">What's your height</ThemedText>
      <ThemedView style={styles.linkContainer}> 
        <TextInput
          style={styles.input}
          placeholder="Escribe tu altura (ej. 1.74)"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
          value={heightText}
          onChangeText={(t) => setHeightText(t.replace(/[^0-9\.,]/g, ''))}
        />

        <TouchableOpacity onPress={handleContinue} disabled={isUpdating} style={[styles.link, styles.button]}>
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
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#ffffff40',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#ffffff20',
    color: '#ffffff',
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