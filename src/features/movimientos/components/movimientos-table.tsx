"use client"

/**
 * Tabla de historial de movimientos de inventario (ledger unificado),
 * con el mismo layout que la tabla de productos: fila de filtros,
 * búsqueda libre, total, columna de acciones y paginación.
 */

import { useMemo } from "react"
import { Inbox, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PaginationBar } from "@/components/common/pagination-bar"

import { getMovimientoColumns } from "./columns"
import { MovimientoFiltersBar } from "./movimiento-filters-bar"
import { useMovimientoFilters } from "../hooks/use-movimiento-filters"
import type { InventoryMovement } from "../types"
import { formatMovementCount } from "../utils"

interface MovimientosTableProps {
    movements: InventoryMovement[]
    onView: (movement: InventoryMovement) => void
}

export function MovimientosTable({
    movements,
    onView,
}: MovimientosTableProps) {
    const {
        search,
        setSearch,
        tipo,
        setTipo,
        responsable,
        setResponsable,
        desde,
        setDesde,
        hasta,
        setHasta,
        sort,
        setSort,
        pageItems,
        totalCount,
        page,
        pageCount,
        rangeStart,
        rangeEnd,
        hasActiveFilters,
        clearFilters,
        goToPage,
    } = useMovimientoFilters(movements)

    const columns = getMovimientoColumns(onView)

    const responsableOptions = useMemo(() => {
        const names = new Set<string>()

        for (const movement of movements) {
            if (movement.responsable) names.add(movement.responsable)
        }

        return [...names]
            .sort((a, b) => a.localeCompare(b))
            .map((name) => ({ value: name, label: name }))
    }, [movements])

    return (
        <div className="space-y-4">
            <MovimientoFiltersBar
                responsable={responsable}
                onResponsableChange={setResponsable}
                responsableOptions={responsableOptions}
                desde={desde}
                onDesdeChange={setDesde}
                hasta={hasta}
                onHastaChange={setHasta}
                tipo={tipo}
                onTipoChange={setTipo}
                sort={sort}
                onSortChange={setSort}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
            />

            {/* Barra secundaria: buscador de texto libre y contador */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <InputGroup className="h-9 w-full max-w-sm border-border bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1">
                    <InputGroupAddon align="inline-start">
                        <Search
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                    </InputGroupAddon>

                    <InputGroupInput
                        placeholder="Buscar por producto o SKU..."
                        aria-label="Buscar por nombre de producto o código SKU"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="text-xs"
                    />

                    {search && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                size="icon-xs"
                                aria-label="Limpiar campo de búsqueda"
                                onClick={() => setSearch("")}
                            >
                                <X className="size-3.5" />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>

                <Badge
                    variant="outline"
                    className="h-9 w-fit border-violet-300 bg-violet-50/50 px-3 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                >
                    {formatMovementCount(totalCount)}
                </Badge>
            </div>

            {/* Tabla de movimientos */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={`h-10 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase ${
                                        column.className ?? ""
                                    }`}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {pageItems.length ? (
                            pageItems.map((movement) => (
                                <TableRow
                                    key={movement.id}
                                    className="hover:bg-muted/50"
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={`px-4 py-2.5 text-sm ${
                                                column.className ?? ""
                                            }`}
                                        >
                                            {column.render(movement)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-40 px-6 text-center"
                                >
                                    <div className="mx-auto flex w-fit flex-col items-center gap-2 text-muted-foreground">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <Inbox
                                                className="size-5"
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <p className="text-xs">
                                            No se encontraron movimientos.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <PaginationBar
                page={page}
                pageCount={pageCount}
                onPageChange={goToPage}
                summary={{
                    from: rangeStart,
                    to: rangeEnd,
                    total: totalCount,
                    formatCount: formatMovementCount,
                }}
            />
        </div>
    )
}
