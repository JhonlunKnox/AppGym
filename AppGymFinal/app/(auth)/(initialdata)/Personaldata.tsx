import { Link, router } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect } from 'react';
import { useCommunication } from '@/contexts/comunicationcontext';
import { supabase } from '@/utils/supabase';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const { updateusuario, userId } = useCommunication();
  const [isUpdating, setIsUpdating] = useState(false);
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [usuario, setUsuario] = useState('');

  useEffect(() => {
    // Limpiar los campos al montar el componente
    const clearFields = async () => {
      try {
        await AsyncStorage.multiRemove(['@form_nombres', '@form_apellidos', '@form_usuario']);
        setNombres('');
        setApellidos('');
        setUsuario('');
      } catch (error) {
        console.error('Error clearing fields:', error);
      }
    };
    clearFields();
  }, []);

  const handleSave = async () => {
    if (!nombres.trim() || !apellidos.trim() || !usuario.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor completa todos los campos'
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Actualizamos los tres campos
      await updateusuario('nombres', nombres.trim());
      await updateusuario('apellidos', apellidos.trim());

      // Verificar si el username ya existe en otra cuenta
      const username = usuario.trim();
      if (username) {
        const { data: existing, error: checkError } = await supabase
          .from('usuario')
          .select('user_id')
          .eq('username', username)
          .maybeSingle();

        if (checkError) {
          console.warn('Error checking username availability:', checkError);
        }

        if (existing && existing.user_id && existing.user_id !== userId) {
          throw new Error('El nombre de usuario ya está en uso por otra cuenta.');
        }

        // Si no existe o pertenece al mismo userId, actualizamos
        await updateusuario('username', username);
      }
      
      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Datos personales actualizados correctamente'
      });
      
      // Navegamos a la siguiente pantalla
      router.push('../Gender');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Ocurrió un error al actualizar los datos'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Let us know you</ThemedText>
      <ThemedView style={styles.linkContainer}> 
        <TextInput 
          style={styles.input} 
          placeholder="Escribe tus nombres" 
          placeholderTextColor="#999"
          value={nombres}
          onChangeText={setNombres}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Escribe tus apellidos"
          placeholderTextColor="#999"
          value={apellidos}
          onChangeText={setApellidos}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Escribe tu usuario"
          placeholderTextColor="#999"
          value={usuario}
          onChangeText={setUsuario}
        />
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isUpdating}
          style={[styles.link, styles.button]}>
          <ThemedText type="default" style={styles.buttonText}>
            {isUpdating ? "Guardando..." : "Continuar"}
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
    width: '80%', 
    alignItems: 'center', 
  },
  

  input: {
    width: '100%', 
    height: 40,
    borderWidth: 1,
    borderColor: '#ffffff40', 
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15, 
    backgroundColor: '#ffffff20',
    color: '#ffffff',
  },
  
  
  link: {
    width: '100%',
    marginTop: 20,
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
});