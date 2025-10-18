import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import FontAwesome from '@expo/vector-icons/build/FontAwesome';

export default function MainScreen() {
  return (
    <ThemedView style={styles.container}>

      <ThemedText type="title" style={styles.title}>GYMAPP</ThemedText>

      <ThemedText type="subtitle" style={styles.subtitle}>Bienvenido</ThemedText>

      <ThemedView style={styles.linkContainer}> 
      <Link href="/(auth)/Login" dismissTo style={[styles.link, styles.button1]}> 
        <ThemedText type="default" style={styles.buttonText}>Iniciar Sesión</ThemedText>
      </Link>
      <Link href="/(auth)/Register" dismissTo style={[styles.link, styles.button2]}>
        <ThemedText type="default" style={styles.buttonText}>Registrarse</ThemedText>
      </Link>
      </ThemedView>

      <ThemedText type="default" style={styles.default}>Continuar Con</ThemedText>

      <View style={styles.iconContainer}>
        <FontAwesome name="google" size={20} color="#DB4437" style={styles.icon} />
        <FontAwesome name="apple" size={20} color="#000" style={styles.icon} />
        <Ionicons name="finger-print" size={17} color="#ff0000" style={styles.icon} />
      </View>

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
    paddingVertical: 10,
    paddingHorizontal: 30,
    justifyContent: 'center',
    borderRadius: 100,
    top: 70,
    marginLeft: 20,
    marginRight: 20,
    borderColor: '#ffffff',
    borderWidth: 1,
  },
  button2:{
    backgroundColor: '#000000ff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    justifyContent: 'center',
    borderRadius: 100,
    top: 70,
    marginLeft: 20,
    marginRight: 20,
    borderColor: '#ffffff',
    borderWidth: 1,
  },
  buttonText:{
    color: '#ffffffff', 
    textAlign: 'center',
    fontSize: 18,
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
  title: {
    top: -80,
    fontSize: 40,
    fontWeight: 'bold',
  },
  subtitle: {
    top: 40,
    fontSize: 40,
    fontWeight: 'bold',
  },
  default: {
    top: 115,
    fontSize: 10,
    justifyContent: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    top: 130,
    gap: 20, 
  },
  icon: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    // color: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
});
