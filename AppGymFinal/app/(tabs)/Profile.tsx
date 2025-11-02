import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useCommunication } from '@/contexts/comunicationcontext';
import { useAuth } from '@/providers/authprovider';
import Toast from 'react-native-toast-message';
import useImagePickerAndUpload from '@/hooks/useImagePickerAndUpload';


export default function ProfileScreen() {

  const { pickImageAndUpload,isUploading, uploadError } = useImagePickerAndUpload();
  const { updateusuario, getfromusuario} = useCommunication();
  const [uploadedMsg, setUploadedMsg] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const { cleanupAndLogout } = useAuth();
  const [gender, setgender] = useState<string | null>(null);
  const [saludo, setsaludo] = useState<string | null>(null);



    useEffect(() => {
    const loadUsergender = async () => {
      try {
        const usergender = await getfromusuario(['gender']);
        if (usergender && usergender.gender) {
          setgender(usergender.gender);
        }
        if(usergender.gender=='female'){
          setsaludo('Bienvenida');
        }else{
          setsaludo('Bienvenido');
        }
      } catch (error) {
        console.error('Error loading user gender:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsergender();
  }, []);

  const handleSetDefault = async () => {
    try {

        await updateusuario('profile_pic_url', 'https://thumbs.dreamstime.com/b/figura-fuerte-levantando-ejercicio-pesado-de-elevaci%C3%B3n-pesas-en-barbell-ilustraci%C3%B3n-d-una-hombre-haciendo-un-ascensor-barbacoa-388582634.jpg'); 
        Toast.show({ type: 'success', text1: 'Imagen borrada' });
        loadProfilepic();
    } catch (error) {

    }
 };

  const handlePick = async () => {
    setUploadedMsg(null);
    const res = await pickImageAndUpload({ fileName: 'profile.jpg', overwrite: true });
    if (res && res.publicUrl) { 
      const baseUrl = res.publicUrl;
      const uniqueUrl = `${baseUrl}?t=${new Date().getTime()}`;
      try {
        await updateusuario('profile_pic_url', uniqueUrl); 
        setProfileUrl(uniqueUrl); 
        setUploadedMsg('Avatar saved');
        Toast.show({
          type: 'success',
          text1: uploadedMsg!,
          text2: 'Your avatar has been updated.'
        });

      } catch (err: any) {
        setUploadedMsg('Saved to storage but failed to update profile');
        Toast.show({
          type: 'error',
          text1: uploadedMsg!,
          text2: 'Your avatar hasn´t been updated.'
        });
      }
    }
  };

    const loadProfilepic = async () => {
      setProfileLoading(true);
      try {
        const data = await getfromusuario(['profile_pic_url']);
        setProfileUrl(data?.profile_pic_url || null);
      } catch (err) {
        console.warn('Failed to load profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
  
    useEffect(() => {
      loadProfilepic();
    }, []);
  
  const handleLogout = async () => {
    try {
      await cleanupAndLogout();
      Toast.show({
        type: 'success',
        text1: 'Sesión cerrada',
        text2: 'Has cerrado sesión correctamente'
      });
    } catch (error) {
      console.error('Error durante el logout:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cerrar la sesión'
      });
    }
  };
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getfromusuario(['username']);
        if (userData && userData.username) {
          setUsername(userData.username);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);


return (
    <ThemedView style={{ flex: 1 }}> 
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={
                <Image
                    style={styles.image}
                    source={profileUrl}
                    contentFit="cover"
                    transition={1000}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText
                    type="title"
                    style={{ fontFamily: Fonts.rounded }}>
                    {loading ? 'Cargando...' : `¡${saludo} ${username}!`}
                </ThemedText>
            </ThemedView>
            <ThemedText>This app includes example code to help you get started.</ThemedText>
            <TouchableOpacity onPress={handlePick} style={styles.uploadButton} disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator color="#ffffffff" />
              ) : (
                <ThemedText type="default" style={styles.buttonText}>Pick & Upload Avatar</ThemedText>
              )}
            </TouchableOpacity>
                        <TouchableOpacity onPress={handleSetDefault} style={styles.uploadButton} disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator color="#ffffffff" />
              ) : (
                <ThemedText type="default" style={styles.buttonText}>Delete profile pic</ThemedText>
              )}
            </TouchableOpacity>


        </ParallaxScrollView>

        <TouchableOpacity 
            onPress={handleLogout}
            activeOpacity={0.8}
            style={styles.button2}>
            <ThemedText type="default" style={styles.buttonText}>Log Out</ThemedText>
        </TouchableOpacity>
    </ThemedView>
);
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(71, 71, 71, 0.86)',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
    button2:{
    backgroundColor: '#ff0000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    position: 'absolute', 
    bottom: 20,           
    alignSelf: 'center',
    
  },
  buttonText:{
    color: '#ffffffff', 
    textAlign: 'center',
  },
    uploadButton: {
    backgroundColor: '#ca1818',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  
});
