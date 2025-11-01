import { supabase } from '../utils/supabase';
import { createContext, useContext } from "react";
import { useAuth } from '../providers/authprovider';

interface CommunicationContextType {
    // acepta (fieldName: string, newValue: any) o (objectConCampos)
    updateusuario: (fieldNameOrObject: string | Record<string, any>, newValue?: any) => Promise<any> | null; 
    getfromusuario: (selectFields?: string | string[]) => Promise<any> | null;
    userId: string | null;
    loading: boolean;
}

const CommunicationContext = createContext<CommunicationContextType>({} as CommunicationContextType);

interface Props {
    children: React.ReactNode;
}

const TABLE_NAME = 'usuario'; 
export default function CommunicationProvider(props: Props) {

    const { userId, loading } = useAuth(); 
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

    return (

        <CommunicationContext.Provider value={{ updateusuario, getfromusuario, userId, loading }}>
            {props.children}
        </CommunicationContext.Provider>
    );
}

export const useCommunication = () => useContext(CommunicationContext);

