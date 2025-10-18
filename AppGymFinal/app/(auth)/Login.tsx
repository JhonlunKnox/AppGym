import { Link } from 'expo-router';
import { StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';


export default function LogingScreen() {
  return (
    <ThemedView style={styles.container}>

      <Link href="../../" dismissTo style={[styles.link, styles.button1]}> 
        <Ionicons name="chevron-back" size={15} color="#FFFFFF" />
        <ThemedText style={styles.backText}>Atrás</ThemedText>
      </Link>



      <ThemedText type="title" style={styles.title}>This is the login screen</ThemedText>

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


      <ThemedView style={styles.linkContainer}> 
      <Link href="../(tabs)/Profile" dismissTo style={[styles.link, styles.button1]}> 
        <ThemedText type="default" style={styles.buttonText}>Login</ThemedText>
      </Link>
      <Link href="/Register" dismissTo style={[styles.link, styles.button2]}>
        <ThemedText type="default" style={styles.buttonText}>Register</ThemedText>
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
  button2:{
    backgroundColor: '#000000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText:{
    color: '#ffffffff', 
    textAlign: 'center',
  },
  linkContainer: {
    marginTop: 30, 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    width: '100%', 
  },
  link: {
    margin:15,
    paddingVertical: 15,
  },

  title: {
    marginBottom: 100,
  },

  inputContainer: {
  width: '100%',
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
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
  }
});
