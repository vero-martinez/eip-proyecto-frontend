"use client"

/**
 * Tabla de usuarios, usando los componentes Table de shadcn/ui y
 * el hook useUserFilters para búsqueda, filtros, orden y paginación
 * client-side.
 */

import { Plus, Inbox, Search, X } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClearFiltersButton } from "@/components/common/clear-filters-button"
import { PaginationBar } from "@/components/common/pagination-bar"
import { UserFilters } from "./user-filters"
import { getUserColumns } from "./columns"
import { useUserFilters } from "@/features/usuarios/hooks"
import type { User } from "../types"

interface UsersTableProps {
    users: User[]
    onEdit: (user: User) => void
    onDelete: (user: User) => void
    onCreate: () => void
}

export function UsersTable({ users, onEdit, onDelete, onCreate }: UsersTableProps) {
    const columns = getUserColumns(onEdit, onDelete)

    const {
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        pageItems,
        totalCount,
        page,
        pageCount,
        rangeStart,
        rangeEnd,
        hasActiveFilters,
        clearFilters,
        goToPage,
    } = useUserFilters(users)

    return (
        <div className="space-y-5 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <UserFilters
                        roleFilter={roleFilter}
                        statusFilter={statusFilter}
                        sortBy={sortBy}
                        onRoleChange={setRoleFilter}
                        onStatusChange={setStatusFilter}
                        onSortChange={setSortBy}
                    />
                    {hasActiveFilters && <ClearFiltersButton onClick={clearFilters} />}
                </div>
                <Button
                    onClick={onCreate}
                    className="w-full h-10 order-first sm:w-auto sm:order-last"
                >
                    <Plus className="size-4" />
                    Nuevo usuario
                </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-3">
                <InputGroup className="w-full max-w-sm h-10 border-border bg-background shadow-sm">
                    <InputGroupAddon align="inline-start">
                        <Search className="size-4 text-primary" aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Buscar por nombre o email..."
                        aria-label="Buscar usuarios"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                size="icon-xs"
                                aria-label="Limpiar búsqueda"
                                onClick={() => setSearch("")}
                            >
                                <X className="size-3.5" />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>
                <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 px-3 py-3 text-base text-primary"
                >
                    {totalCount} {totalCount === 1 ? "usuario" : "usuarios"}
                </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <Table className="table-fixed min-w-[880px]">
                    <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={`h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase ${
                                        column.width ?? ""
                                    }`}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageItems.length ? (
                            pageItems.map((user) => (
                                <TableRow key={user.id} className="hover:bg-accent/50">
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={`px-4 py-3 ${column.width ?? ""}`}
                                        >
                                            {column.render(user)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 px-4 text-center">
                                    <div className="mx-auto flex w-fit flex-col items-center gap-2 text-muted-foreground">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                            <Inbox className="size-6" aria-hidden="true" />
                                        </div>
                                        <p className="text-sm">No se encontraron usuarios.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationBar
                page={page}
                pageCount={pageCount}
                onPageChange={goToPage}
                summary={{
                    from: rangeStart,
                    to: rangeEnd,
                    total: totalCount,
                    formatCount: (n) => `${n} ${n === 1 ? "usuario" : "usuarios"}`,
                }}
            />
        </div>
    )
}