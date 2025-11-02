import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { supabase } from '../utils/supabase'; 
import { useCommunication } from '@/contexts/comunicationcontext';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ;

const useImagePickerAndUpload = (bucketName = 'profilepics') => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { userId: ctxUserId } = useCommunication();

  const pickImageAndUpload = async (opts?: { previousPath?: string; fileName?: string; overwrite?: boolean }): Promise<{ publicUrl: string | null; path: string | null } | null> => {
    setUploadError(null);
    

    let user_id = ctxUserId;
    if (!user_id) {
      try {
        const { data } = await supabase.auth.getUser();
        user_id = data?.user?.id || null;
      } catch (err) {
        console.warn('Could not get user from supabase.auth.getUser():', err);
      }
    }

    if (!user_id) {
      Toast.show({ type: 'error', text1: 'Auth Error', text2: 'User not authenticated.' });
      return null;
    }

    // 2. Manejo de Permisos
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission || !permission.granted) {
      Toast.show({
        type: 'error', text1: 'Permission denied', text2: 'We need permission to access your photos.'
      });
      return null;
    }

    // 3. Selección de Imagen
    let pickerResult: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (pickerResult.canceled) {
      return null; 
    }

    const asset = pickerResult.assets && pickerResult.assets[0];
    if (!asset || !asset.uri) {
      return null;
    }

    const uri = asset.uri;
    setImageUri(uri); 
    
    setIsUploading(true);

    try {
      const fileExt = uri.substring(uri.lastIndexOf('.') + 1) || 'jpg';
      const generatedName = opts?.fileName || `${Date.now()}.${fileExt}`;
      const fileName = generatedName;
      const filePath = `${user_id}/${fileName}`;

      // Crear un FormData para la subida
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: `image/${fileExt}`,
        name: fileName,
      } as any);

      // Obtener la URL del bucket y el token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Construir la URL completa usando la variable de entorno
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`;

      // Subir usando fetch y FormData
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'x-upsert': opts?.overwrite ? 'true' : 'false',
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      // 5. Obtener URL Pública
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl || null;

      if (opts?.previousPath && opts.previousPath !== filePath) {
        try {
          await supabase.storage.from(bucketName).remove([opts.previousPath]);
        } catch (remErr) {
          console.warn('Failed to remove previous file:', remErr);
        }
      }
      

      setIsUploading(false);
      return { publicUrl, path: filePath };
      
    } catch (error: any) {
      console.error('Error al subir la imagen:', error);
      setUploadError('Fallo la subida: ' + error.message);
      setIsUploading(false);
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: error.message });
      return null;
    }
  };
  

  return {
    imageUri,       // URI local de la imagen seleccionada (para previsualización)
    isUploading,    // Estado de subida (booleano)
    uploadError,    // Error de subida (string o null)
    pickImageAndUpload, // Función para iniciar el proceso
  };
};

export default useImagePickerAndUpload;