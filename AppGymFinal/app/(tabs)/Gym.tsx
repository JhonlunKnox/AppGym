import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const imggymh='https://media.gq.com.mx/photos/62863225500ac81936c484e4/16:9/w_2560%2Cc_limit/pesas.jpg';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
       <Image
               style={styles.image}
               source={imggymh}
               contentFit="cover"
               transition={1000}
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
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(167, 165, 168, 0.69)',
  }
});
