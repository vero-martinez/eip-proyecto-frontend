"use client"

/**
 * Evolución semanal de ventas del Dashboard.
 *
 * La serie (8 semanas) y el pie —promedio, semana pico y variación— salen del
 * endpoint. No hay proyección: solo semanas que ocurrieron.
 */

import { useState } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { BarChart3, CalendarRange, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"

import type { SerieSemanal } from "../types"
import {
    formatPorcentaje,
    getPromedioSemanal,
    getSemanaPico,
    getVariacionSemanal,
} from "../utils"

interface DashboardSemanalChartProps {
    serie: SerieSemanal[]
}

/** Eje Y en moneda compacta para que no se corte el ancho. */
const formatEje = (valor: number) =>
    new Intl.NumberFormat("es-PE", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(valor)

interface ChartTooltipProps {
    active?: boolean
    label?: string
    payload?: { value?: number | string }[]
    promedio: number
}

/** Tooltip propio: indica además si la semana está sobre o bajo el promedio. */
function ChartTooltip({ active, label, payload, promedio }: ChartTooltipProps) {
    if (!active || !payload?.length) return null

    const valor = Number(payload[0].value)
    const sobrePromedio = valor >= promedio

    return (
        <div className="min-w-36 rounded-xl border bg-popover px-4 py-3 shadow-xl">
            <p className="text-xs font-medium text-muted-foreground">Semana {label}</p>
            <p className="mt-1 text-base font-semibold tabular-nums">{formatCurrency(valor)}</p>
            <p
                className={cn(
                    "mt-1.5 flex items-center gap-1 text-xs font-medium",
                    sobrePromedio
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                )}
            >
                {sobrePromedio ? (
                    <TrendingUp className="size-3" aria-hidden="true" />
                ) : (
                    <TrendingDown className="size-3" aria-hidden="true" />
                )}
                {sobrePromedio ? "Sobre el promedio" : "Bajo el promedio"}
            </p>
        </div>
    )
}

export function DashboardSemanalChart({ serie }: DashboardSemanalChartProps) {
    const [activo, setActivo] = useState<number | null>(null)

    const promedioSemanal = getPromedioSemanal(serie)
    const semanaPico = getSemanaPico(serie)
    const variacion = getVariacionSemanal(serie)
    const datos = serie.map((semana) => ({
        etiqueta: semana.etiqueta,
        totalVentas: semana.totalVentas,
    }))
    const indicePico = semanaPico
        ? datos.findIndex((d) => d.etiqueta === semanaPico.etiqueta)
        : -1

    const variacionPositiva = variacion !== null && variacion >= 0

    return (
        <Card className="h-full overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6 pb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        aria-hidden="true"
                    >
                        <BarChart3 className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Evolución semanal</CardTitle>
                        <CardDescription className="text-foreground/60">
                            Ventas por semana de las últimas {serie.length} semanas
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 px-4 pb-5 pt-0 sm:px-6">
                {serie.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-background/70 px-6 py-16 text-center ring-1 ring-primary/10">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <BarChart3 className="size-7 text-primary" aria-hidden="true" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Sin ventas registradas</p>
                            <p className="text-sm text-muted-foreground">
                                Cuando haya ventas en el periodo, verás aquí su evolución.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Gráfico */}
                        <div
                            className="h-72 w-full rounded-2xl bg-background/80 px-3 pb-3 pt-2 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                            aria-hidden="true"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={datos}
                                    margin={{ top: 28, right: 8, left: 0, bottom: 0 }}
                                    barCategoryGap="18%"
                                    onMouseMove={(state) => {
                                        const i = Number(state?.activeTooltipIndex)
                                        setActivo(Number.isNaN(i) ? null : i)
                                    }}
                                    onMouseLeave={() => setActivo(null)}
                                >
                                    <defs>
                                        <linearGradient id="semanal-pico" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="0%"
                                                style={{ stopColor: "var(--primary)", stopOpacity: 1 }}
                                            />
                                            <stop
                                                offset="100%"
                                                style={{ stopColor: "var(--primary)", stopOpacity: 0.7 }}
                                            />
                                        </linearGradient>
                                        <linearGradient id="semanal-normal" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="0%"
                                                style={{ stopColor: "var(--primary)", stopOpacity: 0.6 }}
                                            />
                                            <stop
                                                offset="100%"
                                                style={{ stopColor: "var(--primary)", stopOpacity: 0.3 }}
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
                                        tickMargin={12}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={44}
                                        allowDecimals={false}
                                        tickFormatter={formatEje}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={false}
                                        content={<ChartTooltip promedio={promedioSemanal} />}
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
                                            fontSize: 11,
                                            fontWeight: 600,
                                            dy: -6,
                                        }}
                                    />

                                    <Bar
                                        dataKey="totalVentas"
                                        radius={[10, 10, 10, 10]}
                                        maxBarSize={44}
                                        minPointSize={4}
                                        background={{ fill: "var(--muted)", fillOpacity: 0.55, radius: 10 }}
                                        label={({ x, y, width, value, index }) =>
                                            index === indicePico && Number(value) > 0 ? (
                                                <text
                                                    x={Number(x) + Number(width) / 2}
                                                    y={Number(y) - 10}
                                                    textAnchor="middle"
                                                    fontSize={12}
                                                    fontWeight={700}
                                                    fill="var(--primary)"
                                                >
                                                    {formatEje(Number(value))}
                                                </text>
                                            ) : (
                                                <g />
                                            )
                                        }
                                        animationDuration={700}
                                    >
                                        {datos.map((d, i) => (
                                            <Cell
                                                key={d.etiqueta}
                                                fill={
                                                    i === indicePico
                                                        ? "url(#semanal-pico)"
                                                        : "url(#semanal-normal)"
                                                }
                                                fillOpacity={activo === null || activo === i ? 1 : 0.45}
                                                style={{ transition: "fill-opacity 150ms" }}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Métricas */}
                        <dl className="grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                <div
                                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"
                                    aria-hidden="true"
                                >
                                    <Wallet className="size-5" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Promedio semanal
                                    </dt>
                                    <dd className="truncate text-lg font-semibold tabular-nums">
                                        {formatCurrency(promedioSemanal)}
                                    </dd>
                                </div>
                            </div>

                            {semanaPico && (
                                <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                    <div
                                        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                        aria-hidden="true"
                                    >
                                        <CalendarRange className="size-5" />
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                        <dt className="text-xs font-medium text-muted-foreground">
                                            Semana pico · {semanaPico.etiqueta}
                                        </dt>
                                        <dd className="truncate text-lg font-semibold tabular-nums">
                                            {formatCurrency(semanaPico.totalVentas)}
                                        </dd>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                <div
                                    className={cn(
                                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                        variacion === null
                                            ? "bg-muted text-muted-foreground"
                                            : variacionPositiva
                                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                    )}
                                    aria-hidden="true"
                                >
                                    {variacion !== null && variacion < 0 ? (
                                        <TrendingDown className="size-5" />
                                    ) : (
                                        <TrendingUp className="size-5" />
                                    )}
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Última vs. anterior
                                    </dt>
                                    <dd
                                        className={cn(
                                            "text-lg font-semibold tabular-nums",
                                            variacion === null
                                                ? "text-muted-foreground"
                                                : variacionPositiva
                                                  ? "text-emerald-600 dark:text-emerald-400"
                                                  : "text-rose-600 dark:text-rose-400"
                                        )}
                                    >
                                        {variacion === null
                                            ? "—"
                                            : `${variacionPositiva ? "+" : "−"}${formatPorcentaje(Math.abs(variacion))}`}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </>
                )}
            </CardContent>
        </Card>
    )
}