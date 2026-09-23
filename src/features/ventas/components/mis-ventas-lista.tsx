"use client"

/**
 * Componente: MisVentasLista
 * Descripción: Muestra el historial de ventas del vendedor con ordenamiento,
 * filtro por rango de fechas, resumen de productos y acceso a la boleta.
 */

import { useMemo, useState } from "react"
import {
    ArrowUpDown,
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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PaginationBar } from "@/components/common/pagination-bar"
import { ClearFiltersButton } from "@/components/common/clear-filters-button"
import { ListItemCard } from "@/components/common/list-item-card"
import { VentaBoletaDialog } from "@/features/ventas/components/boleta-dialog"
import { cn, formatCurrency } from "@/lib/utils"
import type { Venta } from "@/features/ventas/types"
import { TIPOS_VENTA } from "@/features/ventas/constants"

import {
    formatVentaDateTime,
    formatVentaItems,
    getMetodoPagoLabel,
    getTipoVentaLabel,
    isInDateRange,
} from "../utils"

interface MisVentasListaProps {
    ventas: Venta[]
}

type SortOption = "recent" | "oldest"

const PAGE_SIZE = 10

const SORT_ITEMS: Record<SortOption, string> = {
    recent: "Más recientes",
    oldest: "Más antiguas",
}

const TIPO_FILTER_ITEMS: Record<string, string> = {
    all: "Todos",
    ...Object.fromEntries(TIPOS_VENTA.map((option) => [option.value, option.label])),
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

export function MisVentasLista({ ventas }: MisVentasListaProps) {
    const [sort, setSort] = useState<SortOption>("recent")
    const [tipo, setTipo] = useState("all")
    const [desde, setDesde] = useState("")
    const [hasta, setHasta] = useState("")
    const [page, setPage] = useState(0)
    const [boletaSeleccionada, setBoletaSeleccionada] = useState<Venta | null>(null)

    const hasRange = Boolean(desde || hasta)
    const hasFilters = Boolean(tipo !== "all" || hasRange)

    const items = useMemo(() => {
        const filtered = ventas.filter(
            (venta) =>
                isInDateRange(venta.createdAt, desde || undefined, hasta || undefined) &&
                (tipo === "all" || venta.tipoVenta === tipo)
        )

        return [...filtered].sort((a, b) => {
            const diff =
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            return sort === "recent" ? diff : -diff
        })
    }, [ventas, sort, tipo, desde, hasta])

    const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
    const safePage = Math.min(page, pageCount - 1)
    const pageItems = items.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

    const clearFilters = () => {
        setPage(0)
        setTipo("all")
        setSort("recent")
        setDesde("")
        setHasta("")
    }

    return (
        <>
            <Card className="overflow-hidden border-violet-200/60 shadow-md dark:border-violet-900/40">
            <CardHeader className="gap-4 pb-4">
                {/* Controles de filtro y ordenamiento */}
                <div 
                    role="search"
                    aria-label="Filtros de historial de ventas"
                    className="flex flex-col items-center gap-3 rounded-2xl border border-violet-200/70 bg-white/60 p-3.5 dark:border-violet-900/40 dark:bg-slate-900/60 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                        <div className="flex w-full flex-col items-center text-center sm:w-auto sm:items-start sm:text-left gap-1">
                            <label
                                htmlFor="ventas-desde"
                                className="text-[11px] font-bold uppercase tracking-wider text-violet-900/70 dark:text-violet-300"
                            >
                                Desde
                            </label>
                            <Input
                                id="ventas-desde"
                                type="date"
                                value={desde}
                                onChange={(e) => {
                                    setPage(0)
                                    setDesde(e.target.value)
                                }}
                                className="h-8 w-full sm:w-36 border-violet-200 text-xs text-center sm:text-left focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-violet-800"
                            />
                        </div>

                        <div className="flex w-full flex-col items-center text-center sm:w-auto sm:items-start sm:text-left gap-1">
                            <label
                                htmlFor="ventas-hasta"
                                className="text-[11px] font-bold uppercase tracking-wider text-violet-900/70 dark:text-violet-300"
                            >
                                Hasta
                            </label>
                            <Input
                                id="ventas-hasta"
                                type="date"
                                value={hasta}
                                onChange={(e) => {
                                    setPage(0)
                                    setHasta(e.target.value)
                                }}
                                className="h-8 w-full sm:w-36 border-violet-200 text-xs text-center sm:text-left focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-violet-800"
                            />
                        </div>

                        {hasFilters && (
                            <ClearFiltersButton
                                onClick={clearFilters}
                                ariaLabel="Limpiar todos los filtros activos"
                                className="h-8"
                            />
                        )}
                    </div>

                    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:ml-auto">
                        <Select
                            value={tipo}
                            onValueChange={(val) => {
                                setPage(0)
                                setTipo(val ?? "all")
                            }}
                            items={TIPO_FILTER_ITEMS}
                        >
                            <SelectTrigger
                                size="sm"
                                aria-label="Filtrar por tipo de venta"
                                className="h-8 w-full sm:w-auto justify-center gap-2 border-violet-300/80 text-xs font-bold text-violet-900 dark:border-violet-800 dark:text-violet-200"
                            >
                                <Store className="size-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="all">Todos</SelectItem>
                                {TIPOS_VENTA.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={sort}
                            onValueChange={(val) => {
                                setPage(0)
                                setSort((val ?? "recent") as SortOption)
                            }}
                            items={SORT_ITEMS}
                        >
                            <SelectTrigger
                                size="sm"
                                aria-label="Ordenar resultados por fecha"
                                className="h-8 w-full sm:w-auto justify-center gap-2 border-violet-300/80 text-xs font-bold text-violet-900 dark:border-violet-800 dark:text-violet-200"
                            >
                                <ArrowUpDown className="size-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="recent">Más recientes</SelectItem>
                                <SelectItem value="oldest">Más antiguas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pt-0">
                {ventas.length === 0 ? (
                    <div 
                        role="status" 
                        className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300/60 bg-violet-50/40 p-4 text-center dark:border-violet-900/50 dark:bg-violet-950/20"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-violet-500 text-white">
                            <Receipt className="size-6" aria-hidden="true" />
                        </div>
                        <p className="text-base font-bold text-foreground">
                            Aún no tenés ventas registradas
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Tus ventas del punto de venta aparecerán acá en tiempo real.
                        </p>
                    </div>
                ) : items.length === 0 ? (
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
                                    description={formatVentaItems(venta.items)}
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

            {ventas.length > 0 && items.length > 0 && (
                <div className="border-t border-violet-100/60 px-4 py-3 dark:border-violet-900/30">
                    <PaginationBar
                        page={safePage}
                        pageCount={pageCount}
                        onPageChange={setPage}
                        summary={{
                            from: items.length === 0 ? 0 : safePage * PAGE_SIZE + 1,
                            to: Math.min(items.length, (safePage + 1) * PAGE_SIZE),
                            total: items.length,
                            formatCount: (count) =>
                                `${count} venta${count !== 1 ? "s" : ""}`,
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