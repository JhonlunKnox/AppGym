import { createContext, useState,useEffect,useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import {supabase} from "../utils/supabase";

type AuthData ={
    loading: boolean;
    session: Session | null;
    userId: string | null; 
}

const AuthContext = createContext<AuthData>({
    loading: true,
    session: null,
    userId: null,
});

interface Props {
    children: React.ReactNode;
}

export default function AuthProvider(props:Props){
    const [loading, setLoading] = useState<boolean>(true);
    const [session ,setSession] = useState<Session | null>(null);
    const userId = session?.user?.id || null; 

    useEffect(()=>{
        async function fetchSession(){
            const {error, data} = await supabase.auth.getSession();

            if(data.session){
                setSession(data.session);
                try {
                    const uid = data.session.user?.id;
                    if (uid) {
                        const { data: profile } = await supabase
                            .from('usuario')
                            .select('goal')
                            .eq('user_id', uid)
                            .maybeSingle();
                        if (profile && profile.goal != null) {
                            router.replace('/(tabs)/Profile');
                        } else {
                            
                        }
                    }
                } catch (err) {
                    console.warn('Error comprobando goal del usuario:', err);
                }
            }else{
                router.replace('/');
            }
            setLoading(false);
        }    
        fetchSession();

        const {data: authListener }=supabase.auth.onAuthStateChange(async(_,session)=>{
            setSession(session);
            setLoading(false);
            if(session){
                // Si hay sesión, comprobamos el campo 'goal' en la tabla 'usuario'
                try {
                    const uid = session.user?.id;
                    if (uid) {
                        const { data: profile } = await supabase
                            .from('usuario')
                            .select('goal')
                            .eq('user_id', uid)
                            .maybeSingle();
                        if (profile && profile.goal != null) {
                            router.replace('/(tabs)/Profile');
                        } 
                    }
                } catch (err) {
                    console.warn('Error comprobando goal en onAuthStateChange:', err);
                }
            }else{
                router.replace("/")
            }
        });

        return()=>{
            authListener?.subscription.unsubscribe();
        }
    },[]);

    return(
        <AuthContext.Provider value={{loading, session, userId}}> 
            {props.children}
        </AuthContext.Provider>
    );
}


async function cleanupAndLogout() {
    try {
        // Limpiar AsyncStorage antes de cerrar sesión
        const asyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const keys = await asyncStorage.getAllKeys();
        const formKeys = keys.filter(key => key.startsWith('@form_'));
        if (formKeys.length > 0) {
            await asyncStorage.multiRemove(formKeys);
        }
        
        // Cerrar sesión
        await supabase.auth.signOut();
        router.replace("/");
    } catch (error) {
        console.error("Error during cleanup:", error);
    }
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    return {
        ...context,
        cleanupAndLogout,
    };
};

