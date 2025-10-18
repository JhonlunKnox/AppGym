import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const imgrango='https://i.ytimg.com/vi/KW3pW2tAjKI/maxresdefault.jpg';
export default function HomeScreen() {
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
    backgroundColor: 'rgba(153, 50, 212, 0.46)',
  }
});
