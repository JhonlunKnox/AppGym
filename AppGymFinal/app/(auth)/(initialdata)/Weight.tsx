import { Link } from 'expo-router';
import { StyleSheet, } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  return (
    <ThemedView style={styles.container}>

    <Link href="../Height" dismissTo style={[styles.link2, styles.backButton]}> 
        <Ionicons name="chevron-back" size={15} color="#ffffffff" />
      </Link>

      <ThemedText type="title">What's your weight</ThemedText>
      <ThemedView style={styles.linkContainer}> 
      <Link href="../Build" dismissTo style={[styles.link, styles.button]}>
        <ThemedText type="default" style={styles.buttonText}>Continuar</ThemedText>
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
  
  linkContainer: {
    marginTop: 40, 
    width: '80%', 
    alignItems: 'center', 
  },
  link: {
    width: '100%',
    marginTop: 20,
  },
  link2: {
    margin:15,
    paddingVertical: 15,
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
    backButton: {
    flexDirection: 'row',    
    alignItems: 'center',   
    paddingVertical: 8,       
    paddingHorizontal: 15,    
    borderRadius: 20,         
    backgroundColor: '#ca1818ff', 
    position: 'absolute', 
    top: 25,
    left: 10,
  },
});