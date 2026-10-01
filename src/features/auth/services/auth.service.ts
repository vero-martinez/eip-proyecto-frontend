/**
 * Servicio de autenticación contra el backend real (FastAPI).
 *
 * El login delega la verificación de credenciales en la API y devuelve
 * el token JWT junto con el usuario autenticado. La persistencia de la
 * sesión la maneja session.ts / AuthProvider.
 */

import api from "@/lib/axios";
import type { Usuario } from "@/types/auth";

interface LoginResponse {
    accessToken: string;
    tokenType: string;
    usuario: Usuario;
}

export const authService = {
    /**
     * Autentica contra POST /api/v1/auth/login.
     * @throws Error con el mensaje del backend (401 credenciales, 403 inactivo).
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>("/auth/login", {
            email,
            password,
        });

        return data;
    },

    /**
     * Verifica el token actual contra GET /api/v1/auth/me.
     * Se usa al cargar la app para confirmar que la sesión sigue vigente.
     * @returns El usuario autenticado según el servidor.
     */
    me: async (): Promise<Usuario> => {
        const { data } = await api.get<Usuario>("/auth/me");
        return data;
    },
};
