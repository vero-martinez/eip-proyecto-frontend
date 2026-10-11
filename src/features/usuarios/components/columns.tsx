"use client"

/**
 * Definición de columnas de la tabla de usuarios.
 */

import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import type { User } from "../types"
import type { Rol } from "@/types/auth"

const ROLE_LABELS: Record<Rol, string> = {
    admin: "Administrador",
    vendedor: "Vendedor",
    taller: "Taller",
}

const ROLE_BADGE_CLASSES: Record<Rol, string> = {
    admin: "border-cat-2/40 bg-cat-2/15 text-cat-2",
    vendedor: "border-cat-1/40 bg-cat-1/15 text-cat-1",
    taller: "border-cat-5/40 bg-cat-5/15 text-cat-5",
}

interface Column {
    key: string
    header: string
    width?: string
    render: (user: User) => React.ReactNode
}

export function getUserColumns(
    onEdit: (user: User) => void,
    onDelete: (user: User) => void
): Column[] {
    return [
        {
            key: "fullName",
            header: "Nombre",
            width: "w-56",
            render: (user) => (
                <span className="font-medium text-foreground">{user.fullName}</span>
            ),
        },
        {
            key: "email",
            header: "Email",
            width: "w-64",
            render: (user) => (
                <span className="text-muted-foreground">{user.email}</span>
            ),
        },
        {
            key: "role",
            header: "Rol",
            width: "w-40",
            render: (user) => (
                <Badge variant="outline" className={ROLE_BADGE_CLASSES[user.role]}>
                    {ROLE_LABELS[user.role]}
                </Badge>
            ),
        },
        {
            key: "isActive",
            header: "Estado",
            width: "w-32",
            render: (user) => <StatusBadge active={user.isActive} />,
        },
        {
            key: "createdAt",
            header: "Creado",
            width: "w-36",
            render: (user) => (
                <span className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            width: "w-24",
            render: (user) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${user.fullName}`}
                        onClick={() => onEdit(user)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Eliminar ${user.fullName}`}
                        onClick={() => onDelete(user)}
                    >
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ]
}