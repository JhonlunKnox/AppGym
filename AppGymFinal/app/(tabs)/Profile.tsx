import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, View, Text, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useCommunication } from '@/contexts/comunicationcontext';
import { useAuth } from '@/providers/authprovider';
import Toast from 'react-native-toast-message';
import useImagePickerAndUpload from '@/hooks/useImagePickerAndUpload';
import QRcode from 'react-native-qrcode-svg';
import { Collapsible } from '@/components/ui/collapsible';
import DateTimePicker from '@react-native-community/datetimepicker';

const UNIFIED_MENU_BG = '#282828e0';
export default function ProfileScreen() {
  const { pickImageAndUpload, isUploading, uploadError } = useImagePickerAndUpload();
  const { updateusuario, getfromusuario, userId } = useCommunication();
  const [uploadedMsg, setUploadedMsg] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const { cleanupAndLogout } = useAuth();

  // New state for refreshing status
  const [refreshing, setRefreshing] = useState(false);

  const [gender, setgender] = useState<string | null>(null);
  const [saludo, setsaludo] = useState<string | null>(null);
  const [rango, setRango] = useState<string | null>(null);
  const [puntos, setPuntos] = useState<number | null>(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [editUsernameValue, setEditUsernameValue] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // New state to toggle visibility of Pago text input
  const [isPagoVisible, setIsPagoVisible] = useState(false);

  // State to hold fin_suscripcion value
  const [finSuscripcion, setFinSuscripcion] = useState<string | null>(null);


  const onDateChange = (event: any, date?: Date) => {
  setShowDatePicker(false);
  if (date) {
    setSelectedDate(date);
  }
};

  // Refresh function to reload user data
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const usergender = await getfromusuario(['gender']);
      if (usergender && usergender.gender) {
        setgender(usergender.gender);
      }
      if(usergender.gender=='female'){
        setsaludo('Bienvenida');
      }else{
        setsaludo('Bienvenido');
      }
    } catch (error) {
      console.error('Error loading user gender:', error);
    }

    try {
      const data = await getfromusuario(['fin_suscripcion']);
      if (data && data.fin_suscripcion) {
        setFinSuscripcion(data.fin_suscripcion);
      }
    } catch (error) {
      console.error('Error loading fin_suscripcion:', error);
    }

    try {
      const data = await getfromusuario(['username', 'rango', 'puntos']);
      if(data) {
        if (data.username) setUsername(data.username);
        if (data.rango) setRango(data.rango);
        if (data.puntos !== undefined) setPuntos(data.puntos);
      }
    } catch (error) {
      console.error('Error loading user basic info:', error);
    }

    try {
      const data = await getfromusuario([
        'weight',
        'height',
        'gender',
        'build',
        'goal',
        'initial_level'
      ]);
      const attributesArray = [
        data?.weight || null,
        data?.height || null,
        data?.gender || null,
        data?.build || null,
        data?.goal || null,
        data?.initial_level || null,
      ];
      setUserAttributes(attributesArray);
    } catch (error) {
      console.error('Error loading user attributes:', error);
      setUserAttributes([]);
    }

    try {
      const userData = await getfromusuario(['user_id']);
      if (userData && userData.user_id) {
        setUserDbId(userData.user_id);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }

    try {
      const data = await getfromusuario(['profile_pic_url']);
      setProfileLoading(true);
      setProfileUrl(data?.profile_pic_url || null);
      setProfileLoading(false);
    } catch (err) {
      console.warn('Failed to load profile:', err);
      setProfileLoading(false);
    }

    setRefreshing(false);
  };

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  // Added state for user attributes array
  const [userAttributes, setUserAttributes] = useState<(string | null)[]>([]);

  // Additional states for editing weight and height
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(false);
  const [isEditingHeight, setIsEditingHeight] = useState<boolean>(false);
  const [editWeightValue, setEditWeightValue] = useState<string>('');
  const [editHeightValue, setEditHeightValue] = useState<string>('');

// ... existing content above

  useEffect(() => {
    const loadUsergender = async () => {
      try {
        const usergender = await getfromusuario(['gender']);
        if (usergender && usergender.gender) {
          setgender(usergender.gender);
        }
        if(usergender.gender=='female'){
          setsaludo('Bienvenida');
        }else{
          setsaludo('Bienvenido');
        }
      } catch (error) {
        console.error('Error loading user gender:', error);
      } 
    };
    loadUsergender();

    // New effect logic: load fin_suscripcion value
    const loadFinSuscripcion = async () => {
      try {
        const data = await getfromusuario(['fin_suscripcion']);
        if (data && data.fin_suscripcion) {
          setFinSuscripcion(data.fin_suscripcion);
        }
      } catch (error) {
        console.error('Error loading fin_suscripcion:', error);
      }
    };
    loadFinSuscripcion();

    // New function to load username, rango and puntos
    const loadUserBasicInfo = async () => {
      try {
        const data = await getfromusuario(['username', 'rango', 'puntos']);
        if(data) {
          if (data.username) setUsername(data.username);
          if (data.rango) setRango(data.rango);
          if (data.puntos !== undefined) setPuntos(data.puntos);
        }
      } catch (error) {
        console.error('Error loading user basic info:', error);
      }
    };
    loadUserBasicInfo();

  }, []);

  // New useEffect to fetch the user attributes array
  useEffect(() => {
    const loadUserAttributes = async () => {
      try {
        const data = await getfromusuario([
          'weight',
          'height',
          'gender',
          'build',
          'goal',
          'initial_level'
        ]);
        // Create array from data values corresponding to keys requested
        const attributesArray = [
          data?.weight || null,
          data?.height || null,
          data?.gender || null,
          data?.build || null,
          data?.goal || null,
          data?.initial_level || null,
        ];
        setUserAttributes(attributesArray);
      } catch (error) {
        console.error('Error loading user attributes:', error);
        setUserAttributes([]); // fallback empty array on error
      }
    };

    loadUserAttributes();
  }, []);

  const handleSetDefault = async () => {
    try {
      await updateusuario('profile_pic_url', 'https://thumbs.dreamstime.com/b/figura-fuerte-levantando-ejercicio-pesado-de-elevaci%C3%B3n-pesas-en-barbell-ilustraci%C3%B3n-d-una-hombre-haciendo-un-ascensor-barbacoa-388582634.jpg');
      Toast.show({ type: 'success', text1: 'Imagen borrada' });
      loadProfilepic();
    } catch (error) {
    }
  };

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
        Toast.show({
          type: 'success',
          text1: uploadedMsg!,
          text2: 'Your avatar has been updated.'
        });
      } catch (err: any) {
        setUploadedMsg('Saved to storage but failed to update profile');
        Toast.show({
          type: 'error',
          text1: uploadedMsg!,
          text2: 'Your avatar hasn´t been updated.'
        });
      }
    }
  };

  const loadProfilepic = async () => {
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
    loadProfilepic();
  }, []);

  const handleLogout = async () => {
    try {
      await cleanupAndLogout();
      Toast.show({
        type: 'success',
        text1: 'Sesión cerrada',
        text2: 'Has cerrado sesión correctamente'
      });
    } catch (error) {
      console.error('Error durante el logout:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cerrar la sesión'
      });
    }
  };
  const attributeLabels = ['Peso(kgs):', 'Altura (mts): ','Género:', 'Constitución:', 'Objetivo:', 'Nivel inicial:'];
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userDbId, setUserDbId] = useState<string | null>(null);

  const userInfoText = `Esta es la informacion de ${username} , Rango: ${rango}, Puntos: ${puntos}.`;


  const updateUsername = async (newUsername: string) => {
    try {
      await updateusuario('username', newUsername);
      setUsername(newUsername);
      Toast.show({ type: 'success', text1: 'Username updated' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error updating username', text2: error.message || '' });
    }
  };

  // Update weight
  const updateWeight = async (newWeight: string) => {
    try {
      await updateusuario('weight', newWeight);
      // Update userAttributes weight index (0)
      setUserAttributes((prev) => {
        const copy = [...prev];
        copy[0] = newWeight;
        return copy;
      });
      Toast.show({ type: 'success', text1: 'Peso actualizado' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error actualizando peso', text2: error.message || '' });
    }
  };

  // Update height
  const updateHeight = async (newHeight: string) => {
    try {
      await updateusuario('height', newHeight);
      // Update userAttributes height index (1)
      setUserAttributes((prev) => {
        const copy = [...prev];
        copy[1] = newHeight;
        return copy;
      });
      Toast.show({ type: 'success', text1: 'Altura actualizada' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error actualizando altura', text2: error.message || '' });
    }
  };

  const startEditingUsername = () => {
    setEditUsernameValue(username);
    setIsEditingUsername(true);
  };

  const cancelEditingUsername = () => {
    setIsEditingUsername(false);
    setEditUsernameValue('');
  };

  const handleSaveUsername = async () => {
    if (editUsernameValue.trim() === '') {
      Toast.show({ type: 'error', text1: 'El username no puede estar vacío' });
      return;
    }
    await updateUsername(editUsernameValue.trim());
    setIsEditingUsername(false);
    setEditUsernameValue('');
  };

  // Start/Cancel/Save handlers for weight
  const startEditingWeight = () => {
    setEditWeightValue(userAttributes[0] || '');
    setIsEditingWeight(true);
  };

  const cancelEditingWeight = () => {
    setIsEditingWeight(false);
    setEditWeightValue('');
  };

  const handleSaveWeight = async () => {
    if (editWeightValue.trim() === '') {
      Toast.show({ type: 'error', text1: 'El peso no puede estar vacío' });
      return;
    }
    await updateWeight(editWeightValue.trim());
    setIsEditingWeight(false);
    setEditWeightValue('');
  };
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  // Start/Cancel/Save handlers for height
  const startEditingHeight = () => {
    setEditHeightValue(userAttributes[1] || '');
    setIsEditingHeight(true);
  };

  const cancelEditingHeight = () => {
    setIsEditingHeight(false);
    setEditHeightValue('');
  };

  const handleSaveHeight = async () => {
    if (editHeightValue.trim() === '') {
      Toast.show({ type: 'error', text1: 'La altura no puede estar vacía' });
      return;
    }
    await updateHeight(editHeightValue.trim());
    setIsEditingHeight(false);
    setEditHeightValue('');
  };

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userData = await getfromusuario(['user_id']);
        if (userData && userData.user_id) {
          setUserDbId(userData.user_id);
        }
      } catch (error) {
        console.error('Error loading user ID:', error);
      }
    };

    loadUserId();

    const loadUserData = async () => {
      try {
        const userData = await getfromusuario(['username']);
        if (userData && userData.username) {
          setUsername(userData.username);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>

        {/* Contenedor de la cabecera del perfil (Imagen + Título) */}
        <ThemedView style={styles.profileHeaderContainer}>
          <View style={styles.headerTopRow}>
            {!loading && !isEditingUsername && (
              <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" style={styles.titleText}>
                  ¡{saludo} {username}!
                </ThemedText>
              </ThemedView>
            )}

            {/* Dropdown menu button */}
            <TouchableOpacity
              onPress={() => setDropdownVisible(!dropdownVisible)}
              style={styles.menuButton}
              accessibilityLabel="Toggle dropdown menu"
            >
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>
          </View>

          <Image
            style={styles.image}
            source={profileUrl}
            transition={1000}
          />

          {/* Dropdown menu items */}
          {dropdownVisible && (
            <View style={styles.dropdownMenu}>
              <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                {/* Envolviendo los Collapsible en una View con margen para separación */}
                <View style={styles.dropdownContentContainer}>
                  {/* Los Collapsible usan el mismo color de fondo del menú */}
                  <Collapsible title="Compartir perfil" customStyle={styles.dropdownCollapsible}>
                    <View style={styles.qrCodeContainer}>
                      <QRcode
                        value={userInfoText||'La infomacion de tu compañero estara disponible mas tarde, ponte a entrenar flacow'}
                        size={180}
                        color="white"
                        backgroundColor="transparent"
                      />
                    </View>
          </Collapsible>

                  <Collapsible title="Editar perfil" customStyle={styles.dropdownCollapsible}>
                    {!isEditingPhoto && (
                      <TouchableOpacity onPress={() => setIsEditingPhoto(true)} style={styles.uploadButton}>
                        <ThemedText type="default" style={styles.buttonText}>Editar foto</ThemedText>
                      </TouchableOpacity>
                    )}
                    {isEditingPhoto && (
                      <>
                        <ThemedView style={styles.buttonRow}>
                          <TouchableOpacity onPress={handlePick} style={[styles.uploadButton, styles.flexGrow]} disabled={isUploading}>
                            {isUploading ? (
                              <ActivityIndicator color="#ffffffff" />
                            ) : (
                              <ThemedText type="default" style={styles.buttonText}>Seleccionar Foto</ThemedText>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleSetDefault} style={[styles.uploadButton, styles.flexGrow, styles.marginLeft]} disabled={isUploading}>
                            {isUploading ? (
                              <ActivityIndicator color="#ffffffff" />
                            ) : (
                              <ThemedText type="default" style={styles.buttonText}>Borrar Foto</ThemedText>
                            )}
                          </TouchableOpacity>
                        </ThemedView>
                        <TouchableOpacity onPress={() => setIsEditingPhoto(false)} style={[styles.uploadButton, { backgroundColor: '#444' }]}>
                          <ThemedText type="default" style={styles.buttonText}>Cancelar</ThemedText>
                        </TouchableOpacity>
                      </>
                    )}
                    {!isUploading && !isEditingUsername && (
                      <TouchableOpacity onPress={startEditingUsername} style={styles.uploadButton}>
                        <ThemedText type="default" style={styles.buttonText}>Editar username</ThemedText>
                      </TouchableOpacity>
                    )}
                    {isEditingUsername && (
                      <ThemedView style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editUsernameValue}
                          onChangeText={setEditUsernameValue}
                          autoFocus
                          placeholderTextColor="#888"
                        />
                        <TouchableOpacity onPress={handleSaveUsername} style={styles.saveButton}>
                          <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Actualizar</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={cancelEditingUsername} style={styles.cancelButton}>
                          <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Cancelar</ThemedText>
                        </TouchableOpacity>
                      </ThemedView>
                    )}
                    {/* New collapsibles for Weight and Height editing */}
                    <Collapsible title="Editar peso" customStyle={styles.dropdownCollapsible}>
                      {!isEditingWeight && (
                        <TouchableOpacity onPress={startEditingWeight} style={styles.uploadButton}>
                          <ThemedText type="default" style={styles.buttonText}>Editar peso</ThemedText>
                        </TouchableOpacity>
                      )}
                      {isEditingWeight && (
                        <ThemedView style={styles.editContainer}>
                          <TextInput
                            style={styles.editInput}
                            value={editWeightValue}
                            onChangeText={setEditWeightValue}
                            autoFocus
                            keyboardType="numeric"
                            placeholderTextColor="#888"
                          />
                          <TouchableOpacity onPress={handleSaveWeight} style={styles.saveButton}>
                            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Actualizar</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={cancelEditingWeight} style={styles.cancelButton}>
                            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Cancelar</ThemedText>
                          </TouchableOpacity>
                        </ThemedView>
                      )}
                    </Collapsible>
                    <Collapsible title="Editar altura" customStyle={styles.dropdownCollapsible}>
                      {!isEditingHeight && (
                        <TouchableOpacity onPress={startEditingHeight} style={styles.uploadButton}>
                          <ThemedText type="default" style={styles.buttonText}>Editar altura</ThemedText>
                        </TouchableOpacity>
                      )}
                      {isEditingHeight && (
                        <ThemedView style={styles.editContainer}>
                          <TextInput
                            style={styles.editInput}
                            value={editHeightValue}
                            onChangeText={setEditHeightValue}
                            autoFocus
                            keyboardType="numeric"
                            placeholderTextColor="#888"
                          />
                          <TouchableOpacity onPress={handleSaveHeight} style={styles.saveButton}>
                            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Actualizar</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={cancelEditingHeight} style={styles.cancelButton}>
                            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Cancelar</ThemedText>
                          </TouchableOpacity>
                        </ThemedView>
                      )}
                    </Collapsible>
                  </Collapsible>
                </View>

                <TouchableOpacity
                  style={styles.minimalLogoutButton}
                  onPress={() => {
                    setDropdownVisible(false);
                    handleLogout();
                  }}
                >
                  <ThemedText type="default" style={styles.minimalLogoutButtonText}>Cerrar Sesión</ThemedText>
                </TouchableOpacity>

              </ScrollView>
            </View>
          )}

        </ThemedView>
<ThemedView style={{ padding: 20, backgroundColor: '#1e1e1e', borderRadius: 10 }}>
  <ThemedText style={{ fontSize: 22, fontWeight: 'bold', color: '#CA1818', marginBottom: 10 }}>
    🚀 Desbloquea tu Potencial
  </ThemedText>
        
  <ThemedText style={{ fontSize: 16, lineHeight: 24, color: '#FFFFFF', marginBottom: 15 }}>
    Tu entrenamiento diario no es una obligación, es una INVERSION en tu futura versión!!!
  </ThemedText>

  {/* Botón para mostrar/ocultar el selector de fecha */}
  {!isPagoVisible && (
    <TouchableOpacity 
      onPress={() => setIsPagoVisible(true)}
      style={styles.button2}
    >
      <ThemedText style={styles.buttonText}>Actualizar mi pago en el GYM</ThemedText>
    </TouchableOpacity>
  )}

  {finSuscripcion && (
    <ThemedText style={{ color: '#FFFFFF', marginTop: 10, textAlign: 'center' }}>
      Tu suscripcion vence:{formatDate(new Date(finSuscripcion))}
    </ThemedText>
  )}

  {/* SELECTOR DE FECHA CON CALENDARIO */}
  {isPagoVisible && (
    <View style={styles.datePickerContainer}>

      <ThemedText style={styles.dateLabel}>
        SELECCIONA LA FECHA DE PAGO:
      </ThemedText>
      
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <ThemedText style={styles.dateButtonText}>
          {formatDate(selectedDate)}
        </ThemedText>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* SELECTOR DE PLAN */}
      <ThemedText style={[styles.dateLabel, { marginTop: 15 }]}>
        SELECCIONA TU PLAN:
      </ThemedText>

      <View style={styles.planContainer}>

        {['semanal', 'mensual', 'anual'].map((plan) => (
          <TouchableOpacity 
            key={plan}
            onPress={() => setSelectedPlan(plan)}
            style={styles.planOption}
          >
            <View style={styles.checkboxContainer}>
              
              {/* Checkbox */}
              <View
                style={[
                  styles.checkbox,
                  selectedPlan === plan && styles.checkboxChecked
                ]}
              >
                {selectedPlan === plan && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              {/* Texto */}
              <ThemedText style={styles.planText}>
                {plan === 'semanal' && 'Semanal'}
                {plan === 'mensual' && 'Mensual'}
                {plan === 'anual' && 'Anual'}
              </ThemedText>

            </View>
          </TouchableOpacity>
        ))}

      </View>

      {/* BOTONES */}
      <View style={styles.buttonRow}>
        
        {/* Botón GUARDAR */}
        <TouchableOpacity 
          onPress={async () => {
            if (!selectedPlan) {
              Toast.show({ 
                type: 'error', 
                text1: 'Error',
                text2: 'Por favor selecciona un plan'
              });
              return;
            }

            // 1️⃣ CALCULAR FECHA PRÓXIMA
            let fechaProximaPago = new Date(selectedDate);

            if (selectedPlan === 'semanal') {
              fechaProximaPago.setDate(fechaProximaPago.getDate() + 7);
            } else if (selectedPlan === 'mensual') {
              fechaProximaPago.setMonth(fechaProximaPago.getMonth() + 1);
            } else if (selectedPlan === 'anual') {
              fechaProximaPago.setFullYear(fechaProximaPago.getFullYear() + 1);
            }

            const fechaActualISO = formatDateISO(selectedDate);
            const fechaProximaISO = formatDateISO(fechaProximaPago);

            try {
              // 2️⃣ GUARDAR EN BD
              await updateusuario('fecha_pago', fechaActualISO);
              await updateusuario('fin_suscripcion', fechaProximaISO);

              Toast.show({ 
                type: 'success', 
                text1: 'Pago actualizado',
                text2: `Actual: ${formatDate(selectedDate)} | Próxima: ${formatDate(fechaProximaPago)}`
              });

              // Update finSuscripcion state to reflect updated date immediately
              setFinSuscripcion(fechaProximaISO);

            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error al actualizar pago',
                text2: String(error) || 'Error desconocido'
              });
              return;
            }

            // 3️⃣ LIMPIAR Y CERRAR
            setIsPagoVisible(false);
            setSelectedPlan(null);

          }}
          style={[styles.saveButton, { flex: 1, marginRight: 5 }]}
        >
          <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Guardar</ThemedText>
        </TouchableOpacity>

        {/* Botón CANCELAR */}
        <TouchableOpacity 
          onPress={() => {
            setIsPagoVisible(false);
            setSelectedPlan(null);
          }}
          style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
        >
          <ThemedText style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Cancelar</ThemedText>
        </TouchableOpacity>

      </View>

    </View>
  )}
</ThemedView>

        <ThemedView style={{ padding: 20, backgroundColor: '#1e1e1e', borderRadius: 10, marginTop: 10 }}>
            <ThemedText style={{
                fontSize: 22,
                fontWeight: 'bold',
                color: '#CA1818',
                marginBottom: 10,
                textAlign: 'center' 
            }}>
            SOBRE TI:
          </ThemedText>
          {userAttributes.map((attr, idx) => {
            if (!attr) return null;
            return (
              <ThemedView key={idx} style={{ marginBottom: 10 }}>
                
                <ThemedText type="subtitle" style={{ color: '#CA1818' }}>
                  {attributeLabels[idx]}
                </ThemedText>
                <ThemedText style={{ fontSize: 16, color: '#FFFFFF' }}>
                  {attr}
                </ThemedText>
              </ThemedView>
            );
          })}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 40,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    margin: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  titleText: {
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  menuButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ca1818',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: UNIFIED_MENU_BG,
    padding: 15,
    borderRadius: 10,
    width: 300,
    maxHeight: 500,
    zIndex: 1000,
    shadowColor: '#c0c0c0ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownScrollView: {
    maxHeight: 470,
  },
  dropdownContentContainer: {
    padding: 5,
    gap: 15,
  },
  // ESTILO UNIFICADO: Fondo transparente para heredar el color del menú
  dropdownCollapsible: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  qrCodeContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdownItemText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  button2: {
    backgroundColor: '#ff0000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffffff',
    textAlign: 'center',
  },
  minimalLogoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ca1818',
  },
  minimalLogoutButtonText: {
    color: '#ca1818',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#ca1818',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  editButton: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  editContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
    marginTop: 10,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 40,
    color: 'black',
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  flexGrow: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 8,
  },
  datePickerContainer: {
  backgroundColor: '#2a2a2a',
  padding: 15,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#CA1818',
},
dateLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 8,
},
dateButton: {
  backgroundColor: '#000000ff',
  borderWidth: 1,
  borderColor: '#888',
  borderRadius: 6,
  paddingHorizontal: 12,
  paddingVertical: 12,
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
},
dateButtonText: {
  fontSize: 16,
  color: '#ffffffff',
  fontWeight: '600',
},
checkboxContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},

checkbox: {
  width: 24,
  height: 24,
  borderWidth: 2,
  borderColor: '#CA1818',
  borderRadius: 6,
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
},

checkboxChecked: {
  backgroundColor: '#CA1818',
  borderColor: '#CA1818',
},

checkmark: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

planOption: {
  paddingVertical: 10,
},

planContainer: {
  marginTop: 10,
},

planText: {
  fontSize: 18,
  color: 'white',
},

});