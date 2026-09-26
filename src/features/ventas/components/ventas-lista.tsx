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
        badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        borderAccent: "border-l-purple-500",
        avatarBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300",
        icon: Store,
    },
    feria: {
        badge: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        borderAccent: "border-l-amber-500",
        avatarBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
        icon: Tent,
    },
    digital: {
        badge: "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
        borderAccent: "border-l-cyan-500",
        avatarBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300",
        icon: Globe,
    },
    otro: {
        badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
        borderAccent: "border-l-slate-400",
        avatarBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
}

const METODO_PAGO_CONFIG: Record<
    string,
    { badge: string; icon: React.ElementType }
> = {
    efectivo: {
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        icon: Banknote,
    },
    "billetera-digital": {
        badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        icon: Smartphone,
    },
}

const FALLBACK_CONFIG = {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
    borderAccent: "border-l-slate-300",
    avatarBg: "bg-slate-100 text-slate-600",
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
            <Card className="overflow-hidden border-violet-200/60 shadow-md dark:border-violet-900/40">
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
                        className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300/60 bg-violet-50/40 p-4 text-center dark:border-violet-900/50 dark:bg-violet-950/20"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-violet-500 text-white">
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
                        className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300/60 bg-amber-50/40 p-4 text-center dark:border-amber-900/50 dark:bg-amber-950/20"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500 text-white">
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
                                    className="border-violet-100 hover:border-violet-300 dark:border-violet-900/30"
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
                                                className="text-2xl font-black tracking-tight text-slate-900 tabular-nums dark:text-slate-50"
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
                                                className="h-8 gap-1.5 rounded-xl bg-violet-600 text-xs font-bold text-white hover:bg-violet-700 hover:text-white dark:bg-violet-600 dark:hover:bg-violet-700 dark:hover:text-white"
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
                <div className="border-t border-violet-100/60 px-4 py-3 dark:border-violet-900/30">
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
