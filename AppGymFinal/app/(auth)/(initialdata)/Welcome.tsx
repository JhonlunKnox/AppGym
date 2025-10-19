import { Image } from 'expo-image';
import {StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { Link } from 'expo-router';

const imggymh='https://media.gq.com.mx/photos/62863225500ac81936c484e4/16:9/w_2560%2Cc_limit/pesas.jpg';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
        style={styles.image}
        source={imggymh}
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
          WELCOME TO THE GYM APP
        </ThemedText>
      </ThemedView>
      <ThemedText>This app will help you in your fitness road.</ThemedText>
      <Link href="../Personaldata" dismissTo style={[styles.link, styles.button]}>
              <ThemedText type="default" style={styles.buttonText}>Continuar</ThemedText>
            </Link>
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
  button: {
    backgroundColor: '#000000ff', 
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center', 
    borderColor: '#ffffff',
    borderWidth: 1,
  },
  buttonText:{
    color: '#ffffffff', 
    textAlign: 'center',
  },
  link: {
    width: '100%',
    marginTop: 20,
  }
  
});
