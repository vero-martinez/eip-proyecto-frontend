/**
 * Servicio de usuarios contra la API de FastAPI.
 *
 * Las reglas de negocio se validan en el backend.
 */

import api from "@/lib/axios"
import type {
    User,
    UserCreateRequest,
    UserUpdateRequest,
} from "@/features/usuarios/types"

// ===== Usuarios =====

/** Lista los usuarios. */
export async function getUsersService(): Promise<User[]> {
    const { data } = await api.get<User[]>("/usuarios")
    return data
}

/** Crea un usuario. */
export async function createUserService(
    data: UserCreateRequest
): Promise<User> {
    const { data: created } = await api.post<User>("/usuarios", data)
    return created
}

/** Actualiza un usuario. */
export async function updateUserService(
    id: string,
    data: UserUpdateRequest
): Promise<User> {
    const { password, ...resto } = data
    const payload = password ? { ...resto, password } : resto

    const { data: updated } = await api.put<User>(`/usuarios/${id}`, payload)
    return updated
}

/** Elimina un usuario. */
export async function deleteUserService(id: string): Promise<void> {
    await api.delete(`/usuarios/${id}`)
}