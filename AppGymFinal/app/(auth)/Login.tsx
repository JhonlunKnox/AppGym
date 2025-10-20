import { Link, router } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import {supabase} from "@/utils/supabase";


export default function LoginScreen() {
  const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false); 
  
    const handleLogin = useCallback(async () => {

    if (!email?.trim() || !password?.trim()) {
    Toast.show({ 
      type: 'error', 
      text1: 'Campos vacíos', 
      text2: 'Por favor, completa todos los campos.' 
    });
    return;
    }

    setIsAuthenticating(true);

    try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (loginError) {
      Toast.show({ 
        type: 'error', 
        text1: 'Error de Autenticación', 
        text2: loginError.message || 'Credenciales inválidas.' 
      });
      return;
    }

    Toast.show({ 
      type: 'success', 
      text1: '¡Login Exitoso!', 
      text2: 'Bienvenido a la app.' 
    });
    
 

    } catch (error: any) {
    const errorMessage = error?.message || 'No se pudo conectar con el servidor.';
    
    Toast.show({ 
      type: 'error', 
      text1: 'Error de Conexión', 
      text2: errorMessage 
    });   

    } finally {
    setIsAuthenticating(false);
    }
    }, [email, password]);

  return (
    <ThemedView style={styles.container}>

      <Link href="../../" dismissTo style={[styles.link, styles.backButton]}> 
        <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>



      <ThemedText type="title" style={styles.title}>This is the login screen</ThemedText>

      <ThemedView style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#A0A0A0"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#A0A0A0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Link href="../Forgotpassword" dismissTo > 
        <ThemedText type="title" style={styles.forgotPasswordText}>Olvidaste tu contraseña?</ThemedText>
      </Link>
    </ThemedView>

   
    



      <ThemedView style={styles.linkContainer}> 
      </ThemedView>
      <TouchableOpacity 
        onPress={handleLogin} 
        disabled={isAuthenticating}
        activeOpacity={0.8}
        style={[
          styles.button1, 
          styles.link,
          isAuthenticating && { opacity: 0.6 }
        ]}>
        {isAuthenticating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText type="default" style={styles.buttonText}>Login</ThemedText>
        )}
      </TouchableOpacity>
      <Link href="/Register" dismissTo style={[styles.link, styles.button2]}>
        <ThemedText type="default" style={styles.buttonText}>Register</ThemedText>
      </Link>
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
    width:270,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  button2:{
    backgroundColor: '#000000ff',
    width:270,
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
  forgotPasswordText: {
    color: '#ffffffff', 
    fontSize: 14,
    textDecorationLine: 'underline',
    paddingVertical: 5, 
  },
  forgotPasswordContainer: {
    width: '105%', 
    alignItems: 'flex-start', 
    paddingHorizontal: 10,
  },
});
