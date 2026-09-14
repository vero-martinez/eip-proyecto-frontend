/**
 * Tipos globales de autenticación y roles.
 * Se centralizan para que todo el proyecto use la misma estructura
 * de usuario y los mismos roles.
 */
export type Rol = "admin" | "vendedor" | "taller";

export interface Usuario {
    id: string;
    nombre: string;
    rol: Rol;
}