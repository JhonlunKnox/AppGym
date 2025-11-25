import { supabase } from '../utils/supabase';
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAuth } from '../providers/authprovider';

type FriendIDCallback = ((id: string) => void) | null;

interface CommunicationContextType {
    // acepta (fieldName: string, newValue: any) o (objectConCampos)
    updateusuario: (fieldNameOrObject: string | Record<string, any>, newValue?: any) => Promise<any> | null; 
    getfromusuario: (selectFields?: string | string[]) => Promise<any> | null;
    agregarAmigo: (friendID: string) => Promise<void>;
    eliminarAmigo: (friendID: string) => Promise<void>;
    obtenerListaAmigos: () => Promise<AmigoDetalle[]>;
    userId: string | null;
    loading: boolean;

    setFriendIDCallback: React.Dispatch<React.SetStateAction<FriendIDCallback>>;
    executeFriendIDCallback: (id: string) => void;
}

interface AmigoDetalle {
    user_id: string;
    username?: string;
    nombres?: string;
    rango?: string;
}

const CommunicationContext = createContext<CommunicationContextType>({} as CommunicationContextType);

interface Props {
    children: React.ReactNode;
}

const TABLE_NAME = 'usuario'; 

export default function CommunicationProvider(props: Props) {

    const { userId, loading } = useAuth(); 

    const [friendIDCallback, setFriendIDCallback] = useState<FriendIDCallback>(null);

    const executeFriendIDCallback = useCallback((id: string) => {
        if (friendIDCallback) {
            friendIDCallback(id);
            setFriendIDCallback(null);
        }
    }, [friendIDCallback]);

    // Utility function to get canonical order of user IDs
    function getCanonicalIDs(otherUserID: string): [string, string] {
        if (!userId) throw new Error('No authenticated user');
        return userId < otherUserID ? [userId, otherUserID] : [otherUserID, userId];
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
        
        // Get friend relations where current user is either usuario_id_1 or usuario_id_2
        const { data: amigosData, error: amigosError } = await supabase
            .from('amigos')
            .select('usuario_id_1, usuario_id_2')
            .or(\`usuario_id_1.eq.\${userId},usuario_id_2.eq.\${userId}\`);
        
        if (amigosError) {
            throw new Error(\`[GET FRIENDS ERROR]: \${amigosError.message}\`);
        }
        
        // Extract friend IDs (the other user in the pair)
        const friendIDs = amigosData?.map((row: any) => 
            row.usuario_id_1 === userId ? row.usuario_id_2 : row.usuario_id_1
        ) ?? [];
        
        if (friendIDs.length === 0) return [];
        
        // Get friend details from usuario table
        const { data: friendDetails, error: detailsError } = await supabase
            .from('usuario')
            .select('user_id, username, nombres, rango')
            .in('user_id', friendIDs);

        if (detailsError) {
            throw new Error(\`[GET FRIEND DETAILS ERROR]: \${detailsError.message}\`);
        }

        return friendDetails as AmigoDetalle[];
    };

    const contextValue = useMemo(() => ({
        updateusuario, 
        getfromusuario, 
        agregarAmigo, 
        eliminarAmigo, 
        obtenerListaAmigos, 
        userId, 
        loading,
        setFriendIDCallback,
        executeFriendIDCallback,
    }), [updateusuario, getfromusuario, agregarAmigo, eliminarAmigo, obtenerListaAmigos, userId, loading, friendIDCallback]);

    return (

        <CommunicationContext.Provider value={contextValue}>
            {props.children}
        </CommunicationContext.Provider>
    );
}

export const useCommunication = () => useContext(CommunicationContext);


