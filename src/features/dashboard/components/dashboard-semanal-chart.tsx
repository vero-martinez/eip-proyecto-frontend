"use client"

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
import {
    BarChart3,
    CalendarRange,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react"

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
    getSemanasCompletas,
    getVariacionSemanal,
} from "../utils"

interface DashboardSemanalChartProps {
    serie: SerieSemanal[]
}

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

function ChartTooltip({
    active,
    label,
    payload,
    promedio,
}: ChartTooltipProps) {
    if (!active || !payload?.length) return null

    const valor = Number(payload[0].value)
    const sobrePromedio = valor >= promedio

    return (
        <div className="min-w-32 rounded-lg border bg-popover px-2.5 py-1.5 shadow-lg">
            <p className="text-[11px] font-medium text-muted-foreground">
                Semana {label}
            </p>

            <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {formatCurrency(valor)}
            </p>

            <p
                className={cn(
                    "mt-0.5 flex items-center gap-1 text-[10px] font-medium",
                    sobrePromedio
                        ? "text-success"
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

export function DashboardSemanalChart({
    serie,
}: DashboardSemanalChartProps) {
    const [activo, setActivo] = useState<number | null>(null)

    // La semana en curso se dibuja, pero no cuenta en las métricas.
    const completas = getSemanasCompletas(serie)
    const promedioSemanal = getPromedioSemanal(completas)
    const semanaPico = getSemanaPico(completas)
    const variacion = getVariacionSemanal(completas)

    const datos = serie.map((semana) => ({
        etiqueta: semana.etiqueta,
        totalVentas: semana.totalVentas,
    }))

    const indicePico = semanaPico
        ? datos.findIndex((d) => d.etiqueta === semanaPico.etiqueta)
        : -1

    const variacionPositiva = variacion !== null && variacion >= 0

    return (
        <Card className="flex h-full min-h-[520px] min-w-0 flex-col overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            <CardHeader className="flex shrink-0 flex-row items-center gap-2 space-y-0 p-3 pb-2">
                <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    aria-hidden="true"
                >
                    <BarChart3 className="size-4" />
                </div>

                <div className="min-w-0 space-y-0.5">
                    <CardTitle className="text-sm">
                        Evolución semanal
                    </CardTitle>

                    <CardDescription className="text-[11px]">
                        Histórico de ventas de las últimas semanas
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3 pt-0">
                {serie.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-background/70 px-3 py-8 text-center ring-1 ring-primary/10">
                        <BarChart3
                            className="size-7 text-primary"
                            aria-hidden="true"
                        />

                        <div className="space-y-1">
                            <p className="text-xs font-medium">
                                Sin ventas registradas
                            </p>

                            <p className="text-[11px] text-muted-foreground">
                                Cuando haya ventas, verás aquí su evolución.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            className="min-h-[300px] flex-1 rounded-lg bg-background/80 px-2 pb-2 pt-3 shadow-sm ring-1 ring-foreground/10"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={datos}
                                    margin={{
                                        top: 25,
                                        right: 12,
                                        left: 4,
                                        bottom: 5,
                                    }}
                                    barCategoryGap="18%"
                                    onMouseMove={(state) => {
                                        const i = Number(state?.activeTooltipIndex)
                                        setActivo(Number.isNaN(i) ? null : i)
                                    }}
                                    onMouseLeave={() => setActivo(null)}
                                >
                                    <defs>
                                        <linearGradient
                                            id="semanal-pico"
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
                                            id="semanal-normal"
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
                                            fontSize: 11,
                                        }}
                                    />

                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
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
                                            dy: -6,
                                        }}
                                    />

                                    <Bar
                                        dataKey="totalVentas"
                                        radius={[7, 7, 7, 7]}
                                        maxBarSize={45}
                                        minPointSize={4}
                                        background={{
                                            fill: "var(--muted)",
                                            fillOpacity: 0.55,
                                            radius: 7,
                                        }}
                                        label={({
                                            x,
                                            y,
                                            width,
                                            value,
                                            index,
                                        }) =>
                                            index === indicePico &&
                                            Number(value) > 0 ? (
                                                <text
                                                    x={Number(x) + Number(width) / 2}
                                                    y={Number(y) - 8}
                                                    textAnchor="middle"
                                                    fontSize={11}
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

                        <dl className="grid shrink-0 grid-cols-1 gap-1.5 sm:grid-cols-3">
                            <div className="flex min-w-0 items-center gap-2 rounded-lg bg-background/80 p-2.5 ring-1 ring-foreground/10">
                                <div
                                    className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"
                                    aria-hidden="true"
                                >
                                    <Wallet className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <dt className="truncate text-[10px] text-muted-foreground">
                                        Promedio semanal
                                    </dt>
                                    <dd className="truncate text-xs font-semibold tabular-nums">
                                        {formatCurrency(promedioSemanal)}
                                    </dd>
                                </div>
                            </div>

                            {semanaPico && (
                                <div className="flex min-w-0 items-center gap-2 rounded-lg bg-background/80 p-2.5 ring-1 ring-foreground/10">
                                    <div
                                        className="flex size-8 shrink-0 items-center justify-center rounded-md bg-warning/15 text-warning"
                                        aria-hidden="true"
                                    >
                                        <CalendarRange className="size-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <dt className="truncate text-[10px] text-muted-foreground">
                                            Semana pico · {semanaPico.etiqueta}
                                        </dt>
                                        <dd className="truncate text-xs font-semibold tabular-nums">
                                            {formatCurrency(semanaPico.totalVentas)}
                                        </dd>
                                    </div>
                                </div>
                            )}

                            <div className="flex min-w-0 items-center gap-2 rounded-lg bg-background/80 p-2.5 ring-1 ring-foreground/10">
                                <div
                                    className={cn(
                                        "flex size-8 shrink-0 items-center justify-center rounded-md",
                                        variacion === null
                                            ? "bg-muted text-muted-foreground"
                                            : variacionPositiva
                                                ? "bg-success/15 text-success"
                                                : "bg-destructive/15 text-destructive"
                                    )}
                                    aria-hidden="true"
                                >
                                    {variacion !== null && variacion < 0 ? (
                                        <TrendingDown className="size-4" />
                                    ) : (
                                        <TrendingUp className="size-4" />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <dt className="truncate text-[10px] text-muted-foreground">
                                        Última vs. anterior
                                    </dt>

                                    <dd
                                        className={cn(
                                            "text-xs font-semibold tabular-nums",
                                            variacion === null
                                                ? "text-muted-foreground"
                                                : variacionPositiva
                                                    ? "text-success"
                                                    : "text-destructive"
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