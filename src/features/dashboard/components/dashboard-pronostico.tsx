"use client"

/**
 * Pronóstico de demanda del Dashboard.
 *
 * Muestra la demanda proyectada por semana y permite analizar
 * individualmente cada producto.
 */

import { useMemo, useState } from "react"

import {
    AlertTriangle,
    BarChart3,
    CalendarRange,
    PackageSearch,
    TrendingUp,
} from "lucide-react"

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ReferenceLine,
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
import { getUnitSymbol } from "@/lib/units"
import { cn } from "@/lib/utils"
import type { UnitType } from "@/types/products"

import { usePronostico } from "../hooks/use-pronostico"
import {
    formatPiezas,
    formatSemanaCorta,
    getEtiquetaMetodo,
} from "../utils"

// ==========================================
// TIPOS Y FORMATO
// ==========================================

interface ChartTooltipProps {
    active?: boolean
    label?: string
    payload?: { value?: number | string }[]
    promedio: number
    unidad: string
}

/** Formato compacto para el eje Y. */
const formatEje = (valor: number) =>
    new Intl.NumberFormat("es-PE", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(valor)

/** Tooltip personalizado para la demanda semanal. */
function ChartTooltip({
    active,
    label,
    payload,
    promedio,
    unidad,
}: ChartTooltipProps) {
    if (!active || !payload?.length) return null

    const valor = Number(payload[0].value)
    const sobrePromedio = valor >= promedio

    return (
        <div className="min-w-32 rounded-lg border bg-popover px-3 py-2 shadow-lg">
            <p className="text-xs font-medium text-muted-foreground">
                Semana {label}
            </p>

            <p className="mt-1 text-sm font-semibold tabular-nums">
                {formatPiezas(valor)} {unidad}
            </p>

            <p
                className={cn(
                    "mt-1 flex items-center gap-1 text-xs font-medium",
                    sobrePromedio
                        ? "text-success"
                        : "text-muted-foreground"
                )}
            >
                <TrendingUp className="size-3" aria-hidden="true" />
                {sobrePromedio
                    ? "Sobre el promedio"
                    : "Bajo el promedio"}
            </p>
        </div>
    )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function DashboardPronostico() {
    const { data, isLoading, isError } = usePronostico()

    const productos = useMemo(
        () => data?.productos ?? [],
        [data?.productos]
    )

    const horizonte = data?.horizonteSemanas ?? 4

    const [activo, setActivo] = useState<number | null>(null)
    const [unidadSeleccionada, setUnidadSeleccionada] =
        useState<UnitType | "">("")
    const [productoSeleccionado, setProductoSeleccionado] =
        useState("")

    // ==========================================
    // UNIDADES Y PRODUCTOS
    // ==========================================

    const unidadesDisponibles = useMemo(
        () => Array.from(new Set(productos.map((p) => p.unitType))),
        [productos]
    )

    const unidadActiva = unidadesDisponibles.includes(
        unidadSeleccionada as UnitType
    )
        ? unidadSeleccionada as UnitType
        : unidadesDisponibles[0]

    const productosUnidad = useMemo(
        () => productos.filter((p) => p.unitType === unidadActiva),
        [productos, unidadActiva]
    )

    const simboloUnidad = unidadActiva
        ? getUnitSymbol(unidadActiva)
        : ""

    // ==========================================
    // DEMANDA SEMANAL AGRUPADA
    // ==========================================

    const datos = useMemo(() => {
        const acumulado = new Map<string, number>()

        productosUnidad.forEach((producto) => {
            producto.semanas.forEach((semana) => {
                const actual = acumulado.get(semana.semana) ?? 0

                acumulado.set(
                    semana.semana,
                    actual + semana.unidades
                )
            })
        })

        return Array.from(acumulado.entries())
            .sort(([fechaA], [fechaB]) =>
                fechaA.localeCompare(fechaB)
            )
            .map(([semana, unidades]) => ({
                fecha: semana,
                etiqueta: formatSemanaCorta(semana),
                unidades,
            }))
    }, [productosUnidad])

    // ==========================================
    // INDICADORES
    // ==========================================

    const totalDemanda = productosUnidad.reduce(
        (total, producto) =>
            total +
            producto.semanas.reduce(
                (suma, semana) => suma + semana.unidades,
                0
            ),
        0
    )

    const promedioSemanal =
        datos.length > 0
            ? totalDemanda / datos.length
            : 0

    const semanaPico =
        datos.length > 0
            ? datos.reduce(
                (pico, semana) =>
                    semana.unidades > pico.unidades ? semana : pico,
                datos[0]!
            )
            : null

    const indicePico = semanaPico
        ? datos.findIndex((d) => d.fecha === semanaPico.fecha)
        : -1

    const productosPocoFiables = productosUnidad.filter(
        (producto) => !producto.confiable
    ).length

    // ==========================================
    // PRODUCTO SELECCIONADO
    // ==========================================

    const productoActivo =
        productos.find(
            (p) => String(p.productId) === productoSeleccionado
        ) ?? productos[0]

    const datosProducto = useMemo(
        () =>
            (productoActivo?.semanas ?? []).map((semana) => ({
                etiqueta: formatSemanaCorta(semana.semana),
                unidades: semana.unidades,
            })),
        [productoActivo]
    )

    const totalProducto = productoActivo
        ? productoActivo.semanas.reduce(
            (total, semana) => total + semana.unidades,
            0
        )
        : 0

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
                        <TrendingUp className="size-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                        <CardTitle className="text-base">
                            Pronóstico de demanda
                        </CardTitle>

                        <CardDescription className="text-xs text-foreground/60">
                            Unidades esperadas en las próximas {horizonte} semanas
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-0">

                {/* CARGANDO */}

                {isLoading ? (
                    <div className="space-y-3" aria-busy="true">
                        <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-20 rounded-xl" />
                            <Skeleton className="h-20 rounded-xl" />
                        </div>
                        <Skeleton className="h-56 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>

                /* ERROR */

                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 px-5 py-9 text-center ring-1 ring-primary/10">
                        <AlertTriangle
                            className="size-6 text-warning"
                            aria-hidden="true"
                        />

                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                No se pudo calcular el pronóstico
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Intenta de nuevo en unos minutos.
                            </p>
                        </div>
                    </div>

                /* SIN DATOS */

                ) : productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 px-5 py-9 text-center ring-1 ring-primary/10">
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                            <PackageSearch
                                className="size-5 text-primary"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Aún no hay historial suficiente
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Se necesitan al menos 8 semanas de ventas
                                por producto para pronosticar.
                            </p>
                        </div>
                    </div>

                ) : (
                    <>

                        {/* =================================
                            INDICADORES PRINCIPALES
                        ================================= */}

                        <dl className="grid grid-cols-2 gap-2">

                            <div className="flex items-center gap-2.5 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                <div
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                                    aria-hidden="true"
                                >
                                    <TrendingUp className="size-4" />
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Demanda proyectada
                                    </dt>

                                    <dd className="truncate text-base font-semibold tabular-nums">
                                        {formatPiezas(totalDemanda)}
                                    </dd>

                                    <p className="text-xs text-muted-foreground">
                                        {simboloUnidad} · {horizonte} semanas
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                <div
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                                    aria-hidden="true"
                                >
                                    <PackageSearch className="size-4" />
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Productos analizados
                                    </dt>

                                    <dd className="text-base font-semibold tabular-nums">
                                        {productosUnidad.length}
                                    </dd>

                                    <p className="text-xs text-muted-foreground">
                                        {productosPocoFiables} poco fiables
                                    </p>
                                </div>
                            </div>

                        </dl>

                        {/* =================================
                            GRÁFICA GENERAL
                        ================================= */}

                        <section className="flex flex-col gap-3">

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="size-4 text-primary" />

                                        <h3 className="text-sm font-semibold">
                                            Demanda por semana
                                        </h3>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Distribución de unidades esperadas
                                    </p>
                                </div>

                                {unidadesDisponibles.length > 1 && (
                                    <select
                                        aria-label="Seleccionar unidad"
                                        value={unidadActiva ?? ""}
                                        onChange={(e) => {
                                            setUnidadSeleccionada(
                                                e.target.value as UnitType
                                            )
                                            setActivo(null)
                                        }}
                                        className="h-8 max-w-36 rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {unidadesDisponibles.map((unidad) => (
                                            <option key={unidad} value={unidad}>
                                                {getUnitSymbol(unidad)}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {datos.length > 0 ? (
                                <div
                                    className="h-56 w-full rounded-xl bg-background/80 px-2 pb-2 pt-2 shadow-sm ring-1 ring-foreground/10"
                                    aria-label="Gráfica de demanda semanal"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={datos}
                                            margin={{
                                                top: 24,
                                                right: 5,
                                                left: 0,
                                                bottom: 0,
                                            }}
                                            barCategoryGap="18%"
                                            onMouseMove={(state) => {
                                                const i = state?.activeTooltipIndex
                                                setActivo(
                                                    typeof i === "number" ? i : null
                                                )
                                            }}
                                            onMouseLeave={() => setActivo(null)}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="pronostico-pico"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        style={{
                                                            stopColor: "var(--primary)",
                                                            stopOpacity: 1,
                                                        }}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        style={{
                                                            stopColor: "var(--primary)",
                                                            stopOpacity: 0.7,
                                                        }}
                                                    />
                                                </linearGradient>

                                                <linearGradient
                                                    id="pronostico-normal"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        style={{
                                                            stopColor: "var(--primary)",
                                                            stopOpacity: 0.6,
                                                        }}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        style={{
                                                            stopColor: "var(--primary)",
                                                            stopOpacity: 0.3,
                                                        }}
                                                    />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid
                                                vertical={false}
                                                stroke="var(--border)"
                                                strokeDasharray="3 6"
                                                strokeOpacity={0.8}
                                            />

                                            <XAxis
                                                dataKey="etiqueta"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                tick={{
                                                    fill: "var(--muted-foreground)",
                                                    fontSize: 10,
                                                }}
                                            />

                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                width={36}
                                                allowDecimals={false}
                                                tickFormatter={formatEje}
                                                tick={{
                                                    fill: "var(--muted-foreground)",
                                                    fontSize: 10,
                                                }}
                                            />

                                            <Tooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltip
                                                        promedio={promedioSemanal}
                                                        unidad={simboloUnidad}
                                                    />
                                                }
                                            />

                                            <ReferenceLine
                                                y={promedioSemanal}
                                                stroke="var(--primary)"
                                                strokeDasharray="6 6"
                                                strokeOpacity={0.55}
                                                ifOverflow="extendDomain"
                                                label={{
                                                    value: `Prom. ${formatEje(promedioSemanal)}`,
                                                    position: "insideTopRight",
                                                    fill: "var(--primary)",
                                                    fontSize: 10,
                                                    fontWeight: 600,
                                                    dy: -5,
                                                }}
                                            />

                                            <Bar
                                                dataKey="unidades"
                                                name="Demanda"
                                                radius={[7, 7, 7, 7]}
                                                maxBarSize={38}
                                                minPointSize={4}
                                                background={{
                                                    fill: "var(--muted)",
                                                    fillOpacity: 0.55,
                                                    radius: 7,
                                                }}
                                                animationDuration={700}
                                            >
                                                {datos.map((d, i) => (
                                                    <Cell
                                                        key={d.fecha}
                                                        fill={
                                                            i === indicePico
                                                                ? "url(#pronostico-pico)"
                                                                : "url(#pronostico-normal)"
                                                        }
                                                        fillOpacity={
                                                            activo === null || activo === i
                                                                ? 1
                                                                : 0.45
                                                        }
                                                        style={{
                                                            transition: "fill-opacity 150ms",
                                                        }}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="rounded-xl bg-background/80 px-4 py-8 text-center ring-1 ring-foreground/10">
                                    <p className="text-xs text-muted-foreground">
                                        No hay semanas pronosticadas para esta unidad.
                                    </p>
                                </div>
                            )}

                        </section>

                        {/* =================================
                            MÉTRICAS DE LA DEMANDA
                        ================================= */}

                        <dl className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">

                            <div className="flex items-center gap-2.5 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                    <BarChart3 className="size-4" />
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Promedio semanal
                                    </dt>

                                    <dd className="truncate text-base font-semibold tabular-nums">
                                        {formatPiezas(promedioSemanal)}
                                    </dd>
                                </div>
                            </div>

                            {semanaPico && (
                                <div className="flex items-center gap-2.5 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
                                        <CalendarRange className="size-4" />
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                        <dt className="text-xs font-medium text-muted-foreground">
                                            Semana de mayor demanda
                                        </dt>

                                        <dd className="truncate text-base font-semibold tabular-nums">
                                            {semanaPico.etiqueta}
                                        </dd>

                                        <p className="text-xs text-muted-foreground">
                                            {formatPiezas(semanaPico.unidades)} {simboloUnidad}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2.5 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                    <TrendingUp className="size-4" />
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Horizonte
                                    </dt>

                                    <dd className="truncate text-base font-semibold tabular-nums">
                                        {horizonte} semanas
                                    </dd>
                                </div>
                            </div>

                        </dl>

                        {/* =================================
                            ANÁLISIS INDIVIDUAL
                        ================================= */}

                        <section className="flex flex-col gap-3 border-t border-border pt-4">

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-semibold">
                                        Análisis por producto
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        Consulta la evolución de cada producto
                                    </p>
                                </div>

                                <select
                                    aria-label="Seleccionar producto"
                                    value={productoActivo?.productId ?? ""}
                                    onChange={(e) =>
                                        setProductoSeleccionado(e.target.value)
                                    }
                                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-56"
                                >
                                    {productos.map((producto) => (
                                        <option
                                            key={producto.productId}
                                            value={producto.productId}
                                        >
                                            {producto.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {productoActivo && (
                                <>

                                    {/* INFORMACIÓN DEL PRODUCTO */}

                                    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                        <div className="min-w-0 space-y-1">
                                            <p className="truncate text-sm font-semibold">
                                                {productoActivo.nombre}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-mono">
                                                    {productoActivo.sku}
                                                </span>
                                                {" · "}
                                                {getEtiquetaMetodo(productoActivo.metodo)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-base font-semibold tabular-nums">
                                                {formatPiezas(totalProducto)}{" "}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {getUnitSymbol(productoActivo.unitType)}
                                                </span>
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Demanda total
                                            </p>
                                        </div>
                                    </div>

                                    {/* GRÁFICA INDIVIDUAL */}

                                    {datosProducto.length > 0 ? (
                                        <div
                                            className="h-48 w-full rounded-xl bg-background/80 px-2 pb-2 pt-2 shadow-sm ring-1 ring-foreground/10"
                                            aria-label="Evolución del pronóstico del producto"
                                        >
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={datosProducto}
                                                    margin={{
                                                        top: 10,
                                                        right: 5,
                                                        left: 0,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        vertical={false}
                                                        stroke="var(--border)"
                                                        strokeDasharray="3 6"
                                                        strokeOpacity={0.8}
                                                    />

                                                    <XAxis
                                                        dataKey="etiqueta"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        tick={{
                                                            fill: "var(--muted-foreground)",
                                                            fontSize: 10,
                                                        }}
                                                    />

                                                    <YAxis
                                                        tickLine={false}
                                                        axisLine={false}
                                                        width={36}
                                                        allowDecimals={false}
                                                        tickFormatter={formatEje}
                                                        tick={{
                                                            fill: "var(--muted-foreground)",
                                                            fontSize: 10,
                                                        }}
                                                    />

                                                    <Tooltip
                                                        formatter={(value) => [
                                                            `${formatPiezas(Number(value))} ${getUnitSymbol(productoActivo.unitType)}`,
                                                            "Demanda",
                                                        ]}
                                                        contentStyle={{
                                                            borderRadius: "10px",
                                                            border: "1px solid var(--border)",
                                                            backgroundColor: "var(--popover)",
                                                            fontSize: "12px",
                                                        }}
                                                    />

                                                    <Line
                                                        type="monotone"
                                                        dataKey="unidades"
                                                        name="Demanda"
                                                        stroke="var(--primary)"
                                                        strokeWidth={2.5}
                                                        dot={{
                                                            r: 3,
                                                            fill: "var(--primary)",
                                                            strokeWidth: 2,
                                                            stroke: "var(--background)",
                                                        }}
                                                        activeDot={{ r: 5 }}
                                                        animationDuration={700}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <p className="rounded-xl bg-background/80 py-7 text-center text-xs text-muted-foreground">
                                            No hay semanas pronosticadas para este producto.
                                        </p>
                                    )}

                                    {/* CONFIABILIDAD */}

                                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Error en pruebas pasadas (WAPE)
                                            </p>

                                            <p className="text-sm font-semibold tabular-nums">
                                                {productoActivo.wape !== null
                                                    ? `${Math.round(productoActivo.wape * 100)}%`
                                                    : "No medido"}
                                            </p>
                                        </div>

                                        {productoActivo.confiable ? (
                                            <Badge
                                                variant="outline"
                                                className="border-success/40 text-success"
                                            >
                                                Pronóstico fiable
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 border-warning/40 text-warning"
                                            >
                                                <AlertTriangle
                                                    className="size-3"
                                                    aria-hidden="true"
                                                />
                                                Poco fiable
                                            </Badge>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                )}
            </CardContent>
        </Card>
    )
}