"use client"

/**
 * Filtros de la tabla de usuarios: rol, estado y orden.
 */

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Rol } from "@/types/auth"
import type { StatusFilter, SortBy } from "../types"

interface UserFiltersProps {
    roleFilter: Rol | "all"
    statusFilter: StatusFilter
    sortBy: SortBy
    onRoleChange: (value: Rol | "all") => void
    onStatusChange: (value: StatusFilter) => void
    onSortChange: (value: SortBy) => void
}

export function UserFilters({
    roleFilter,
    statusFilter,
    sortBy,
    onRoleChange,
    onStatusChange,
    onSortChange,
}: UserFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Select
                value={roleFilter}
                onValueChange={(value) => onRoleChange((value ?? "all") as Rol | "all")}
                items={{
                    all: "Todos los roles",
                    admin: "Administrador",
                    vendedor: "Vendedor",
                    taller: "Taller",
                }}
            >
                <SelectTrigger
                    className="w-44 border-border bg-primary/30 shadow-sm"
                    aria-label="Filtrar por rol"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="taller">Taller</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={statusFilter}
                onValueChange={(value) => onStatusChange((value ?? "all") as StatusFilter)}
                items={{ all: "Estados", active: "Activos", inactive: "Inactivos" }}
            >
                <SelectTrigger
                    className="w-32 border-border bg-primary/30 shadow-sm"
                    aria-label="Filtrar por estado"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={sortBy}
                onValueChange={(value) => onSortChange((value ?? "newest") as SortBy)}
                items={{
                    newest: "Más recientes",
                    oldest: "Más antiguos",
                    name: "Nombre (A-Z)",
                }}
            >
                <SelectTrigger
                    className="w-44 border-border bg-primary/30 shadow-sm"
                    aria-label="Ordenar usuarios"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="oldest">Más antiguos</SelectItem>
                    <SelectItem value="name">Nombre (A-Z)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}