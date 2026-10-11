/**
 * Tipos del módulo de administración de usuarios.
 */
import type { Rol } from "@/types/auth"

export type StatusFilter = "all" | "active" | "inactive"
export type SortBy = "newest" | "oldest" | "name"

export interface User {
    id: string
    fullName: string
    email: string
    role: Rol
    isActive: boolean
    createdAt: string
}

export interface UserCreateRequest {
    fullName: string
    email: string
    role: Rol
    password: string
    isActive: boolean
}

export interface UserUpdateRequest {
    fullName: string
    email: string
    role: Rol
    isActive: boolean
    password?: string
}