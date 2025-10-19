import { Link } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';


//ESTO ES PARA MOSTRAR MENSAJES TEMPORALES 
const msgConfirmacion = () => {
    Toast.show({
        type: 'error',
        text1: 'Correo de recuperacion enviado', 
        text2: 'Revise su correo para reestablecer la contraseña', 
        visibilityTime: 2500, 
    });
};

export default function LogingScreen() {
  return (
    <ThemedView style={styles.container}>

      <Link href="../Login" dismissTo style={[styles.link, styles.backButton]}> 
        <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>

      <ThemedText type="title" style={styles.title}>Have you forgot your password?</ThemedText>

      <ThemedView style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#A0A0A0"
        keyboardType="email-address"
      />      
    </ThemedView>
      <TouchableOpacity style={styles.button1} onPress={msgConfirmacion}> 
      <ThemedText type="default" style={styles.buttonText}>Enviar solicitud</ThemedText>
      </TouchableOpacity>
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
    margin:10,
  },
  title: {
    marginBottom: 100,
  },

  inputContainer: {
  width: '100%',
  
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
