"use client"

/**
 * Lista de historial de movimientos de inventario (ledger unificado),
 * con cards reutilizables de ListItemCard: buscador libre, filtros,
 * contador, detalle en dialog y paginación.
 */

import { useMemo } from "react"
import {
    ArrowDownLeft,
    ArrowUpRight,
    ChevronRight,
    Eye,
    Inbox,
    Search,
    Trash2,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { PaginationBar } from "@/components/common/pagination-bar"
import { ListItemCard } from "@/components/common/list-item-card"

import { MovimientoFiltersBar } from "./movimiento-filters-bar"
import { useMovimientoFilters } from "../hooks/use-movimiento-filters"
import type { InventoryMovement, MovementType } from "../types"
import {
    formatMovementCount,
    formatMovementQuantity,
    formatVentaDateTime,
    getMovementTint,
    getMovementTypeLabel,
} from "../utils"

interface MovimientosListProps {
    movements: InventoryMovement[]
    onView: (movement: InventoryMovement) => void
}

const MOVEMENT_TONE: Record<
    MovementType,
    {
        border: string
        accent: string
        avatar: string
        cantidad: string
    }
> = {
    entrada: {
        border: "border-success/40",
        accent: "border-l-success",
        avatar: "bg-success/15 text-success",
        cantidad: "text-success",
    },
    venta: {
        border: "border-primary/40",
        accent: "border-l-primary",
        avatar: "bg-primary/15 text-primary",
        cantidad: "text-destructive",
    },
    merma: {
        border: "border-destructive/40",
        accent: "border-l-destructive",
        avatar: "bg-destructive/15 text-destructive",
        cantidad: "text-destructive",
    },
    importacion: {
        border: "border-info/40",
        accent: "border-l-info",
        avatar: "bg-info/15 text-info",
        cantidad: "text-success",
    },
    exportacion: {
        border: "border-cat-6/40",
        accent: "border-l-cat-6",
        avatar: "bg-cat-6/15 text-cat-6",
        cantidad: "text-destructive",
    },
}

function getMovementIcon(type: MovementType) {
    if (type === "entrada" || type === "importacion") return ArrowDownLeft
    if (type === "venta" || type === "exportacion") return ArrowUpRight
    return Trash2
}

export function MovimientosList({
    movements,
    onView,
}: MovimientosListProps) {
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
                    className="h-9 w-fit border-primary/30 bg-primary/10 px-3 text-xs font-medium text-primary"
                >
                    {formatMovementCount(totalCount)}
                </Badge>
            </div>

            {/* Lista de movimientos */}
            {pageItems.length ? (
                <ul aria-label="Listado de movimientos" className="space-y-3">
                    {pageItems.map((movement) => {
                        const tone = MOVEMENT_TONE[movement.movementType]
                        const Icon = getMovementIcon(movement.movementType)

                        return (
                            <ListItemCard
                                key={movement.id}
                                className="bg-card"
                                borderClassName={tone.border}
                                accentClassName={tone.accent}
                                avatarClassName={tone.avatar}
                                icon={Icon}
                                title={movement.productName}
                                titleMeta={
                                    <time dateTime={movement.createdAt}>
                                        {formatVentaDateTime(movement.createdAt)}
                                    </time>
                                }
                                badges={
                                    <Badge
                                        className={cn(
                                            "h-5 w-fit gap-1 text-[11px] font-semibold",
                                            getMovementTint(
                                                movement.movementType
                                            )
                                        )}
                                    >
                                        {getMovementTypeLabel(
                                            movement.movementType
                                        )}
                                    </Badge>
                                }
                                description={`${movement.sku} · ${movement.responsable}`}
                                trailing={
                                    <>
                                        <span
                                            className={cn(
                                                "text-lg font-bold tabular-nums",
                                                tone.cantidad
                                            )}
                                        >
                                            {formatMovementQuantity(movement)}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onView(movement)}
                                            aria-label={`Ver detalle del movimiento ${movement.id}`}
                                            className="h-8 gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
                                        >
                                            <Eye
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            <span>Ver detalle</span>
                                            <ChevronRight
                                                className="size-3 opacity-60"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </>
                                }
                            />
                        )
                    })}
                </ul>
            ) : (
                <div
                    role="status"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/70 bg-muted/30 p-10 text-center text-muted-foreground"
                >
                    <div className="flex size-11 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50">
                        <Inbox
                            className="size-5 text-muted-foreground/70"
                            aria-hidden="true"
                        />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        No se encontraron movimientos.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Probá con otros filtros o limpiá la búsqueda activa.
                    </p>
                </div>
            )}

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