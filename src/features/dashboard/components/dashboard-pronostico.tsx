"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import {
    AlertTriangle,
    CalendarRange,
    Info,
    PackageSearch,
    RefreshCw,
    TrendingUp,
} from "lucide-react"
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import { getUnitSymbol } from "@/lib/units"
import { cn } from "@/lib/utils"
import type { UnitType } from "@/types/products"

import { usePronostico } from "../hooks/use-pronostico"
import type { PronosticoProducto } from "../types"
import {
    formatPiezas,
    formatRangoSemanal,
    formatSemanaCorta,
    getEstadoPrediccion,
    getInicioSemanaISO,
} from "../utils"

interface SemanaReal {
    productId: number
    semana: string
    unidades: number
}

interface DemandaSemanalResponse {
    semanas: SemanaReal[]
}

interface FilaGrafico {
    semana: string
    etiqueta: string
    real: number | null
    pronostico: number | null
    bandaBaja: number | null
    bandaAlta: number | null
    banda: [number, number] | null
}

interface GraficoTooltipProps {
    active?: boolean
    payload?: { payload?: FilaGrafico }[]
}

function GraficoTooltip({ active, payload }: GraficoTooltipProps) {
    const fila = payload?.[0]?.payload
    if (!active || !fila) return null

    return (
        <div className="min-w-48 rounded-xl border bg-popover px-4 py-3 shadow-xl">
            <p className="text-xs font-medium text-muted-foreground">
                Semana del {formatSemanaCorta(fila.semana)}
            </p>

            {fila.real !== null && (
                <p className="mt-2 flex items-center justify-between gap-4 text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="size-2 rounded-full bg-primary" />
                        Vendido
                    </span>
                    <span className="font-semibold tabular-nums">
                        {formatPiezas(fila.real)} unidades
                    </span>
                </p>
            )}

            {fila.pronostico !== null && (
                <>
                    <p className="mt-2 flex items-center justify-between gap-4 text-xs">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="size-2 rounded-full bg-warning" />
                            Estimado
                        </span>
                        <span className="font-semibold tabular-nums">
                            {formatPiezas(fila.pronostico)} unidades
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Rango: {formatPiezas(fila.bandaBaja ?? 0)} a {formatPiezas(fila.bandaAlta ?? 0)} unidades
                    </p>
                </>
            )}
        </div>
    )
}

function construirGrafico(
    producto: PronosticoProducto,
    historial: SemanaReal[]
): FilaGrafico[] {
    const margen = Math.min(
        0.8,
        Math.max(0.05, producto.wape === null ? 0.4 : producto.wape)
    )

    const mapa = new Map<string, FilaGrafico>()

    historial
        .filter((item) => item.productId === producto.productId)
        .sort((a, b) => a.semana.localeCompare(b.semana))
        .slice(-8)
        .forEach((item) => {
            mapa.set(item.semana, {
                semana: item.semana,
                etiqueta: formatSemanaCorta(item.semana),
                real: item.unidades,
                pronostico: null,
                bandaBaja: null,
                bandaAlta: null,
                banda: null,
            })
        })

    producto.semanas.forEach((item) => {
        const previo = mapa.get(item.semana)
        mapa.set(item.semana, {
            semana: item.semana,
            etiqueta: formatSemanaCorta(item.semana),
            real: previo?.real ?? null,
            pronostico: item.unidades,
            bandaBaja: Math.max(0, item.unidades * (1 - margen)),
            bandaAlta: item.unidades * (1 + margen),
            banda: [
                Math.max(0, item.unidades * (1 - margen)),
                item.unidades * (1 + margen),
            ],
        })
    })

    return [...mapa.values()].sort((a, b) => a.semana.localeCompare(b.semana))
}

export function DashboardPronostico() {
    const { data, isLoading, isError, refetch } = usePronostico()
    const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnitType | "">("")
    const [productoSeleccionado, setProductoSeleccionado] = useState("")

    const productos = useMemo(() => data?.productos ?? [], [data?.productos])

    const ids = useMemo(
        () => productos.map((producto) => producto.productId).join(","),
        [productos]
    )

    const historialQuery = useQuery({
        queryKey: ["dashboard", "demanda-semanal", ids],
        enabled: ids.length > 0,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const respuestas = await Promise.all(
                ids.split(",").filter(Boolean).map((productId) =>
                    api.get<DemandaSemanalResponse>("/analitica/demanda/semanal", {
                        params: { product_id: Number(productId) },
                    })
                )
            )
            return respuestas.flatMap((respuesta) => respuesta.data?.semanas ?? [])
        },
    })

    const unidadesDisponibles = useMemo(
        () => Array.from(new Set(productos.map((producto) => producto.unitType))),
        [productos]
    )

    const unidadActiva = unidadesDisponibles.includes(unidadSeleccionada as UnitType)
        ? (unidadSeleccionada as UnitType)
        : unidadesDisponibles[0]

    const productosUnidad = useMemo(
        () => productos.filter((producto) => producto.unitType === unidadActiva),
        [productos, unidadActiva]
    )

    const producto =
        productosUnidad.find(
            (item) => String(item.productId) === productoSeleccionado
        ) ?? productosUnidad[0]

    const datosGrafico = useMemo(
        () => (producto ? construirGrafico(producto, historialQuery.data ?? []) : []),
        [historialQuery.data, producto]
    )

    const totalUnidades = useMemo(
        () =>
            productosUnidad.reduce(
                (total, item) =>
                    total + item.semanas.reduce((suma, semana) => suma + semana.unidades, 0),
                0
            ),
        [productosUnidad]
    )

    const semanaPico = useMemo(() => {
        const acumulado = new Map<string, number>()
        productosUnidad.forEach((item) => {
            item.semanas.forEach((semana) => {
                acumulado.set(
                    semana.semana,
                    (acumulado.get(semana.semana) ?? 0) + semana.unidades
                )
            })
        })
        return [...acumulado.entries()].sort((a, b) => b[1] - a[1])[0] ?? null
    }, [productosUnidad])

    const hoyISO = getInicioSemanaISO()
    const marcadorHoy =
        datosGrafico.find((item) => item.semana === hoyISO)?.etiqueta ??
        datosGrafico.find((item) => item.real !== null)?.etiqueta

    const estadoProducto = producto ? getEstadoPrediccion(producto.wape) : null

    return (
        <Card className="overflow-hidden rounded-2xl border border-primary/30 border-t-4 border-t-primary bg-card shadow-md">
            <CardHeader className="space-y-4 p-4 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            aria-hidden="true"
                        >
                            <TrendingUp className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="text-xl">¿Cuánto voy a vender?</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Estimación para las próximas 4 semanas
                            </CardDescription>
                        </div>
                    </div>

                    {unidadesDisponibles.length > 1 && (
                        <select
                            value={unidadActiva ?? ""}
                            onChange={(event) => {
                                setUnidadSeleccionada(event.target.value as UnitType)
                                setProductoSeleccionado("")
                            }}
                            aria-label="Elegir unidad"
                            className="h-10 max-w-40 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {unidadesDisponibles.map((unidad) => (
                                <option key={unidad} value={unidad}>
                                    {getUnitSymbol(unidad)}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {!isLoading && !isError && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-primary/10 p-4 ring-1 ring-primary/20">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Venta estimada
                                </p>
                                <p className="mt-1 text-3xl font-semibold tabular-nums">
                                    {formatPiezas(totalUnidades)}{" "}
                                    <span className="text-base font-medium text-muted-foreground">
                                        {getUnitSymbol(unidadActiva)}
                                    </span>
                                </p>
                            </div>
                            <p className="max-w-64 text-xs text-muted-foreground">
                                Próximas 4 semanas · solo los productos analizados aquí
                            </p>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 pt-0">
                {isLoading || historialQuery.isLoading ? (
                    <div className="space-y-4" aria-busy="true">
                        <Skeleton className="h-72 rounded-xl" />
                        <Skeleton className="h-28 rounded-xl" />
                    </div>
                ) : isError || historialQuery.isError ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-background/70 px-4 py-10 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">No se pudo calcular el pronóstico</p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                void refetch()
                                void historialQuery.refetch()
                            }}
                        >
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Reintentar
                        </Button>
                    </div>
                ) : !producto ? (
                    <div className="flex items-center gap-4 rounded-xl border border-success/25 bg-success/5 p-4 text-success">
                        <PackageSearch className="size-6 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-base font-semibold">Sin datos para estimar</p>
                            <p className="text-xs text-muted-foreground">
                                Todavía no hay suficiente historial de ventas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {semanaPico && (
                            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                                <CalendarRange className="size-5 shrink-0 text-primary" aria-hidden="true" />
                                <p>
                                    La semana del {formatRangoSemanal(semanaPico[0])} puede ser la de mayor demanda.
                                </p>
                            </div>
                        )}

                        <section className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-base font-semibold">
                                        Ventas reales y estimadas
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Historial reciente y próximas semanas
                                    </p>
                                </div>

                                <select
                                    value={producto.productId}
                                    onChange={(event) => setProductoSeleccionado(event.target.value)}
                                    aria-label="Elegir producto"
                                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-64"
                                >
                                    {productosUnidad.map((item) => (
                                        <option key={item.productId} value={item.productId}>
                                            {item.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {datosGrafico.length === 0 ? (
                                <div className="rounded-xl bg-background/80 px-4 py-8 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
                                    No hay semanas para mostrar todavía.
                                </div>
                            ) : (
                                <div
                                    role="img"
                                    aria-label={`Ventas reales y estimadas de ${producto.nombre}`}
                                    tabIndex={0}
                                    className="h-80 w-full rounded-xl bg-background/80 px-2 pb-2 pt-4 shadow-sm ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={datosGrafico}
                                            margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                                        >
                                            <CartesianGrid
                                                vertical={false}
                                                stroke="var(--border)"
                                                strokeDasharray="3 6"
                                            />
                                            <XAxis
                                                dataKey="etiqueta"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                            />
                                            <YAxis
                                                width={44}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                                tickFormatter={(valor: number) => formatPiezas(valor)}
                                            />
                                            <Tooltip content={<GraficoTooltip />} />

                                            <defs>
                                                <linearGradient
                                                    id="areaRealPronostico"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="var(--primary)"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="var(--primary)"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="bandaPronostico"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="var(--warning)"
                                                        stopOpacity={0.22}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="var(--warning)"
                                                        stopOpacity={0.04}
                                                    />
                                                </linearGradient>
                                            </defs>

                                            <Area
                                                type="monotone"
                                                dataKey="real"
                                                stroke="none"
                                                fill="url(#areaRealPronostico)"
                                                connectNulls={false}
                                                isAnimationActive={false}
                                            />
                                            <Area
                                                type="linear"
                                                dataKey="banda"
                                                stroke="none"
                                                fill="url(#bandaPronostico)"
                                                connectNulls={false}
                                                isAnimationActive={false}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="real"
                                                name="Vendido"
                                                stroke="var(--primary)"
                                                strokeWidth={3}
                                                connectNulls={false}
                                                dot={{ r: 4, fill: "var(--primary)" }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Line
                                                type="linear"
                                                dataKey="pronostico"
                                                name="Estimado"
                                                stroke="var(--warning)"
                                                strokeWidth={3}
                                                strokeDasharray="7 6"
                                                connectNulls={false}
                                                dot={{ r: 4, fill: "var(--warning)" }}
                                                activeDot={{ r: 6 }}
                                            />

                                            {marcadorHoy && (
                                                <ReferenceLine
                                                    x={marcadorHoy}
                                                    stroke="var(--primary)"
                                                    strokeDasharray="4 4"
                                                    label={{
                                                        value: "Hoy",
                                                        position: "insideTopLeft",
                                                        fill: "var(--primary)",
                                                        fontSize: 12,
                                                    }}
                                                />
                                            )}
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>

                        {estadoProducto && (
                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
                                        title="Qué tanto se equivocó la predicción al compararla con ventas reales pasadas. Mientras más bajo, mejor."
                                        aria-label="Explicación del margen de error"
                                    >
                                        <Info className="size-4" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Margen de error de la predicción
                                        </p>
                                        <p className="text-xl font-semibold tabular-nums">
                                            {producto.wape === null
                                                ? "Sin medir"
                                                : `${Math.round(producto.wape * 100)}%`}
                                        </p>
                                    </div>
                                </div>

                                <Badge variant="outline" className={cn("text-xs", estadoProducto.className)}>
                                    {estadoProducto.etiqueta}
                                </Badge>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
