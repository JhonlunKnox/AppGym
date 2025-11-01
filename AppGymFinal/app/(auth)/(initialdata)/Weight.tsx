import { Link, useRouter } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useCommunication } from '@/contexts/comunicationcontext';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const [weight, setWeight] = useState('');
  const { updateusuario } = useCommunication();
  const router = useRouter();

  const handleWeightChange = (text: string) => {
    // Replace commas with dots
    let filtered = text.replace(',', '.');
    
    // Filter out non-numeric characters except dot
    filtered = filtered.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = filtered.split('.');
    if (parts.length > 2) {
      filtered = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      filtered = parts[0] + '.' + parts[1].slice(0, 2);
    }

    setWeight(filtered);
  };

  const handleContinue = async () => {
    if (!weight) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your weight',
      });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 250) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Weight',
        text2: 'Please enter a weight between 30 and 250 kg',
      });
      return;
    }

    try {
      await updateusuario('weight', weightNum);
      Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'Peso guardado correctamente' });
      router.push('../Build');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save weight',
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Link href="../Height" dismissTo style={[styles.link2, styles.backButton]}> 
        <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>

      <ThemedText type="title">What's your weight</ThemedText>
      
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={handleWeightChange}
          keyboardType="decimal-pad"
          placeholder="Enter weight in kg"
          placeholderTextColor="#666"
        />
        <ThemedText type="default" style={styles.unit}>kg</ThemedText>
      </ThemedView>

      <ThemedView style={styles.linkContainer}> 
        <TouchableOpacity onPress={handleContinue} style={[styles.link, styles.button]}>
          <ThemedText type="default" style={styles.buttonText}>Continue</ThemedText>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#ffffff',
    marginRight: 10,
  },
  unit: {
    fontSize: 18,
    color: '#ffffff',
    marginLeft: 5,
  },
  linkContainer: {
    marginTop: 40, 
    width: '80%', 
    alignItems: 'center', 
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