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
    formatInicioSemanaDDMM,
    formatPorcentaje,
    getPromedioSemanal,
    getSemanaPico,
    getSemanasCompletas,
    getVariacionSemanal,
} from "../utils"

interface DashboardSemanalChartProps {
    serie: SerieSemanal[]
}

const formatearSoles = (valor: number) =>
    `S/ ${new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(valor)}`

interface TooltipProps {
    active?: boolean
    label?: string
    payload?: { value?: number | string; payload?: { enCurso?: boolean; fechaInicio?: string } }[]
    promedio: number
}

function TooltipVentas({ active, label, payload, promedio }: TooltipProps) {
    if (!active || !payload?.length) return null

    const valor = Number(payload[0]?.value ?? 0)
    const enCurso = payload[0]?.payload?.enCurso === true
    const fechaInicio = payload[0]?.payload?.fechaInicio ?? label ?? "—"

    return (
        <div className="min-w-40 rounded-xl border bg-popover px-3 py-2 shadow-xl">
            <p className="text-xs font-medium text-muted-foreground">
                {enCurso ? `Semana en curso · ${fechaInicio}` : `Semana del ${fechaInicio}`}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(valor)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
                {enCurso
                    ? "Venta parcial, todavía no cerrada"
                    : valor >= promedio
                      ? "Por encima del promedio"
                      : "Por debajo del promedio"}
            </p>
        </div>
    )
}

export function DashboardSemanalChart({ serie }: DashboardSemanalChartProps) {
    const [activo, setActivo] = useState<number | null>(null)

    const completas = getSemanasCompletas(serie)
    const promedioSemanal = getPromedioSemanal(completas)
    const semanaPico = getSemanaPico(completas)
    const variacion = getVariacionSemanal(completas)
    const semanaReciente = completas.at(-1) ?? null
    const semanaAnterior = completas.at(-2) ?? null

    const etiquetasCompletas = new Set(completas.map((semana) => semana.etiqueta))
    const datos = serie.map((semana) => ({
        etiqueta: semana.etiqueta,
        fechaInicio: formatInicioSemanaDDMM(semana.desde),
        totalVentas: semana.totalVentas,
        enCurso: !etiquetasCompletas.has(semana.etiqueta),
    }))

    const indicePico = semanaPico
        ? datos.findIndex((d) => d.etiqueta === semanaPico.etiqueta)
        : -1
    const variacionPositiva = variacion !== null && variacion >= 0

    return (
        <Card className="flex h-full min-w-0 flex-col overflow-hidden border-primary/20 bg-primary/10 shadow-sm">
            <CardHeader className="shrink-0 space-y-1 p-4 pb-2">
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                        aria-hidden="true"
                    >
                        <BarChart3 className="size-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="text-xl">Evolución de ventas</CardTitle>
                        <CardDescription className="text-xs">
                            Últimas 8 semanas en soles
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0">
                {serie.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-background/70 px-4 py-10 text-center ring-1 ring-primary/10">
                        <BarChart3 className="size-7 text-primary" aria-hidden="true" />
                        <p className="text-sm font-medium">Sin ventas registradas</p>
                        <p className="text-xs text-muted-foreground">
                            Cuando haya ventas, verás aquí su evolución.
                        </p>
                    </div>
                ) : (
                    <>
                        <div
                            role="img"
                            aria-label="Gráfico de evolución semanal de ventas en soles"
                            tabIndex={0}
                            className="min-h-72 flex-1 rounded-xl bg-background/80 px-2 pb-2 pt-4 shadow-sm ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={datos}
                                    margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                                    barCategoryGap="18%"
                                    onMouseMove={(estado) => {
                                        const indice = Number(estado?.activeTooltipIndex)
                                        setActivo(Number.isNaN(indice) ? null : indice)
                                    }}
                                    onMouseLeave={() => setActivo(null)}
                                >
                                    <defs>
                                        <pattern
                                            id="semana-actual"
                                            width="8"
                                            height="8"
                                            patternUnits="userSpaceOnUse"
                                            patternTransform="rotate(35)"
                                        >
                                            <rect width="8" height="8" fill="var(--primary)" fillOpacity="0.28" />
                                            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--primary)" strokeWidth="3" strokeOpacity="0.55" />
                                        </pattern>
                                        <linearGradient
                                            id="barra-evolucion"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="var(--primary)"
                                                stopOpacity={1}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="var(--primary)"
                                                stopOpacity={0.45}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="barra-pico"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#F5B301"
                                                stopOpacity={1}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#D97706"
                                                stopOpacity={0.55}
                                            />
                                        </linearGradient>
                                    </defs>

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
                                        width={68}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatearSoles}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={false}
                                        content={<TooltipVentas promedio={promedioSemanal} />}
                                    />

                                    {promedioSemanal > 0 && (
                                        <ReferenceLine
                                            y={promedioSemanal}
                                            stroke="var(--primary)"
                                            strokeDasharray="6 6"
                                            strokeOpacity={0.55}
                                            label={{
                                                value: `Prom. ${formatearSoles(promedioSemanal)}`,
                                                position: "insideTopRight",
                                                fill: "var(--primary)",
                                                fontSize: 12,
                                                dy: -6,
                                            }}
                                        />
                                    )}

                                    <Bar
                                        dataKey="totalVentas"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={48}
                                        minPointSize={4}
                                    >
                                        {datos.map((dato, indice) => (
                                            <Cell
                                                key={`${dato.etiqueta}-${indice}`}
                                                fill={
                                                    dato.enCurso
                                                        ? "url(#semana-actual)"
                                                        : indice === indicePico
                                                          ? "url(#barra-pico)"
                                                          : "url(#barra-evolucion)"
                                                }
                                                fillOpacity={
                                                    activo === null || activo === indice ? 1 : 0.45
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <dl className="grid shrink-0 gap-4 sm:grid-cols-3">
                            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-background/80 p-4 ring-1 ring-foreground/10">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary" aria-hidden="true">
                                    <Wallet className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <dt className="truncate text-xs text-muted-foreground">Promedio semanal</dt>
                                    <dd className="truncate text-xl font-semibold tabular-nums">
                                        {formatCurrency(promedioSemanal)}
                                    </dd>
                                </div>
                            </div>

                            {semanaPico && (
                                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-background/80 p-4 ring-1 ring-foreground/10">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning" aria-hidden="true">
                                        <CalendarRange className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="truncate text-xs text-muted-foreground">
                                            Semana pico · {semanaPico.etiqueta}
                                        </dt>
                                        <dd className="truncate text-xl font-semibold tabular-nums">
                                            {formatCurrency(semanaPico.totalVentas)}
                                        </dd>
                                    </div>
                                </div>
                            )}

                            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-background/80 p-4 ring-1 ring-foreground/10">
                                <div
                                    className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
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
                                    <dt className="truncate text-xs text-muted-foreground">
                                        {semanaReciente && semanaAnterior
                                            ? `${semanaReciente.etiqueta} vs. ${semanaAnterior.etiqueta}`
                                            : "Última vs. anterior"}
                                    </dt>
                                    <dd
                                        className={cn(
                                            "text-xl font-semibold tabular-nums",
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
