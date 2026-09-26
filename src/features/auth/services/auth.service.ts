/**
 * Servicio de autenticación mockeado.
 * Delega la verificación de credenciales en usersService, que es
 * la misma fuente de datos que usa el módulo de administración de
 * usuarios — así un usuario creado desde ahí puede loguearse.
 */

import type { Usuario } from "@/types/auth"
import { verifyCredentialsService } from "@/features/usuarios/users.service"

export const authService = {
    login: async (email: string, password: string): Promise<Usuario> => {
        const user = await verifyCredentialsService(email, password)

        // Adapta la forma de User (admin) a Usuario (sesión).
        return {
            id: user.id,
            nombre: user.fullName,
            rol: user.role,
        }
    },
}