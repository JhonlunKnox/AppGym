import { Link, router } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import {supabase} from "@/utils/supabase";

export default function RegisterScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false); 

  const handleRegister = useCallback(async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Campos vacíos', text2: 'Por favor, completa todos los campos.' });
      return;
    }
    setIsAuthenticating(true);
    
    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signupError) {
        throw signupError;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (loginError) {
        throw loginError;
      }
      Toast.show({ type: 'success', text1: '¡Registro Exitoso!', text2: 'Bienvenido a la app.' });
      router.replace('/(auth)/(initialdata)/Welcome'); 

    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Error de Registro', 
        text2: error.message || 'Ocurrió un error desconocido.' 
      });
      console.error('Error durante el registro:', error);
    }
    
    setIsAuthenticating(false);
  }, [email, password]); 

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
        </ThemedView>
      <TouchableOpacity 
        onPress={handleRegister} 
        disabled={isAuthenticating}
        activeOpacity={0.8}
        style={[
          styles.button, 
          isAuthenticating && { opacity: 0.6 }
        ]}>
        {isAuthenticating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText type="default" style={styles.buttonText}>Registrarse</ThemedText>
        )}
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

  link2: {
    margin:15,
    paddingVertical: 15,
  },
  
  button: {
    backgroundColor: '#ca1818ff', 
    paddingVertical: 15,
    borderRadius: 8,
    width:270,
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

