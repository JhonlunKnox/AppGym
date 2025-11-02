import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import useImagePickerAndUpload from '@/hooks/useImagePickerAndUpload';
import { useCommunication } from '@/contexts/comunicationcontext';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const imgrango='https://i.ytimg.com/vi/KW3pW2tAjKI/maxresdefault.jpg';
export default function HomeScreen() {
  const { pickImageAndUpload,isUploading, uploadError } = useImagePickerAndUpload();
  const { updateusuario, getfromusuario } = useCommunication();
  const [uploadedMsg, setUploadedMsg] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

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

      } catch (err: any) {
        setUploadedMsg('Saved to storage but failed to update profile');
      }
    }
  };

  const loadProfile = async () => {
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
    loadProfile();
  }, []);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
                  source={imgrango}
                  contentFit="cover"
                  transition={1000}
                  style={styles.image}
                />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Training today?</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Step 2: Explore</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Example: upload avatar</ThemedText>
        {/* Profile picture box (from DB) */}
        <ThemedView style={styles.avatarBox}>
          {profileLoading ? (
            <ActivityIndicator />
          ) : (
            <Image
              source={profileUrl || 'https://via.placeholder.com/300x300.png?text=No+Avatar'}
              style={styles.avatarImage}
              contentFit="cover"
            />
          )}
        </ThemedView>
        <ThemedView style={[styles.titleContainer, styles.urlContainer]}>
          <ThemedText style={styles.urlText} type="default">
            {profileUrl || 'No profile image'}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity onPress={handlePick} style={styles.uploadButton} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#ffffffff" />
          ) : (
            <ThemedText type="default" style={styles.buttonText}>Pick & Upload Avatar</ThemedText>
          )}
        </TouchableOpacity>
        {uploadError ? <ThemedText type="default">Error: {uploadError}</ThemedText> : null}
        {uploadedMsg ? <ThemedText type="default">{uploadedMsg}</ThemedText> : null}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#222',
  },
  avatarBox: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    backgroundColor: '#ca1818',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(153, 50, 212, 0.46)',
  },
  urlContainer: {
    marginTop: 4,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  urlText: {
    fontSize: 12,
    opacity: 0.7,
    flexShrink: 1,
  }
});
