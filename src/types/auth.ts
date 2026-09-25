export type Rol = "admin" | "vendedor" | "taller";

export interface Usuario {
    id: string;        // UUID del usuario en la tabla users
    nombre: string;    // Guardado dentro de raw_user_meta_data.nombre
    email?: string;    // Columna email en la tabla users
    rol: Rol;          // Guardado dentro de raw_user_meta_data.rol
}