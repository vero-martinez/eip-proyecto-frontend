"use client"

import { useMemo, useState } from "react"

import {
    AlertTriangle,
    BarChart3,
    CalendarRange,
    PackageCheck,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from "lucide-react"

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getUnitSymbol } from "@/lib/units"
import type { UnitType } from "@/types/products"

import { useReposicion } from "../hooks/use-reposicion"
import type { EstadoReposicion, ReposicionProducto } from "../types"
import { formatPiezas, formatSemanaCorta } from "../utils"

// ==========================================
// ESTADOS Y CONFIGURACIÓN
// ==========================================

const ESTADOS: Record<
    EstadoReposicion,
    { label: string; className: string; color: string }
> = {
    pedir_ya: {
        label: "Pedir ya",
        className: "border-destructive/40 text-destructive",
        color: "url(#reposicion-urgente)",
    },
    pedir_pronto: {
        label: "Pedir pronto",
        className: "border-warning/40 text-warning",
        color: "url(#reposicion-pronto)",
    },
    suficiente: {
        label: "Stock suficiente",
        className: "border-success/40 text-success",
        color: "url(#reposicion-suficiente)",
    },
    sin_demanda: {
        label: "Sin demanda",
        className: "border-muted text-muted-foreground",
        color: "url(#reposicion-sin-demanda)",
    },
}

// ==========================================
// UTILIDADES
// ==========================================

function getCobertura(item: ReposicionProducto, horizonte: number): string {
    if (item.semanasCobertura === null) {
        return `Cubre las próximas ${horizonte} semanas`
    }

    if (item.semanasCobertura === 0) {
        return "Sin stock disponible"
    }

    return `Stock para ~${item.semanasCobertura.toFixed(1)} semanas`
}

function getAccion(item: ReposicionProducto): string {
    switch (item.estado) {
        case "pedir_ya":
            return "Pedir esta semana"
        case "pedir_pronto":
            return item.fechaLimitePedido
                ? `Pedir antes del ${formatSemanaCorta(item.fechaLimitePedido)}`
                : "Quedaría bajo el mínimo: reponer pronto"
        case "suficiente":
            return "No hace falta pedir"
        default:
            return "Sin ventas previstas"
    }
}

function formatEje(valor: number): string {
    return new Intl.NumberFormat("es-PE", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(valor)
}

// ==========================================
// TOOLTIP DEL GRÁFICO
// ==========================================

function StockTooltip({
    active,
    payload,
    label,
    unidad,
}: {
    active?: boolean
    payload?: Array<{
        name?: string
        value?: number
        color?: string
    }>
    label?: string
    unidad: string
}) {
    if (!active || !payload?.length) return null

    const stock = payload.find((item) => item.name === "Stock actual")
    const minimo = payload.find((item) => item.name === "Stock mínimo")

    return (
        <div className="min-w-40 rounded-lg border bg-popover px-3 py-2 shadow-lg">
            <p className="mb-2 max-w-52 truncate text-xs font-semibold">
                {label}
            </p>

            <div className="space-y-1.5 text-xs">
                {stock && (
                    <p className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="size-2 rounded-full bg-primary" />
                            Stock actual
                        </span>
                        <span className="font-semibold tabular-nums">
                            {formatPiezas(Number(stock.value ?? 0))} {unidad}
                        </span>
                    </p>
                )}

                {minimo && (
                    <p className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="size-2 rounded-full bg-muted-foreground" />
                            Stock mínimo
                        </span>
                        <span className="font-semibold tabular-nums">
                            {formatPiezas(Number(minimo.value ?? 0))} {unidad}
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
}

// ==========================================
// TARJETA DE INDICADOR
// ==========================================

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    iconClassName,
}: {
    title: string
    value: string | number
    description: string
    icon: typeof ShoppingCart
    iconClassName?: string
}) {
    return (
        <div className="rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                    {title}
                </p>

                <Icon
                    className={cn("size-4 text-muted-foreground", iconClassName)}
                    aria-hidden="true"
                />
            </div>

            <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">
                {value}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function DashboardReposicion() {
    const { data, isLoading, isError } = useReposicion()

    const productos = useMemo(
        () => data?.productos ?? [],
        [data?.productos]
    )

    const horizonte = data?.horizonteSemanas ?? 4

    const [unidadSeleccionada, setUnidadSeleccionada] = useState("")
    const [productoSeleccionadoId, setProductoSeleccionadoId] =
        useState<number | null>(null)

    // ==========================================
    // UNIDADES Y PRODUCTOS
    // ==========================================

    const unidades = useMemo(
        () => [...new Set(productos.map((item) => item.unitType))],
        [productos]
    )

    const unidadActiva = unidades.includes(unidadSeleccionada as UnitType)
        ? (unidadSeleccionada as UnitType)
        : unidades[0]

    const productosUnidad = useMemo(
        () =>
            productos.filter((item) => item.unitType === unidadActiva),
        [productos, unidadActiva]
    )

    const productoSeleccionado =
        productosUnidad.find(
            (item) => item.productId === productoSeleccionadoId
        ) ?? productosUnidad[0]

    const simbolo = unidadActiva
        ? getUnitSymbol(unidadActiva)
        : ""

    // ==========================================
    // RESUMEN DE REPOSICIÓN
    // ==========================================

    const resumen = useMemo(() => {
        const pedirYa = productosUnidad.filter(
            (item) => item.estado === "pedir_ya"
        ).length

        const pedirPronto = productosUnidad.filter(
            (item) => item.estado === "pedir_pronto"
        ).length

        const suficientes = productosUnidad.filter(
            (item) => item.estado === "suficiente"
        ).length

        const sinDemanda = productosUnidad.filter(
            (item) => item.estado === "sin_demanda"
        ).length

        const cantidadSugerida = productosUnidad.reduce(
            (total, item) => total + item.cantidadSugerida,
            0
        )

        const stockTotal = productosUnidad.reduce(
            (total, item) => total + item.stockActual,
            0
        )

        return {
            pedirYa,
            pedirPronto,
            suficientes,
            sinDemanda,
            cantidadSugerida,
            stockTotal,
        }
    }, [productosUnidad])

    // ==========================================
    // DATOS DEL GRÁFICO
    // ==========================================

    const datosGrafico = useMemo(
        () =>
            productosUnidad.map((item) => ({
                ...item,
                nombre:
                    item.nombre.length > 19
                        ? `${item.nombre.slice(0, 19)}…`
                        : item.nombre,
            })),
        [productosUnidad]
    )

    const plazo = productoSeleccionado?.plazoSemanas

    // ==========================================
    // RENDERIZADO
    // ==========================================

    return (
        <Card className="h-full overflow-hidden border-primary/20 bg-primary/15 shadow-sm">

            {/* ENCABEZADO */}

            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 p-4 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                        aria-hidden="true"
                    >
                        <ShoppingCart className="size-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                        <CardTitle className="text-base">
                            Reposición de stock
                        </CardTitle>

                        <CardDescription className="text-xs text-foreground/60">
                            Control de inventario y recomendaciones de compra
                        </CardDescription>
                    </div>
                </div>

                {!isLoading && !isError && unidades.length > 1 && (
                    <select
                        value={unidadActiva ?? ""}
                        onChange={(event) => {
                            setUnidadSeleccionada(event.target.value)
                            setProductoSeleccionadoId(null)
                        }}
                        className="h-8 max-w-32 rounded-lg border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Filtrar por unidad"
                    >
                        {unidades.map((unidad) => (
                            <option key={unidad} value={unidad}>
                                {getUnitSymbol(unidad)}
                            </option>
                        ))}
                    </select>
                )}
            </CardHeader>

            <CardContent className="space-y-3 px-4 pb-4 pt-0">

                {/* CARGANDO */}

                {isLoading ? (
                    <div className="space-y-3" aria-busy="true">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-24 rounded-xl"
                                />
                            ))}
                        </div>

                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>

                /* ERROR */

                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 px-5 py-9 text-center ring-1 ring-primary/10">
                        <AlertTriangle
                            className="size-6 text-warning"
                            aria-hidden="true"
                        />

                        <p className="text-sm font-medium">
                            No se pudo calcular la reposición
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Intenta de nuevo en unos minutos.
                        </p>
                    </div>

                /* SIN DATOS */

                ) : productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 px-5 py-9 text-center ring-1 ring-primary/10">
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                            <PackageCheck
                                className="size-5 text-primary"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Sin recomendaciones todavía
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Hacen falta al menos 8 semanas de ventas por producto.
                            </p>
                        </div>
                    </div>

                ) : (
                    <>

                        {/* =================================
                            INDICADORES
                        ================================= */}

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <MetricCard
                                title="Pedir ya"
                                value={resumen.pedirYa}
                                description="Productos urgentes"
                                icon={AlertTriangle}
                                iconClassName="text-destructive"
                            />

                            <MetricCard
                                title="Pedir pronto"
                                value={resumen.pedirPronto}
                                description="Requieren atención"
                                icon={TrendingDown}
                                iconClassName="text-warning"
                            />

                            <MetricCard
                                title="Stock suficiente"
                                value={resumen.suficientes}
                                description="Sin necesidad de compra"
                                icon={PackageCheck}
                                iconClassName="text-success"
                            />

                            <MetricCard
                                title="Cantidad sugerida"
                                value={formatPiezas(resumen.cantidadSugerida)}
                                description={`Total recomendado · ${simbolo}`}
                                icon={ShoppingCart}
                                iconClassName="text-primary"
                            />
                        </div>

                        {/* =================================
                            GRÁFICO DE STOCK
                        ================================= */}

                        <section className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                                        <BarChart3 className="size-4 text-primary" />
                                        Stock actual vs. mínimo
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        Comparación por producto · {simbolo}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-primary" />
                                        Stock actual
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-muted-foreground" />
                                        Stock mínimo
                                    </span>
                                </div>
                            </div>

                            {datosGrafico.length > 0 ? (
                                <div className="h-64 w-full rounded-xl bg-background/80 px-2 pb-2 pt-3 shadow-sm ring-1 ring-foreground/10 sm:px-3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={datosGrafico}
                                            layout="vertical"
                                            margin={{
                                                top: 4,
                                                right: 12,
                                                left: 4,
                                                bottom: 4,
                                            }}
                                            barCategoryGap="25%"
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="reposicion-urgente"
                                                    x1="0"
                                                    y1="0"
                                                    x2="1"
                                                    y2="0"
                                                >
                                                    <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.65} />
                                                    <stop offset="100%" stopColor="var(--destructive)" />
                                                </linearGradient>

                                                <linearGradient
                                                    id="reposicion-pronto"
                                                    x1="0"
                                                    y1="0"
                                                    x2="1"
                                                    y2="0"
                                                >
                                                    <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.65} />
                                                    <stop offset="100%" stopColor="var(--warning)" />
                                                </linearGradient>

                                                <linearGradient
                                                    id="reposicion-suficiente"
                                                    x1="0"
                                                    y1="0"
                                                    x2="1"
                                                    y2="0"
                                                >
                                                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.65} />
                                                    <stop offset="100%" stopColor="var(--success)" />
                                                </linearGradient>

                                                <linearGradient
                                                    id="reposicion-sin-demanda"
                                                    x1="0"
                                                    y1="0"
                                                    x2="1"
                                                    y2="0"
                                                >
                                                    <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="var(--muted-foreground)" />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid
                                                horizontal={false}
                                                stroke="var(--border)"
                                                strokeDasharray="3 6"
                                                strokeOpacity={0.8}
                                            />

                                            <XAxis
                                                type="number"
                                                tickFormatter={formatEje}
                                                tick={{
                                                    fill: "var(--muted-foreground)",
                                                    fontSize: 10,
                                                }}
                                                tickLine={false}
                                                axisLine={false}
                                            />

                                            <YAxis
                                                type="category"
                                                dataKey="nombre"
                                                width={108}
                                                tick={{
                                                    fill: "var(--muted-foreground)",
                                                    fontSize: 10,
                                                }}
                                                tickLine={false}
                                                axisLine={false}
                                            />

                                            <Tooltip
                                                cursor={{
                                                    fill: "var(--muted)",
                                                    opacity: 0.3,
                                                }}
                                                content={
                                                    <StockTooltip unidad={simbolo} />
                                                }
                                            />

                                            <Bar
                                                dataKey="stockActual"
                                                name="Stock actual"
                                                radius={[0, 7, 7, 0]}
                                                maxBarSize={16}
                                                animationDuration={700}
                                            >
                                                {datosGrafico.map((item) => (
                                                    <Cell
                                                        key={item.productId}
                                                        fill={ESTADOS[item.estado].color}
                                                    />
                                                ))}
                                            </Bar>

                                            <Bar
                                                dataKey="stockMinimo"
                                                name="Stock mínimo"
                                                fill="var(--muted-foreground)"
                                                fillOpacity={0.35}
                                                radius={[0, 7, 7, 0]}
                                                maxBarSize={16}
                                                animationDuration={700}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="rounded-xl bg-background/80 px-5 py-8 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
                                    No hay productos para esta unidad.
                                </div>
                            )}
                        </section>

                        {/* =================================
                            DETALLE DEL PRODUCTO
                        ================================= */}

                        {productoSeleccionado && (
                            <section className="space-y-3 border-t border-border pt-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="space-y-0.5">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <CalendarRange className="size-4 text-primary" />
                                            Detalle de reposición
                                        </h3>

                                        <p className="text-xs text-muted-foreground">
                                            Revisa la recomendación de cada producto
                                        </p>
                                    </div>

                                    <select
                                        value={productoSeleccionado.productId}
                                        onChange={(event) =>
                                            setProductoSeleccionadoId(
                                                Number(event.target.value)
                                            )
                                        }
                                        className="h-8 max-w-52 rounded-lg border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                                        aria-label="Seleccionar producto"
                                    >
                                        {productosUnidad.map((item) => (
                                            <option
                                                key={item.productId}
                                                value={item.productId}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {productoSeleccionado.nombre}
                                            </p>

                                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                {productoSeleccionado.sku}
                                            </p>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "shrink-0",
                                                ESTADOS[productoSeleccionado.estado].className
                                            )}
                                        >
                                            {ESTADOS[productoSeleccionado.estado].label}
                                        </Badge>
                                    </div>

                                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                        <div className="rounded-lg bg-muted/40 p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Stock actual
                                            </p>

                                            <p className="mt-1 text-base font-semibold tabular-nums">
                                                {formatPiezas(productoSeleccionado.stockActual)}
                                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                    {simbolo}
                                                </span>
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Mínimo: {formatPiezas(productoSeleccionado.stockMinimo)}
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-muted/40 p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Cobertura estimada
                                            </p>

                                            <p className="mt-1 text-sm font-semibold">
                                                {getCobertura(productoSeleccionado, horizonte)}
                                            </p>

                                            {productoSeleccionado.semanaAgotamiento && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Agotamiento:{" "}
                                                    {formatSemanaCorta(productoSeleccionado.semanaAgotamiento)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="rounded-lg bg-muted/40 p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Demanda del horizonte
                                            </p>

                                            <p className="mt-1 text-base font-semibold tabular-nums">
                                                {formatPiezas(productoSeleccionado.demandaHorizonte)}
                                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                    {simbolo}
                                                </span>
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Próximas {horizonte} semanas
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {getAccion(productoSeleccionado)}
                                            </p>

                                            {plazo !== undefined && (
                                                <p className="text-xs text-muted-foreground">
                                                    Plazo supuesto: {plazo}{" "}
                                                    {plazo === 1 ? "semana" : "semanas"}
                                                </p>
                                            )}
                                        </div>

                                        {productoSeleccionado.cantidadSugerida > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">
                                                    Cantidad recomendada
                                                </p>

                                                <p className="text-base font-bold tabular-nums text-primary">
                                                    {formatPiezas(productoSeleccionado.cantidadSugerida)}{" "}
                                                    {simbolo}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {!productoSeleccionado.confiable && (
                                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
                                            <AlertTriangle className="size-4 shrink-0" />
                                            El pronóstico de este producto es poco fiable.
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* =================================
                            INFORMACIÓN ADICIONAL
                        ================================= */}

                        {resumen.sinDemanda > 0 && (
                            <p className="text-center text-xs text-muted-foreground">
                                {resumen.sinDemanda}{" "}
                                {resumen.sinDemanda === 1
                                    ? "producto sin demanda prevista"
                                    : "productos sin demanda prevista"}{" "}
                                en esta unidad.
                            </p>
                        )}

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="size-3.5" />
                            Análisis basado en un horizonte de {horizonte} semanas
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}