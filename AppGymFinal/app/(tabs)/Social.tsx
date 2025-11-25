import { Image } from 'expo-image';
import { StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl, TextInput, Alert, Platform } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useCommunication } from '@/contexts/comunicationcontext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { router } from 'expo-router'; 
import { CameraView, Camera } from 'expo-camera';
import * as Linking from 'expo-linking';

const RED_ACCENT = '#CA1818';
const SCANNER_HEIGHT = 250;

// 💡 Interfaz para el contenido del QR escaneado (adaptada para solo texto)
interface ConsultedUser {
    id: string; // Aquí guardaremos el texto escaneado
    nombre: string; // Usaremos 'nombre' para mostrar el texto grande
    rango: string;
    puntos: number;
}

export default function ProfileScreenTemplate() {
    const { 
        getfromusuario, 
        userId,
        // ELIMINAMOS getOtherUserFromUsuario de la desestructuración
    } = useCommunication();
    
    // --- ESTADOS DEL USUARIO PROPIO ---
    const [puntos, setPuntos] = useState<number | null>(null);
    const [rango, setRango] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // 🔍 ESTADOS PARA EL TEXTO ESCANEADO (Usamos ConsultedUser para el render de la tarjeta)
    const [consultedUser, setConsultedUser] = useState<ConsultedUser | null>(null);
    const [consulting, setConsulting] = useState(false); // Mantenemos para bloquear el escáner

    // 🔍 ESTADOS DEL SCANNER
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    // --- Permisos de Cámara (Se mantiene igual) ---
    useEffect(() => {
        const getCameraPermissions = async () => {
            if (!isScanning) return; 
            if (hasPermission !== null) return;

            if (Platform.OS === 'web') {
                setHasPermission(false);
                Alert.alert('No Soportado', 'El escáner QR no está disponible en la web.');
                setIsScanning(false);
                return;
            }

            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso Denegado', 
                    'Se necesita permiso de cámara para escanear códigos QR.',
                    [
                        { text: 'Cancelar', style: 'cancel', onPress: () => setIsScanning(false) },
                        { 
                            text: 'Abrir Ajustes', 
                            onPress: () => {
                                Linking.openSettings();
                                setIsScanning(false);
                            }
                        }
                    ]
                );
            }
        };

        getCameraPermissions();
    }, [isScanning]);

    // --- Cargar Datos del Perfil Propio (Se mantiene para mostrar el perfil del usuario logueado) ---
    const fetchAndLoadData = useCallback(async () => {
        console.log('🟢 [fetchAndLoadData] INICIANDO carga de datos propios...');
        
        try {
            setError(null);
            
            console.log('🟢 [fetchAndLoadData] Obteniendo datos del usuario...');
            const data = await getfromusuario();
            console.log('🟢 [fetchAndLoadData] Datos del usuario:', data);
            
            if (data) {
                setPuntos(data.puntos ?? 0);
                setRango(data.rango ?? 'Novato');
                console.log('🟢 [fetchAndLoadData] Puntos:', data.puntos, 'Rango:', data.rango);
            }
            
        } catch (err: any) {
            console.error('❌ [fetchAndLoadData] ERROR:', err);
            console.error('❌ [fetchAndLoadData] Error message:', err.message);
            setError(err.message || 'Error al cargar datos');
        }
    }, [getfromusuario]);

    useEffect(() => {
        console.log('🟡 [useEffect] Componente montado, iniciando carga inicial...');
        setLoading(true);
        fetchAndLoadData().finally(() => {
            console.log('🟡 [useEffect] Carga inicial completada');
            setLoading(false);
        });
    }, [fetchAndLoadData]);

    // --- Refresh (Se mantiene igual) ---
    const onRefresh = async () => {
        console.log('🔄 [onRefresh] Refrescando datos...');
        setRefreshing(true);
        await fetchAndLoadData();
        setRefreshing(false);
        console.log('🔄 [onRefresh] Refresco completado');
    };

    // 🔑 FUNCIÓN MODIFICADA: Ahora solo almacena el texto escaneado en el estado.
    const handleBarCodeScanned = async ({ data }: { type: string, data: string }) => {
        if (scanned || consulting) return;
        
        console.log('📷 [handleBarCodeScanned] Código escaneado:', data);
        setScanned(true); // Bloquea el escáner
        setIsScanning(false); // Cierra la cámara
        setConsulting(true);
        setConsultedUser(null); // Limpia la tarjeta anterior

        const scannedContent = data.trim();

        try {
            console.log('🔍 [handleBarCodeScanned] Contenido escaneado:', scannedContent);
            
            // *** Lógica Simplificada: Solo almacenar y mostrar el texto ***
            const newConsultedUser: ConsultedUser = {
                id: 'QR_ESCANEADO', // ID fijo
                nombre: scannedContent, // **El contenido escaneado va aquí**
                rango: 'Contenido QR', // Texto estético para el rango
                puntos: scannedContent.length, // Usamos la longitud como un valor de demostración (opcional)
            };
            setConsultedUser(newConsultedUser);

            console.log('✅ [handleBarCodeScanned] Contenido cargado en la tarjeta.');
            Alert.alert("Éxito", "Contenido QR escaneado y cargado en la tarjeta.");

        } catch (err: any) {
            console.error('❌ [handleBarCodeScanned] ERROR:', err);
            Alert.alert("Error de Lectura", "Hubo un problema al procesar el código QR.");
            setConsultedUser(null);
        } finally {
            setConsulting(false);
            setScanned(false); // Permite escanear de nuevo
        }
    };

    // 🔑 FUNCIÓN: Toggle Scanner (Se mantiene igual)
    const handleToggleScan = () => {
        if (isScanning) {
            setIsScanning(false);
            setScanned(false);
            setConsulting(false);
        } else {
            setScanned(false);
            setHasPermission(null);
            setIsScanning(true);
            setConsultedUser(null); // Limpia la tarjeta al abrir el escáner
        }
    };

    // --- Obtener Imagen de Rango (Se mantiene igual) ---
    const getRangoImage = (currentRango: string | null = null) => {
        const targetRango = (currentRango ?? rango ?? '').toUpperCase();

        switch (targetRango) {
            case 'PRINCIPIANTE':
                return require('@/assets/images/RANGO 1s.png');
            case 'INTERMEDIO':
                return require('../../assets/images/INTERMEDIOs.png');
            case 'AVANZADO':
                return require('../../assets/images/AVANZADOs.png');
            case 'ESTETICO':
                return require('../../assets/images/ESTETICOs.png');
            case 'MR OLYMPIA':
                return require('../../assets/images/MR OLYMPIAs.png');
            default:
                // Para el contenido QR, usamos la imagen base
                return require('@/assets/images/RANGO 1s.png'); 
        }
    };

    // Log del estado actual para debug
    console.log('🔍 [RENDER] Estado actual:', {
        loading,
        error,
        userId,
        puntos,
        rango,
        consultedUser: consultedUser?.nombre || 'Ninguno'
    });

    // --- Estados de Carga (Se mantiene igual) ---
    if (loading) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ThemedText>Cargando Perfil...</ThemedText>
            </ThemedView>
        );
    }

    if (error) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ThemedText style={{color: RED_ACCENT}}>Error: {error}</ThemedText>
                <TouchableOpacity 
                    style={[styles.menuButton, {marginTop: 20}]} 
                    onPress={() => {
                        setLoading(true);
                        fetchAndLoadData().finally(() => setLoading(false));
                    }}
                >
                    <ThemedText style={styles.menuButtonText}>Reintentar</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    // --- RENDER PRINCIPAL ---
    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header del Perfil Propio (Se mantiene igual) */}
                <ThemedView style={styles.profileHeaderContainer}>
                    <View style={styles.headerTopRow}>
                        <View style={styles.titleContainer}>
                            <ThemedText type="title" style={styles.titleText}>
                                Mi Perfil
                            </ThemedText>
                        </View>
                    </View>

                    {/* Imagen de Rango */}
                    <Image
                        source={getRangoImage()}
                        style={{ width: 100, height: 100, marginVertical: 10 }}
                        contentFit="contain"
                    />

                    {/* Info de Puntos y Rango */}
                    <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: RED_ACCENT }}>
                        {rango || 'Sin rango'}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 18, color: '#999' }}>
                        {puntos !== null ? `${puntos} puntos` : 'Cargando...'}
                    </ThemedText>

                    {/* Debug: Mostrar userId */}
                    <ThemedText style={[styles.userIdText, { marginTop: 10 }]}>
                        ID: {userId || 'No disponible'}
                    </ThemedText>
                </ThemedView>

                {/* --------------------------------- */}
                {/* Bloque: Escáner QR (Se mantiene igual, solo cambia el callback) */}
                {/* --------------------------------- */}
                <ThemedView style={[styles.infoBlock, styles.attributeBlock]}>
                    <ThemedText style={styles.blockTitle}>
                        Escanear Contenido QR
                    </ThemedText>
                    
                    {/* 🔍 ESCÁNER QR */}
                    {isScanning && hasPermission === true && (
                        <View style={styles.scannerContainer}>
                            <CameraView
                                style={StyleSheet.absoluteFillObject}
                                facing="back"
                                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: ['qr'],
                                }}
                            />
                            <View style={styles.scannerOverlay}>
                                <ThemedText style={styles.scannerText}>
                                    Apunta al código QR
                                </ThemedText>
                            </View>
                        </View>
                    )}
                    
                    {/* Mensajes de Estado */}
                    {isScanning && hasPermission === null && (
                        <ThemedText style={styles.scannerStatusText}>
                            Solicitando permisos de cámara...
                        </ThemedText>
                    )}
                    
                    {isScanning && hasPermission === false && (
                        <ThemedText style={[styles.scannerStatusText, { color: RED_ACCENT }]}>
                            Permiso de cámara denegado
                        </ThemedText>
                    )}
                    
                    {consulting && (
                        <ThemedText style={styles.scannerStatusText}>
                            Procesando contenido...
                        </ThemedText>
                    )}
                    
                    {/* Botón Toggle Scanner */}
                    <TouchableOpacity
                        style={[
                            styles.menuButton, 
                            (consulting || (isScanning && hasPermission !== true)) && styles.buttonDisabled,
                            {backgroundColor: isScanning ? '#777' : RED_ACCENT}
                        ]}
                        onPress={handleToggleScan}
                        disabled={consulting || (isScanning && hasPermission !== true)}
                    >
                        <ThemedText style={styles.menuButtonText}>
                            {isScanning ? '✕ Cerrar Scanner' : '📷 Escanear Código QR'}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {/* --------------------------------- */}
                {/* Tarjeta del Contenido Escaneado */}
                {/* --------------------------------- */}
                {consultedUser && (
                    <ThemedView style={[styles.infoBlock, styles.consultedCard]}>
                        <ThemedText style={styles.consultedTitle}>
                            Contenido QR Escaneado
                        </ThemedText>
                        <Image
                            source={require('../../assets/images/lupa.png')} // Imagen genérica
                            style={{ width: 80, height: 80, marginVertical: 10 }}
                            contentFit="contain"
                        />


                        {/* Muestra el contenido escaneado aquí */}
                        <ThemedText style={styles.scannedContentTextVisual}>
                            {consultedUser.nombre}
                        </ThemedText>



                        <TouchableOpacity 
                            style={[styles.menuButton, { backgroundColor: '#3a3a3a', marginTop: 15 }]} 
                            onPress={() => setConsultedUser(null)}
                        >
                            <ThemedText style={styles.menuButtonText}>Cerrar Tarjeta</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                )}

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 60,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scannerContainer: {
        width: '100%',
        height: SCANNER_HEIGHT,
        overflow: 'hidden',
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: '#000',
        borderWidth: 2,
        borderColor: RED_ACCENT,
        position: 'relative',
    },
    scannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scannerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    scannerStatusText: {
        textAlign: 'center',
        color: '#fff',
        marginBottom: 15,
        fontSize: 14,
    },
    profileHeaderContainer: {
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 20,
    },
    headerTopRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
        paddingVertical: 12,
        backgroundColor: RED_ACCENT,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    menuButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoBlock: {
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
    },
    attributeBlock: {
        marginTop: 0,
        marginBottom: 20,
    },
    blockTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: RED_ACCENT,
        marginBottom: 15,
        textAlign: 'center',
    },
    userIdText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: '#333',
        padding: 8,
        borderRadius: 6,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    // Estilos para la Tarjeta de Contenido Escaneado
    consultedCard: {
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#00BFFF', 
        backgroundColor: '#282828',
        marginBottom: 20,
        minHeight: 250, // Ajuste para que se vea bien
    },
    consultedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00BFFF',
        marginBottom: 10,
    },
scannedContentTextVisual: {
        fontSize: 20, // Texto más grande
        color: '#00BFFF', // Color llamativo para el contenido
        marginTop: 15,
        marginBottom: 15,
        textAlign: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        // Fondo y bordes para hacerlo visualmente un bloque de código/información importante
        backgroundColor: '#1e1e1e', 
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 255, 0.5)', // Borde sutil del color de acento
        borderRadius: 10,
        width: '100%',
        // Fuente semi-redondeada y monoespaciada para códigos, pero sin el estilo aburrido de 'monospace'
        fontFamily: Fonts.rounded || Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
        fontWeight: '700',
        maxWidth: '150%',
        // Esto es clave para que se vea un bloque visualmente atractivo:
        shadowColor: '#00BFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5, 
    },
    consultedRank: {
        fontSize: 16,
        color: RED_ACCENT,
        marginTop: 5,
    },
    consultedPoints: {
        fontSize: 16,
        color: '#ccc',
        marginTop: 5,
    }
});

