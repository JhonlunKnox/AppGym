import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LogingScreen() {
  return (
    <ThemedView style={styles.container}>

      <ThemedText type="title">This is the login screen</ThemedText>

      <ThemedView style={styles.linkContainer}> 
      <Link href="../(tabs)/Profile" dismissTo style={[styles.link, styles.button1]}> 
        <ThemedText type="default" style={styles.buttonText}>Login</ThemedText>
      </Link>
      <Link href="/Register" dismissTo style={[styles.link, styles.button2]}>
        <ThemedText type="default" style={styles.buttonText}>Register</ThemedText>
      </Link>
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
  button1:{
    backgroundColor: '#ff0000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  button2:{
    backgroundColor: '#000000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText:{
    color: '#ffffffff', 
    textAlign: 'center',
  },
  linkContainer: {
    marginTop: 30, 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    width: '100%', 
  },
  link: {
    margin:15,
    paddingVertical: 15,
  },
});
