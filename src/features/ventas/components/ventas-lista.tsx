"use client"

/**
 * Componente: VentasLista
 * Descripción: Muestra el historial de ventas con resumen de productos,
 * paginación y acceso a la boleta, montado sobre las barras de filtros
 * de ventas-filters-bar.
 *
 * Lo comparten "Mis ventas" (que le pasa solo sus propias ventas) y la
 * vista de admin, que activa los controles propios del listado global:
 * filtro por responsable y buscador por folio.
 */

import { useMemo, useState } from "react"
import {
    CalendarRange,
    Receipt,
    Store,
    Tent,
    Globe,
    Banknote,
    Smartphone,
    CreditCard,
    ChevronRight,
} from "lucide-react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PaginationBar } from "@/components/common/pagination-bar"
import { ListItemCard } from "@/components/common/list-item-card"
import type { SearchableSelectOption } from "@/components/common/searchable-select"
import { VentaBoletaDialog } from "@/features/ventas/components/boleta-dialog"
import {
    VentasFiltersBar,
    VentasSearchBar,
} from "@/features/ventas/components/ventas-filters-bar"
import { cn, formatCurrency } from "@/lib/utils"
import type { Venta } from "@/features/ventas/types"

import { useVentasFilters } from "../hooks/use-ventas-filters"
import {
    formatVentaDateTime,
    formatVentaItems,
    getMetodoPagoLabel,
    getResponsablesOpciones,
    getTipoVentaLabel,
} from "../utils"

interface VentasListaProps {
    ventas: Venta[]
    /**
     * Vista global: agrega el filtro por responsable y lo muestra en
     * cada card. El valor es controlado por la página, que también lo
     * necesita para recalcular las tarjetas de métricas.
     */
    mostrarResponsable?: boolean
    responsable?: string
    onResponsableChange?: (value: string) => void
    /** Vista global: agrega el buscador por folio en una barra secundaria. */
    mostrarBuscador?: boolean
}

const TIPO_VENTA_CONFIG: Record<
    string,
    {
        badge: string
        borderAccent: string
        avatarBg: string
        icon?: React.ElementType
    }
> = {
    tienda: {
        badge: "border-cat-1/40 bg-cat-1/15 text-cat-1",
        borderAccent: "border-l-cat-1",
        avatarBg: "bg-cat-1/15 text-cat-1",
        icon: Store,
    },
    feria: {
        badge: "border-cat-5/40 bg-cat-5/15 text-cat-5",
        borderAccent: "border-l-cat-5",
        avatarBg: "bg-cat-5/15 text-cat-5",
        icon: Tent,
    },
    digital: {
        badge: "border-info/40 bg-info/15 text-info",
        borderAccent: "border-l-info",
        avatarBg: "bg-info/15 text-info",
        icon: Globe,
    },
    otro: {
        badge: "border-border bg-muted text-muted-foreground",
        borderAccent: "border-l-muted-foreground",
        avatarBg: "bg-muted text-muted-foreground",
    },
}

const METODO_PAGO_CONFIG: Record<
    string,
    { badge: string; icon: React.ElementType }
> = {
    efectivo: {
        badge: "border-success/40 bg-success/15 text-success",
        icon: Banknote,
    },
    "billetera-digital": {
        badge: "border-cat-6/40 bg-cat-6/15 text-cat-6",
        icon: Smartphone,
    },
}

const FALLBACK_CONFIG = {
    badge: "border-border bg-muted text-muted-foreground",
    borderAccent: "border-l-muted-foreground",
    avatarBg: "bg-muted text-muted-foreground",
    icon: CreditCard,
}

/** Formatea el total para el resumen de la paginación. */
const formatVentaCount = (count: number) =>
    `${count} venta${count !== 1 ? "s" : ""}`

export function VentasLista({
    ventas,
    mostrarResponsable = false,
    responsable = "all",
    onResponsableChange,
    mostrarBuscador = false,
}: VentasListaProps) {
    const {
        search,
        setSearch,
        tipo,
        setTipo,
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
    } = useVentasFilters(ventas, responsable)

    const [boletaSeleccionada, setBoletaSeleccionada] = useState<Venta | null>(null)

    const responsableOptions: SearchableSelectOption[] = useMemo(
        () => getResponsablesOpciones(ventas),
        [ventas]
    )

    /** El responsable está controlado por la página, hay que reiniciarlo allá. */
    const handleClearFilters = () => {
        clearFilters()
        onResponsableChange?.("all")
    }

    return (
        <>
            <Card className="overflow-hidden border-primary/20 shadow-md">
            <CardHeader className="gap-4 pb-4">
                <VentasFiltersBar
                    mostrarResponsable={mostrarResponsable}
                    responsable={responsable}
                    onResponsableChange={onResponsableChange}
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
                    onClearFilters={handleClearFilters}
                />
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pt-0">
                {/* Barra secundaria: buscador por folio */}
                {mostrarBuscador && ventas.length > 0 && (
                    <VentasSearchBar
                        search={search}
                        onSearchChange={setSearch}
                    />
                )}

                {ventas.length === 0 ? (
                    <div
                        role="status"
                        className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Receipt className="size-6" aria-hidden="true" />
                        </div>
                        <p className="text-base font-bold text-foreground">
                            {mostrarResponsable
                                ? "Aún no hay ventas registradas"
                                : "Aún no tenés ventas registradas"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {mostrarResponsable
                                ? "Las ventas del punto de venta aparecerán acá en tiempo real."
                                : "Tus ventas del punto de venta aparecerán acá en tiempo real."}
                        </p>
                    </div>
                ) : totalCount === 0 ? (
                    <div
                        role="status"
                        className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-warning/30 bg-warning/5 p-4 text-center"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                            <CalendarRange className="size-6" aria-hidden="true" />
                        </div>
                        <p className="text-base font-bold text-foreground">
                            Sin ventas en el rango seleccionado
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Probá con otro rango de fechas o limpiá el filtro activo.
                        </p>
                    </div>
                ) : (
                    <ul
                        aria-label="Listado de ventas"
                        className="space-y-3"
                    >
                        {pageItems.map((venta) => {
                            const tipoConfig = TIPO_VENTA_CONFIG[venta.tipoVenta] ?? FALLBACK_CONFIG
                            const metodoConfig = METODO_PAGO_CONFIG[venta.metodoPago] ?? FALLBACK_CONFIG

                            const TipoIcon = tipoConfig.icon
                            const MetodoIcon = metodoConfig.icon

                            const tipoLabel = getTipoVentaLabel(venta.tipoVenta)
                            const metodoLabel = getMetodoPagoLabel(venta.metodoPago)
                            const formattedTotal = formatCurrency(venta.total)
                            const resumenItems = formatVentaItems(venta.items)
                            const descripcion = mostrarResponsable
                                ? `${resumenItems} · ${venta.responsable}`
                                : resumenItems

                            return (
                                <ListItemCard
                                    key={venta.id}
                                    className="hover:border-primary/40"
                                    accentClassName={tipoConfig.borderAccent}
                                    avatarClassName={tipoConfig.avatarBg}
                                    icon={Receipt}
                                    title={`Boleta #${venta.folio}`}
                                    titleClassName="font-mono text-sm font-extrabold tracking-tight"
                                    titleMeta={
                                        <time dateTime={venta.createdAt}>
                                            {formatVentaDateTime(venta.createdAt)}
                                        </time>
                                    }
                                    badges={
                                        <>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                                                    tipoConfig.badge
                                                )}
                                            >
                                                {TipoIcon && (
                                                    <TipoIcon
                                                        className="size-3"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <span>{tipoLabel}</span>
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                                                    metodoConfig.badge
                                                )}
                                            >
                                                {MetodoIcon && (
                                                    <MetodoIcon
                                                        className="size-3"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <span>{metodoLabel}</span>
                                            </Badge>
                                        </>
                                    }
                                    description={descripcion}
                                    trailing={
                                        <>
                                            <span
                                                className="text-2xl font-black tracking-tight text-foreground tabular-nums"
                                                aria-label={`Total: ${formattedTotal}`}
                                            >
                                                {formattedTotal}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setBoletaSeleccionada(venta)
                                                }
                                                aria-label={`Ver boleta número ${venta.folio}`}
                                                className="h-8 gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
                                            >
                                                <Receipt
                                                    className="size-3.5"
                                                    aria-hidden="true"
                                                />
                                                <span>Ver boleta</span>
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
                )}
            </CardContent>

            {ventas.length > 0 && totalCount > 0 && (
                <div className="border-t border-border px-4 py-3">
                    <PaginationBar
                        page={page}
                        pageCount={pageCount}
                        onPageChange={goToPage}
                        summary={{
                            from: rangeStart,
                            to: rangeEnd,
                            total: totalCount,
                            formatCount: formatVentaCount,
                        }}
                        ariaLabel="Paginación de historial de ventas"
                    />
                </div>
            )}
            </Card>

            <VentaBoletaDialog
                venta={boletaSeleccionada}
                onOpenChange={(open) => {
                    if (!open) setBoletaSeleccionada(null)
                }}
            />
        </>
    )
}
