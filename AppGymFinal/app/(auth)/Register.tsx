import { Link } from 'expo-router';
import { StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  return (
    <ThemedView style={styles.container}>

      <Link href="../../" dismissTo style={[styles.link, styles.button1]}> 
        <Ionicons name="chevron-back" size={15} color="#FFFFFF" />
        <ThemedText style={styles.backText}>Atrás</ThemedText>
      </Link>
      
      <ThemedText type="title">This is the Register screen</ThemedText>
      <ThemedView style={styles.linkContainer}> 
        <TextInput style={styles.input} placeholder="Escribe tu nombre aquí" />
      <Link href="/Welcome" dismissTo style={[styles.link, styles.button]}>
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

  button1:{
    backgroundColor: '#ff0000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  
  linkContainer: {
    marginTop: 40, 
    width: '80%', 
    alignItems: 'center', 
  },
  

  input: {
    width: '100%', 
    height: 40,
    borderWidth: 1,
    borderColor: '#CCC', 
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15, 
    backgroundColor: '#FFFFFF', 
  },
  
  
  link: {
    width: '100%',
    marginTop: 20,
  },
  
 
  button: {
    backgroundColor: '#5CB85C', 
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center', 
  },
 
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});