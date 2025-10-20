import { Image } from 'expo-image';
import {StyleSheet, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { supabase } from '@/utils/supabase';

const logout = () =>{
  supabase.auth.signOut();
}
const imgprofile='https://lamenteesmaravillosa.com/wp-content/uploads/2021/01/poseidon-dios-griego.jpg?auto=webp&quality=7500&width=1920&crop=16:9,smart,safe&format=webp&optimize=medium&dpr=2&fit=cover&fm=webp&q=75&w=1920&h=1080';
export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
        style={styles.image}
        source={imgprofile}
        contentFit="cover"
        transition={1000}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          PROFILE
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
          <TouchableOpacity onPress={logout}
          activeOpacity={0.8}
          style={[styles.button2]}>
          <ThemedText type="default" style={styles.buttonText}>LogOut</ThemedText>
          </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(179, 187, 156, 0.86)',
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
  },
  buttonText:{
    color: '#ffffffff', 
    textAlign: 'center',
  },
  
});
