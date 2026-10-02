/**
 * Persistencia de la sesión (token JWT + usuario) en localStorage.
 *
 * Es la única fuente de verdad del token: la usan tanto el proveedor de
 * autenticación (React) como el interceptor de Axios.
 *
 */

import type { Usuario } from "@/types/auth";

export interface Session {
    accessToken: string;
    usuario: Usuario;
}

const STORAGE_KEY = "eip:session:v1";

/** Devuelve la sesión guardada, o null si no hay o está corrupta. */
export function getSession(): Session | null {
    if (typeof window === "undefined") return null;

    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return null;

    try {
        const session = JSON.parse(guardado) as Session;

        // Valida que tenga lo mínimo para considerarse una sesión válida.
        if (!session?.accessToken || !session?.usuario?.id) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return session;
    } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

/** Guarda la sesión del usuario autenticado. */
export function setSession(session: Session): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** Elimina la sesión guardada. */
export function clearSession(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
}

/** Devuelve solo el token, o null si no hay sesión. */
export function getToken(): string | null {
    return getSession()?.accessToken ?? null;
}
