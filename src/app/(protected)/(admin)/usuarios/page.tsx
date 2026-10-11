"use client"

/**
 * Página de administración de usuarios (solo Admin).
 * Junta los hooks de datos
 * con los componentes de features/users (stats, tabla y los dos
 * diálogos: crear/editar y eliminar).
 */

import { useState } from "react"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

import { DeleteDialog } from "@/components/common/delete-dialog"
import { useUsers, useDeleteUser } from "@/features/usuarios/hooks"
import { UsersStats } from "@/features/usuarios/components/users-stats"
import { UsersTable } from "@/features/usuarios/components/users-table"
import { UserForm } from "@/features/usuarios/components/user-form"
import type { User } from "@/features/usuarios/types"

export default function UsersPage() {
    const { data: users, isLoading, isError } = useUsers()
    const deleteUser = useDeleteUser()

    const [formOpen, setFormOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined)
    const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined)

    const userList = users ?? []

    const handleCreate = () => {
        setUserToEdit(undefined)
        setFormOpen(true)
    }

    const handleEdit = (user: User) => {
        setUserToEdit(user)
        setFormOpen(true)
    }

    const handleDelete = (user: User) => {
        setUserToDelete(user)
        setDeleteOpen(true)
    }

    const handleFormOpenChange = (open: boolean) => {
        setFormOpen(open)
        if (!open) setUserToEdit(undefined)
    }

    const handleDeleteOpenChange = (open: boolean) => {
        setDeleteOpen(open)
        if (!open) setUserToDelete(undefined)
    }

    const handleConfirmDelete = () => {
        if (!userToDelete) return

        deleteUser.mutate(userToDelete.id, {
            onSuccess: () => {
                toast.success("Usuario eliminado correctamente")
                handleDeleteOpenChange(false)
            },
            onError: (error) => {
                toast.error(error.message)
            },
        })
    }

    if (isError) {
        return (
            <div
                role="alert"
                className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
            >
                <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
                <p>No se pudieron cargar los usuarios. Intentá nuevamente.</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
                Cargando usuarios...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <UsersStats users={userList} />

            <div className="mt-6 sm:mt-10">
                <UsersTable
                    users={userList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                />
            </div>

            <UserForm open={formOpen} onOpenChange={handleFormOpenChange} user={userToEdit} />

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={handleDeleteOpenChange}
                title="¿Eliminar usuario?"
                message={
                    <>
                        Esta acción no se puede deshacer. Se eliminará permanentemente al usuario{" "}
                        <span className="font-medium text-foreground">
                            {userToDelete?.fullName}
                        </span>{" "}
                        <span className="text-xs text-muted-foreground/80">
                            {userToDelete?.email}
                        </span>
                        .
                    </>
                }
                isLoading={deleteUser.isPending}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}