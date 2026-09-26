/**
 * Servicio de usuarios mockeado con persistencia en localStorage.
 */

import { createLocalStore } from "@/lib/persistence"
import type { User, UserCreateRequest, UserUpdateRequest } from "@/features/usuarios/types"

interface StoredUser extends User {
    password: string
}

// Seed inicial, basado en los datos reales de la tabla `users`.
// Las contraseñas acá son solo para poder loguearse en el mock.
const seed = (): StoredUser[] => [
    {
        id: "1",
        fullName: "Ricardo Pasión",
        email: "admin@pasion.pe",
        role: "admin",
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
        password: "admin123",
    },
    {
        id: "2",
        fullName: "Vendedor Mock",
        email: "vendedor@eip.com",
        role: "vendedor",
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
        password: "vendedor123",
    },
    {
        id: "3",
        fullName: "Taller Mock",
        email: "taller@eip.com",
        role: "taller",
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
        password: "taller123",
    },
]

const store = createLocalStore<StoredUser[]>("usuarios", seed)

function delay<T>(value: T, ms = 500): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Quita la contraseña antes de devolver un usuario al resto de la app.
function toPublicUser({ password: _password, ...user }: StoredUser): User {
    return user
}

// --- Funciones del servicio (una por endpoint futuro) ---

export async function getUsersService(): Promise<User[]> {
    return delay(store.get().map(toPublicUser))
}

export async function createUserService(data: UserCreateRequest): Promise<User> {
    const users = store.get()

    const yaExiste = users.some(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
    )
    if (yaExiste) {
        await delay(null, 300)
        throw new Error("Ya existe un usuario con ese email")
    }

    const nuevo: StoredUser = {
        id: crypto.randomUUID(),
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
        password: data.password,
    }

    store.set([nuevo, ...users])
    return delay(toPublicUser(nuevo))
}

export async function updateUserService(
    id: string,
    data: UserUpdateRequest
): Promise<User> {
    const users = store.get()
    const index = users.findIndex((u) => u.id === id)

    if (index === -1) {
        await delay(null, 300)
        throw new Error("Usuario no encontrado")
    }

    const emailDuplicado = users.some(
        (u) => u.id !== id && u.email.toLowerCase() === data.email.toLowerCase()
    )
    if (emailDuplicado) {
        await delay(null, 300)
        throw new Error("Ya existe un usuario con ese email")
    }

    const actualizado: StoredUser = {
        ...users[index],
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        // Si no mandan password nueva, se conserva la actual.
        password: data.password || users[index].password,
    }

    const nuevaLista = [...users]
    nuevaLista[index] = actualizado
    store.set(nuevaLista)
    return delay(toPublicUser(actualizado))
}

export async function deleteUserService(id: string): Promise<void> {
    store.set(store.get().filter((u) => u.id !== id))
    return delay(undefined)
}

/**
 * Verifica email + contraseña contra el mismo store que usa el
 * módulo de administración. La usa authService.login.
 */
export async function verifyCredentialsService(
    email: string,
    password: string
): Promise<User> {
    const users = store.get()
    const encontrado = users.find(
        (u) =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!encontrado) {
        await delay(null, 300)
        throw new Error("Email o contraseña incorrectos")
    }

    if (!encontrado.isActive) {
        await delay(null, 300)
        throw new Error("Tu cuenta está inactiva. Contactá a un administrador.")
    }

    return delay(toPublicUser(encontrado))
}