import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast, { BaseToast, ErrorToast, ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthProvider from '@/providers/authprovider';


//ESTO ES PARA CAMBIAR EL COLOR A LOS MENSAJITOS DE ARRIBA PA Q COMBINEN CON LA APP
const toastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#5CB85C' }} 
      contentContainerStyle={{ backgroundColor: '#3d3d3dff' }} 
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffffff', 
      }}
      text2Style={{
        fontSize: 13,
        color: '#666', 
      }}
    />
  ),
  error: (props: ToastConfigParams<any>) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#CA1818', backgroundColor: '#3d3d3dff' }} 
      contentContainerStyle={{ paddingHorizontal: 15 }} 
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffffff', 
      }}
      text2Style={{
        fontSize: 13,
        color: '#666',
      }}
    />
  ),

  info: (props: ToastConfigParams<any>) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#1A73E8', backgroundColor: '#3d3d3dff' }} 
      contentContainerStyle={{ paddingHorizontal: 15 }} 
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffffff', 
      }}
      text2Style={{
        fontSize: 13,
        color: '#666',
      }}
    />
  ),
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
       <Stack screenOptions={{headerShown: false}}>
         <Stack.Screen name="index" />     
       </Stack>
       <StatusBar style="auto" />
       <Toast config={toastConfig}/>
     </ThemeProvider>
    </AuthProvider>
    
  );
}
