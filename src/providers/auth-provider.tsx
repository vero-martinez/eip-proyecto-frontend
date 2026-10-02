/**
 * AuthProvider — maneja la sesión del usuario en toda la app.
 * Guarda el token JWT y el usuario globalmente, y los persiste en
 * localStorage mediante session.ts.
 * Permite acceder al usuario, login y logout desde cualquier componente.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Usuario } from "@/types/auth";
import { getSession, setSession, clearSession } from "@/lib/session";
import { authService } from "@/features/auth/services/auth.service";

interface AuthContextType {
    usuario: Usuario | null;
    isLoading: boolean;
    login: (usuario: Usuario, accessToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Recupera la sesión guardada y la valida contra el backend al cargar.
    useEffect(() => {
        let cancelado = false;

        const recuperarSesion = async () => {
            const session = getSession();

            if (!session) {
                setIsLoading(false);
                return;
            }

            try {
                // Confirma que el token siga vigente y recupera el usuario.
                const usuarioActual = await authService.me();

                if (cancelado) return;

                setUsuario(usuarioActual);
                setSession({ accessToken: session.accessToken, usuario: usuarioActual });
            } catch {
                // Token inválido o expirado: se descarta la sesión.
                if (cancelado) return;
                clearSession();
                setUsuario(null);
            } finally {
                if (!cancelado) setIsLoading(false);
            }
        };

        recuperarSesion();

        return () => {
            cancelado = true;
        };
    }, []);

    // Guarda el usuario autenticado y su token.
    const login = (usuarioAutenticado: Usuario, accessToken: string) => {
        setUsuario(usuarioAutenticado);
        setSession({ accessToken, usuario: usuarioAutenticado });
    };

    // Cierra la sesión, elimina lo guardado y redirige al login.
    const logout = () => {
        setUsuario(null);
        clearSession();
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ usuario, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para acceder a la sesión desde cualquier componente.
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }

    return context;
}
