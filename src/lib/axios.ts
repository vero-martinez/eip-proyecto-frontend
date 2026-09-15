/**
 * Instancia centralizada de Axios para comunicación con la API (FastAPI).
 *
 * En vez de usar Axios en cada archivo, todo el proyecto importa esta instancia ya configurada
 * 
 * Incluye interceptores para:
 * - Agregar automáticamente el token en las peticiones (cuando exista sesión).
 * - Estandarizar los mensajes de error del backend.
 */

import axios from "axios";
import { env } from "@/lib/env";

// Instancia base de Axios. Usa la URL del backend definida en env.ts
const api = axios.create({
    baseURL: env.apiUrl,
    timeout: 10000, // Si el backend no responde en 10 segundos, la petición se cancela
});

/**
 * INTERCEPTOR DE REQUEST
 *
 * Se ejecuta antes de cada petición y permite agregar automáticamente
 * el token de autenticación al header Authorization.
 *
 * Actualmente no modifica la petición porque aún no hay autenticación;
 * queda preparado para cuando exista un usuario logueado.
 */
api.interceptors.request.use((config) => {
    // TODO: cuando exista el store de auth (mock o real), traer el token de ahí
    // const token = useAuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
});

/**
 * INTERCEPTOR DE RESPONSE
 *
 * Maneja las respuestas de Axios y, cuando ocurre un error, obtiene
 * el mensaje enviado por FastAPI (detail, message o error) para
 * reemplazar el mensaje técnico de Axios por uno más claro.
 *
 * Si no encuentra ninguno, usa el mensaje de Axios o "Error inesperado".
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.detail ??
            error.response?.data?.message ??
            error.response?.data?.error ??
            error.message ??
            "Error inesperado";

        // Sobreescribe el mensaje de Axios para que el error ya esté listo para mostrar al usuario.
        error.message = message;

        return Promise.reject(error);
    }
);

export default api;