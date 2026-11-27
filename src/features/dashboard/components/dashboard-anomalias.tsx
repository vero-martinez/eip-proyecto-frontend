"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import {
    AlertTriangle,
    CalendarRange,
    RefreshCw,
    ScanSearch,
    ShieldAlert,
    ShieldCheck,
    Shield,
} from "lucide-react"
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceDot,
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
import { cn, formatCurrency } from "@/lib/utils"

import { useAnomalias } from "../hooks/use-anomalias"
import type { Anomalia, SerieSemanal } from "../types"
import {
    formatFechaLarga,
    formatInicioSemanaDDMM,
    formatPiezas,
    getAnomaliasUnicas,
    getClaveAnomalia,
    getSeveridadVisible,
    inicioSemanaAnomalia,
    type SeveridadVisible,
} from "../utils"

interface DashboardAnomaliasProps {
    serie: SerieSemanal[]
    resaltado?: { clave: string; nonce: number } | null
}

const MAX_VISIBLES = 6

const SEVERIDADES: Record<
    SeveridadVisible,
    { etiqueta: string; clase: string; borde: string; color: string }
> = {
    alta: {
        etiqueta: "Alta",
        clase: "border-destructive/40 bg-destructive/10 text-destructive",
        borde: "border-l-destructive",
        color: "var(--destructive)",
    },
    media: {
        etiqueta: "Media",
        clase: "border-warning/40 bg-warning/10 text-warning",
        borde: "border-l-warning",
        color: "var(--warning)",
    },
    informativa: {
        etiqueta: "Informativa",
        clase: "border-info/40 bg-info/10 text-info",
        borde: "border-l-info",
        color: "var(--info)",
    },
}

function mensajeNatural(item: Anomalia): string {
    const valor = item.valor === null ? "—" : formatPiezas(item.valor)
    const habitual = item.esperado === null ? null : formatPiezas(item.esperado)

    if (item.tipo === "stock_negativo") {
        return `El stock de ${item.nombre} es negativo (${valor} unidades). Revisa los movimientos.`
    }

    if (item.tipo === "semana_atipica" && item.valor === 0) {
        return habitual
            ? `${item.nombre} no tuvo ventas esta semana (lo habitual: ~${habitual}).`
            : `${item.nombre} no tuvo ventas esta semana.`
    }

    if (item.tipo === "semana_atipica" && habitual) {
        const veces = item.esperado && item.valor ? item.valor / item.esperado : 0
        const describe = veces >= 1.5
            ? veces >= 2.5
                ? "el triple de lo habitual"
                : "más de lo habitual"
            : "menos de lo habitual"
        return `Vendiste ${valor} unidades esta semana, ${describe} (~${habitual}).`
    }

    if (habitual) {
        return `Se registró un movimiento de ${valor} unidades, fuera de lo habitual (~${habitual}).`
    }

    return `Se registró un movimiento de ${valor} unidades fuera de lo normal.`
}

function accion(item: Anomalia): { texto: string; href: string } {
    if (item.tipo === "stock_negativo") {
        return { texto: "Verificar stock", href: `/productos?producto=${item.productId}` }
    }
    if (item.tipo === "semana_atipica" && item.valor === 0) {
        return {
            texto: "Verificar si hay stock disponible",
            href: `/productos?producto=${item.productId}`,
        }
    }
    return { texto: "Revisar la venta", href: `/ventas?producto=${item.productId}` }
}

interface TooltipGraficoProps {
    active?: boolean
    label?: string
    payload?: { payload?: { totalVentas?: number; mensajes?: string[]; fechaInicio?: string } }[]
}

function TooltipGrafico({ active, label, payload }: TooltipGraficoProps) {
    const fila = payload?.[0]?.payload
    if (!active || !fila) return null

    const fechaInicio = fila.fechaInicio ?? label ?? "—"

    return (
        <div className="min-w-56 rounded-xl border bg-popover px-4 py-3 shadow-xl">
            <p className="text-xs font-medium text-muted-foreground">Semana del {fechaInicio}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">
                {formatCurrency(Number(fila.totalVentas ?? 0))}
            </p>
            {fila.mensajes?.map((mensaje, index) => (
                <p key={`${mensaje}-${index}`} className="mt-1 text-xs text-muted-foreground">
                    {mensaje}
                </p>
            ))}
        </div>
    )
}

function PuntoAnomalia({
    cx = 0,
    cy = 0,
    r = 7,
    fill = "var(--destructive)",
}: {
    cx?: number
    cy?: number
    r?: number
    fill?: string
}) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={r * 1.7} fill={fill} fillOpacity={0.2} />
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke="var(--background)"
                strokeWidth={2}
            />
        </g>
    )
}

export function DashboardAnomalias({
    serie,
    resaltado,
}: DashboardAnomaliasProps) {
    const { data, isLoading, isError, refetch } = useAnomalias()
    const [nonceExpirado, setNonceExpirado] = useState<number | null>(null)

    useEffect(() => {
        if (!resaltado) return
        const temporizador = window.setTimeout(
            () => setNonceExpirado(resaltado.nonce),
            2000
        )
        return () => window.clearTimeout(temporizador)
    }, [resaltado])

    const claveResaltada =
        resaltado && nonceExpirado !== resaltado.nonce ? resaltado.clave : null

    const anomalias = useMemo(
        () => getAnomaliasUnicas(data?.anomalias ?? []),
        [data?.anomalias]
    )

    const datosGrafico = useMemo(() => {
        const porSemana = new Map<string, Anomalia[]>()
        anomalias.forEach((item) => {
            if (!item.fecha) return
            const clave = inicioSemanaAnomalia(item.fecha)
            const lista = porSemana.get(clave) ?? []
            lista.push(item)
            porSemana.set(clave, lista)
        })

        return serie.map((semana) => {
            const clave = inicioSemanaAnomalia(semana.desde)
            const casos = porSemana.get(clave) ?? []
            const severidades = new Set(casos.map((item) => getSeveridadVisible(item)))
            const severidad: SeveridadVisible | null = severidades.has("alta")
                ? "alta"
                : severidades.has("media")
                  ? "media"
                  : severidades.has("informativa")
                    ? "informativa"
                    : null

            return {
                etiqueta: semana.etiqueta,
                fechaInicio: formatInicioSemanaDDMM(semana.desde),
                totalVentas: semana.totalVentas,
                severidad,
                mensajes: casos.map((item) => mensajeNatural(item)),
            }
        })
    }, [anomalias, serie])

    const puntosAnomalia = useMemo(
        () =>
            datosGrafico.flatMap((fila) =>
                fila.severidad
                    ? [
                          {
                              etiqueta: fila.etiqueta,
                              valor: fila.totalVentas,
                              severidad: fila.severidad,
                          },
                      ]
                    : []
            ),
        [datosGrafico]
    )

    const total = anomalias.length
    const altas = anomalias.filter((item) => getSeveridadVisible(item) === "alta").length
    const medias = anomalias.filter((item) => getSeveridadVisible(item) === "media").length
    const informativas = anomalias.filter(
        (item) => getSeveridadVisible(item) === "informativa"
    ).length
    const semanas = data?.semanasRevisadas ?? 8
    const visibles = anomalias.slice(0, MAX_VISIBLES)

    return (
        <Card
            id="anomalias"
            className="h-full scroll-mt-6 overflow-hidden rounded-2xl border border-destructive/30 border-t-4 border-t-destructive bg-gradient-to-br from-destructive/[0.07] via-background to-background shadow-md dark:from-destructive/10"
        >
            <CardHeader className="space-y-4 p-4 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-1 ring-destructive/30"
                            aria-hidden="true"
                        >
                            <ScanSearch className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="text-xl">¿Pasó algo raro?</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Ventas o movimientos fuera de lo normal en las últimas {semanas} semanas
                            </CardDescription>
                        </div>
                    </div>

                    {total > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {total} {total === 1 ? "caso" : "casos"}
                        </Badge>
                    )}
                </div>

                {!isLoading && !isError && total > 0 && (
                    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            { titulo: "Casos revisados", valor: total, Icono: ScanSearch, color: "text-primary" },
                            { titulo: "Alta", valor: altas, Icono: ShieldAlert, color: "text-destructive" },
                            { titulo: "Media", valor: medias, Icono: Shield, color: "text-warning" },
                            { titulo: "Informativa", valor: informativas, Icono: CalendarRange, color: "text-info" },
                        ].map(({ titulo, valor, Icono, color }) => (
                            <div key={titulo} className="rounded-xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex items-start justify-between gap-2">
                                    <dt className="text-xs text-muted-foreground">{titulo}</dt>
                                    <Icono className={cn("size-4", color)} aria-hidden="true" />
                                </div>
                                <dd className="mt-2 text-3xl font-semibold tabular-nums">{valor}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 pt-0">
                {isLoading ? (
                    <div className="space-y-4" aria-busy="true">
                        <Skeleton className="h-72 rounded-xl" />
                        <Skeleton className="h-40 rounded-xl" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-background/70 px-4 py-10 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">No se pudieron revisar las anomalías</p>
                        <Button variant="outline" onClick={() => void refetch()}>
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Reintentar
                        </Button>
                    </div>
                ) : total === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-success/25 bg-success/5 px-4 py-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-success/15">
                            <ShieldCheck className="size-7 text-success" aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-success">
                                No se detectó nada raro en las últimas {semanas} semanas
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Las ventas y el stock se mantuvieron dentro de lo esperado.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <section className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold">Ventas por semana</h3>
                                <p className="text-xs text-muted-foreground">
                                    Los puntos señalan semanas con algo inusual
                                </p>
                            </div>

                            <div
                                role="img"
                                aria-label={`Ventas semanales con ${total} episodios señalados`}
                                tabIndex={0}
                                className="h-80 w-full rounded-xl bg-background/80 px-2 pb-2 pt-4 shadow-sm ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={datosGrafico}
                                        margin={{ top: 28, right: 12, left: 0, bottom: 4 }}
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
                                            width={68}
                                            domain={[
                                                0,
                                                (maximo: number) => Math.ceil(maximo * 1.15),
                                            ]}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                            tickFormatter={(valor: number) => `S/ ${formatPiezas(valor)}`}
                                        />
                                        <Tooltip content={<TooltipGrafico />} />

                                        <defs>
                                            <linearGradient
                                                id="areaAnomalias"
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
                                        </defs>

                                        <Area
                                            type="monotone"
                                            dataKey="totalVentas"
                                            stroke="none"
                                            fill="url(#areaAnomalias)"
                                            dot={false}
                                            activeDot={false}
                                            isAnimationActive={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="totalVentas"
                                            name="Ventas"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{
                                                r: 4,
                                                fill: "var(--primary)",
                                                stroke: "var(--background)",
                                                strokeWidth: 2,
                                            }}
                                        />
                                        {puntosAnomalia.map((punto) => (
                                            <ReferenceDot
                                                key={`${punto.etiqueta}-${punto.severidad}`}
                                                x={punto.etiqueta}
                                                y={punto.valor}
                                                r={7}
                                                fill={SEVERIDADES[punto.severidad].color}
                                                shape={<PuntoAnomalia />}
                                            />
                                        ))}
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {(Object.keys(SEVERIDADES) as SeveridadVisible[]).map((clave) => (
                                    <span key={clave} className="flex items-center gap-2">
                                        <span
                                            className="size-2.5 rounded-full"
                                            style={{ backgroundColor: SEVERIDADES[clave].color }}
                                        />
                                        {SEVERIDADES[clave].etiqueta}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold">Detalle de casos</h3>
                                <p className="text-xs text-muted-foreground">
                                    Explicación y siguiente paso sugerido
                                </p>
                            </div>

                            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {visibles.map((item) => {
                                    const severidad = SEVERIDADES[getSeveridadVisible(item)]
                                    const paso = accion(item)

                                    return (
                                        <li
                                            key={getClaveAnomalia(item)}
                                            className={cn(
                                                "flex min-w-0 flex-col gap-3 rounded-xl border-l-4 bg-background/80 p-4 shadow-sm ring-1 transition-shadow hover:shadow-md",
                                                severidad.borde,
                                                claveResaltada === getClaveAnomalia(item) &&
                                                    "animate-pulse ring-2 ring-warning ring-offset-2 ring-offset-background"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="min-w-0 truncate text-sm font-semibold">
                                                    {item.nombre}
                                                </p>
                                                <Badge variant="outline" className={cn("shrink-0 text-xs", severidad.clase)}>
                                                    {severidad.etiqueta}
                                                </Badge>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {item.fecha
                                                    ? formatFechaLarga(item.fecha)
                                                    : "Stock actual"}
                                            </p>

                                            <p className="border-t border-border/60 pt-3 text-sm leading-relaxed text-foreground/80">
                                                {mensajeNatural(item)}
                                            </p>

                                            <Link
                                                href={paso.href}
                                                className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                            >
                                                {paso.texto}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
