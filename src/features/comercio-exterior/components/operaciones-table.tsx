"use client"

/**
 * Tabla de operaciones de comercio exterior: buscador libre, filtros,
 * contador, detalle en dialog y paginación.
 */

import { Eye, Inbox, Search, X } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

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
import { PaginationBar } from "@/components/common/pagination-bar"

import { OperacionFiltersBar } from "./operacion-filters-bar"
import { useOperacionFilters } from "../hooks"
import type { OperacionComercioExterior } from "../types"
import {
    formatOperacionCount,
    formatUSD,
    getTipoOperacionLabel,
    getTipoOperacionTint,
} from "../utils"

interface OperacionesTableProps {
    operaciones: OperacionComercioExterior[]
    onView: (operacion: OperacionComercioExterior) => void
}

// Anchos flexibles para distribuir proporcionalmente el espacio al 100% del contenedor
const COLUMN_WIDTHS = {
    folio: "w-[12%] min-w-[90px]",
    fecha: "w-[13%] min-w-[100px]",
    tipo: "w-[15%] min-w-[120px]",
    socioComercial: "w-[22%] min-w-[160px]",
    pais: "w-[14%] min-w-[110px]",
    responsable: "w-[12%] min-w-[110px]",
    total: "w-[12%] min-w-[110px]",
    ver: "w-[50px]",
} as const

export function OperacionesTable({
    operaciones,
    onView,
}: OperacionesTableProps) {
    const {
        search,
        setSearch,
        tipo,
        setTipo,
        socioComercial,
        setSocioComercial,
        sociosComerciales,
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
    } = useOperacionFilters(operaciones)

    return (
        <div className="space-y-5 sm:space-y-4">
            <OperacionFiltersBar
                socioComercial={socioComercial}
                onSocioComercialChange={setSocioComercial}
                socioComercialOptions={sociosComerciales}
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
                <InputGroup className="h-9 w-full max-w-sm border-border bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1">
                    <InputGroupAddon align="inline-start">
                        <Search
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                        />
                    </InputGroupAddon>

                    <InputGroupInput
                        placeholder="Buscar por folio, cliente o país..."
                        aria-label="Buscar por folio, cliente o país"
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
                    className="h-9 w-fit border-primary/30 bg-primary/10 px-3 text-xs font-medium text-primary"
                >
                    {formatOperacionCount(totalCount)}
                </Badge>
            </div>

            {/* Contenedor de la Tabla */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-primary hover:bg-primary border-b-0">
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.folio
                                )}
                            >
                                N°
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.fecha
                                )}
                            >
                                Fecha
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.tipo
                                )}
                            >
                                Tipo
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.socioComercial
                                )}
                            >
                                Socio comercial
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.pais
                                )}
                            >
                                País
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.responsable
                                )}
                            >
                                Responsable
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-right text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.total
                                )}
                            >
                                Total (USD)
                            </TableHead>
                            <TableHead
                                className={cn(
                                    "h-11 px-4 text-center text-xs font-semibold tracking-wide text-primary-foreground uppercase",
                                    COLUMN_WIDTHS.ver
                                )}
                            >
                                Acción
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageItems.length ? (
                            pageItems.map((operacion) => (
                                <TableRow
                                    key={operacion.id}
                                    className="hover:bg-accent/50 transition-colors"
                                >
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3",
                                            COLUMN_WIDTHS.folio
                                        )}
                                    >
                                        <span className="font-mono text-xs font-semibold text-primary">
                                            {operacion.folio}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3",
                                            COLUMN_WIDTHS.fecha
                                        )}
                                    >
                                        <time
                                            dateTime={operacion.fecha}
                                            className="text-xs text-foreground"
                                        >
                                            {formatDate(operacion.fecha)}
                                        </time>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3",
                                            COLUMN_WIDTHS.tipo
                                        )}
                                    >
                                        <Badge
                                            className={cn(
                                                "h-6 w-fit gap-1 px-2.5 text-xs font-semibold shadow-none",
                                                getTipoOperacionTint(
                                                    operacion.tipo
                                                )
                                            )}
                                        >
                                            {getTipoOperacionLabel(
                                                operacion.tipo
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3",
                                            COLUMN_WIDTHS.socioComercial
                                        )}
                                    >
                                        <span className="block truncate text-xs font-medium text-foreground">
                                            {operacion.socioComercial.nombre}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3",
                                            COLUMN_WIDTHS.pais
                                        )}
                                    >
                                        <span className="block truncate text-xs text-muted-foreground">
                                            {operacion.socioComercial.pais}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3",
                                            COLUMN_WIDTHS.responsable
                                        )}
                                    >
                                        <span className="block truncate text-xs text-foreground">
                                            {operacion.responsable}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3 text-right",
                                            COLUMN_WIDTHS.total
                                        )}
                                    >
                                        <span className="text-xs font-bold tabular-nums text-foreground">
                                            {formatUSD(operacion.totalUSD)}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            "px-4 py-3 text-center",
                                            COLUMN_WIDTHS.ver
                                        )}
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onView(operacion)}
                                            aria-label={`Ver detalle de la operación ${operacion.folio}`}
                                                className="size-8 cursor-pointer rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                                        >
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-40 px-4 text-center"
                                >
                                    <div className="mx-auto flex w-fit flex-col items-center gap-2 text-muted-foreground">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                            <Inbox
                                                className="size-6"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <p className="text-xs font-medium">
                                            No se encontraron operaciones.
                                        </p>
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
                    formatCount: formatOperacionCount,
                }}
            />
        </div>
    )
}