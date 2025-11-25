import { supabase } from '../utils/supabase';
import { createContext, useContext, useState, useCallback } from "react"; // Añadido useState y useCallback
import { useAuth } from '../providers/authprovider';

interface CommunicationContextType {
    // === Funciones de Supabase (Existentes) ===
    // acepta (fieldName: string, newValue: any) o (objectConCampos)
    updateusuario: (fieldNameOrObject: string | Record<string, any>, newValue?: any) => Promise<any> | null; 
    getfromusuario: (selectFields?: string | string[]) => Promise<any> | null;
    agregarAmigo: (friendID: string) => Promise<void>;
    eliminarAmigo: (friendID: string) => Promise<void>;
    obtenerListaAmigos: () => Promise<AmigoDetalle[]>;
    getFromotherUsuario: (targetId: string, selectFields?: string | string[]) => Promise<any> | null;
    userId: string | null;
    loading: boolean;

    // === Funcionalidad de Callback (NUEVA) ===
    componentCallback: (() => void) | null;
    setComponentCallback: (callback: (() => void) | null) => void;
    executeCallback: () => void;
}

interface AmigoDetalle {
    id: string;        // ✅ Cambio principal
    nombre: string;    // ✅ Cambio principal
    rango?: string;
    puntos?: number;
}

const CommunicationContext = createContext<CommunicationContextType>({} as CommunicationContextType);

interface Props {
    children: React.ReactNode;
}

const TABLE_NAME = 'usuario'; 

export default function CommunicationProvider(props: Props) {

    const { userId, loading } = useAuth(); 
    
    // === ESTADO Y LÓGICA DEL CALLBACK (NUEVO) ===
    const [componentCallback, setComponentCallback] = useState<(() => void) | null>(null);

    // Función para ejecutar el callback almacenado
    const executeCallback = useCallback(() => {
        console.log('Intentando ejecutar callback...');
        if (componentCallback) {
            componentCallback();
            console.log('Callback ejecutado.');
        } else {
            console.log('No hay función de callback establecida.');
        }
    }, [componentCallback]); 
    // ===========================================

    // Utility function to get canonical order of user IDs
    function getCanonicalIDs(otherUserID: string): [string, string] {
        if (!userId) throw new Error('No authenticated user');
        return userId < otherUserID ? [userId, otherUserID] : [otherUserID, userId];
    }

const getFromotherUsuario = async (targetId: string, selectFields?: string | string[]): Promise<any> =>{

    if (!targetId) {
        console.warn("Se requiere un targetId para esta consulta.");
        return null;
    }
    let selectString;
    if (Array.isArray(selectFields)) {
        selectString = selectFields.join(', ');
    } else {
        selectString = '*';
    }

    console.log(`[getOtherUserFromUsuario] Buscando datos para ID: ${targetId}`);

    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(selectString)
            .eq('user_id', targetId)
            .single();

        if (error) {
            // If no rows found, return null instead of throwing error
            if (error.code === 'PGRST116') { // no rows found error code
                console.warn(`[GET OTHER PROFILE]: No se encontró usuario con ID ${targetId}`);
                return null;
            }
            throw new Error(`[GET OTHER PROFILE ERROR]: ${error.message}`);
        }
        return data;
    } catch (err: any) {
        // Additional catch for unexpected errors
        console.error(`[GET OTHER PROFILE]: Error inesperado`, err);
        throw err;
    }
}
    const getfromusuario = async (selectFields?: string | string[]): Promise<any> =>{
        
        if (!userId) {
            console.warn("No hay usuario autenticado.");
            return null;
        }
        let selectString;
        if (Array.isArray(selectFields)) {
            selectString = selectFields.join(', ');
        } else {
            selectString = '*'; 
        }
        const { data, error } = await supabase 
            .from(TABLE_NAME)
            .select(selectString) 
            .eq('user_id', userId)
            .single(); 

        if (error) {
            throw new Error(`[GET PROFILE ERROR]: ${error.message}`);
        }
        return data;
    }

    const updategeneral = async (updatedFields:{}) => { 
    
    if (!updatedFields || Object.keys(updatedFields).length === 0) {
        throw new Error("Se requiere el user_id (quién) y al menos un campo para actualizar (qué).");
    }

    const { data, error } = await supabase
        .from(TABLE_NAME)         
        .update(updatedFields)      
        .eq('user_id', userId)      
        .select()                   
        .single();                 

    if (error) {
        throw new Error(`[UPDATE PROFILE ERROR]: ${error.message}`);
    }

    return data;
    };

    const updateusuario = async (fieldNameOrObject: string | Record<string, any>, newValue?: any): Promise<any> =>{
    if (!userId) {
        console.warn("No hay usuario autenticado. Cancelando la actualización.");
        return null;
    }

    // Construir objeto de campos a actualizar
    let updatedFields: Record<string, any> = {};
    if (typeof fieldNameOrObject === 'string') {
        if (!fieldNameOrObject) {
            throw new Error("Se debe especificar el nombre del campo a actualizar.");
        }
        updatedFields = { [fieldNameOrObject]: newValue };
    } else if (typeof fieldNameOrObject === 'object' && fieldNameOrObject !== null) {
        updatedFields = fieldNameOrObject;
    } else {
        throw new Error('Parámetros inválidos para updateusuario.');
    }

    // Evitar llamadas inútiles
    if (Object.keys(updatedFields).length === 0) {
        throw new Error('No hay campos para actualizar.');
    }

    console.log('[updateusuario] userId:', userId, 'updatedFields:', updatedFields);

    try {
        const updatedData = await updategeneral(updatedFields);
        console.log('[updateusuario] éxito:', updatedData);
        return updatedData;
    } catch (error:any) {
        console.error('[updateusuario] error raw:', error);
        // re-lanzar con mensaje más limpio pero sin perder la info
        const msg = error?.message || JSON.stringify(error);
        throw new Error(`[UPDATE PROFILE ERROR]: ${msg}`);
    }
};

    // Adds friend relation in amigos table (bidirectional simple friend system)
    const agregarAmigo = async (friendID: string): Promise<void> => {
        if (!userId) {
            console.warn("No hay usuario autenticado. No se puede agregar amigo.");
            return;
        }
        const [user1, user2] = getCanonicalIDs(friendID);
        try {
            await supabase
                .from('amigos')
                .insert([{ usuario_id_1: user1, usuario_id_2: user2 }]);
        } catch (e: any) {
            // 23505 is unique violation error code in Postgres
            if (e.code === '23505') {
                console.warn('La amistad ya existe, no es un error fatal.');
            } else {
                throw e;
            }
        }
    };

    // Deletes friend relation bidirectional
    const eliminarAmigo = async (friendID: string): Promise<void> => {
        if (!userId) {
            console.warn("No hay usuario autenticado. No se puede eliminar amigo.");
            return;
        }
        const [user1, user2] = getCanonicalIDs(friendID);
        const { error } = await supabase
            .from('amigos')
            .delete()
            .match({ usuario_id_1: user1, usuario_id_2: user2 });
        if (error) {
            throw new Error(`[DELETE FRIEND ERROR]: ${error.message}`);
        }
    };

    // Retrieve friend list with details
    const obtenerListaAmigos = async (): Promise<AmigoDetalle[]> => {
    if (!userId) {
        console.warn("No hay usuario autenticado. No se puede obtener la lista de amigos.");
        return [];
    }
    
    try {
        console.log('[obtenerListaAmigos] Buscando amigos para userId:', userId);
        
        // OPCIÓN 1: Usar dos consultas separadas y combinarlas
        // Busca donde el usuario es usuario_id_1
        const { data: amigos1, error: error1 } = await supabase
            .from('amigos')
            .select('usuario_id_1, usuario_id_2')
            .eq('usuario_id_1', userId);
        
        if (error1) {
            console.error('[obtenerListaAmigos] Error en consulta 1:', error1);
            throw new Error(`Error al buscar amigos (parte 1): ${error1.message}`);
        }
        
        // Busca donde el usuario es usuario_id_2
        const { data: amigos2, error: error2 } = await supabase
            .from('amigos')
            .select('usuario_id_1, usuario_id_2')
            .eq('usuario_id_2', userId);
        
        if (error2) {
            console.error('[obtenerListaAmigos] Error en consulta 2:', error2);
            throw new Error(`Error al buscar amigos (parte 2): ${error2.message}`);
        }
        
        console.log('[obtenerListaAmigos] Amigos1:', amigos1);
        console.log('[obtenerListaAmigos] Amigos2:', amigos2);
        
        // Combina ambos resultados
        const amigosData = [...(amigos1 || []), ...(amigos2 || [])];
        
        if (amigosData.length === 0) {
            console.log('[obtenerListaAmigos] No se encontraron amigos');
            return [];
        }
        
        // Extrae los IDs de amigos (el otro usuario en cada par)
        const friendIDs = amigosData.map((row: any) => 
            row.usuario_id_1 === userId ? row.usuario_id_2 : row.usuario_id_1
        );
        
        console.log('[obtenerListaAmigos] IDs de amigos extraídos:', friendIDs);
        
        if (friendIDs.length === 0) {
            console.log('[obtenerListaAmigos] No hay IDs de amigos para buscar');
            return [];
        }
        
        // Obtiene los detalles de los amigos desde la tabla usuario
        const { data: friendDetails, error: detailsError } = await supabase
            .from('usuario')
            .select('user_id, username, nombres, rango, puntos')
            .in('user_id', friendIDs);

        if (detailsError) {
            console.error('[obtenerListaAmigos] Error al obtener detalles:', detailsError);
            throw new Error(`Error al obtener detalles de amigos: ${detailsError.message}`);
        }

        console.log('[obtenerListaAmigos] Detalles de amigos:', friendDetails);

        // Mapea los resultados al formato esperado
        const resultado = (friendDetails || []).map(friend => ({
            id: friend.user_id,
            nombre: friend.nombres || friend.username || 'Usuario',
            rango: friend.rango || 'Novato',
            puntos: friend.puntos || 0
        }));

        console.log('[obtenerListaAmigos] Resultado final:', resultado);
        return resultado;
        
    } catch (error: any) {
        console.error('[obtenerListaAmigos] Error general:', error);
        throw error;
    }
};

    return (
        <CommunicationContext.Provider 
            value={{ 
                updateusuario, 
                getfromusuario, 
                agregarAmigo, 
                eliminarAmigo, 
                obtenerListaAmigos, 
                userId, 
                loading,
                componentCallback,
                setComponentCallback,
                executeCallback,
                getFromotherUsuario
            }}
        >
            {props.children}
        </CommunicationContext.Provider>
    );
}

export const useCommunication = () => useContext(CommunicationContext);