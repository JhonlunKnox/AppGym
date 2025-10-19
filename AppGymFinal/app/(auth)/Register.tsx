import { Link } from 'expo-router';
import { StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  return (
    <ThemedView style={styles.container}>

      <Link href="../../" dismissTo style={[styles.link2, styles.backButton]}> 
      <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>
      
      <ThemedText type="title">This is the Register screen</ThemedText>
      <ThemedView style={styles.linkContainer}> 
        <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
        />
        </ThemedView>
      <Link href="../(initialdata)/Welcome" dismissTo style={[styles.link1, styles.button]}>
        <ThemedText type="default" style={styles.buttonText}>Registrarse</ThemedText>
      </Link>
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
  
  inputContainer: {
  width: '120%',
  marginBottom: 20,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 12,
  },
  
  // link1 rellena todo mas link 2 lo q hace es q se ajusta pa q lo tengas en cuenta bro
  link1: {
    width: '100%',
    marginTop: 20,
  },
  link2: {
    margin:15,
    paddingVertical: 15,
  },
  
  button: {
    backgroundColor: '#ca1818ff', 
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center', 
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
    backgroundColor: '#fc0000ff', 
    position: 'absolute', 
    top: 25,
    left: 10,
  },
});