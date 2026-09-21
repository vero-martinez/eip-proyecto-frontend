"use client"

/**
 * AuthProvider — maneja la sesión del usuario en toda la app.
 * Guarda el usuario globalmente y mantiene la sesión en localStorage.
 * Permite acceder al usuario, login y logout desde cualquier componente.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Usuario } from "@/types/auth";

interface AuthContextType {
    usuario: Usuario | null;
    isLoading: boolean;
    login: (usuario: Usuario) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "eip-auth-usuario";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Recupera la sesión guardada al cargar la aplicación.
    useEffect(() => {
        const recuperarSesion = () => {
            const guardado = localStorage.getItem(STORAGE_KEY);

            if (guardado) {
                setUsuario(JSON.parse(guardado));
            }

            setIsLoading(false);
        };

        const timer = window.setTimeout(recuperarSesion, 0);
        return () => window.clearTimeout(timer);
    }, []);

    // Guarda el usuario autenticado en memoria y localStorage.
    const login = (usuarioAutenticado: Usuario) => {
        setUsuario(usuarioAutenticado);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioAutenticado));
    };

    // Cierra la sesión, elimina el usuario guardado y redirige al login.
    const logout = () => {
        setUsuario(null);
        localStorage.removeItem(STORAGE_KEY);
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