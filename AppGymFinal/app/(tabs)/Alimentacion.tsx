import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const imgcomida='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSchS3SyjeD1JfZQCKYub-cWpN3PSgOOCfSA&s';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
        style={styles.image}
        source={imgcomida}
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
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
    image: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(42, 179, 24, 0.65)',
  }
  
});
