"use client"

import { useMemo } from "react"
import {
    AlertTriangle,
    CalendarRange,
    ScanSearch,
    ShieldCheck,
    ShieldAlert,
    Shield,
} from "lucide-react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
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

import { useAnomalias } from "../hooks/use-anomalias"
import type { SeveridadAnomalia, TipoAnomalia } from "../types"
import { formatSemanaCorta } from "../utils"

const MAX_VISIBLES = 6

const TIPOS: Record<TipoAnomalia, string> = {
    semana_atipica: "Ventas de la semana",
    movimiento_atipico: "Movimiento inusual",
    stock_negativo: "Stock negativo",
}

const TIPOS_ORDEN: TipoAnomalia[] = [
    "semana_atipica",
    "movimiento_atipico",
    "stock_negativo",
]

const SEVERIDADES: Record<
    SeveridadAnomalia,
    { label: string; className: string }
> = {
    alta: {
        label: "Alta",
        className: "border-destructive/40 text-destructive",
    },
    media: {
        label: "Media",
        className: "border-warning/40 text-warning",
    },
}

const formatEje = (valor: number) =>
    new Intl.NumberFormat("es-PE", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(valor)

function getCuando(tipo: TipoAnomalia, fecha: string | null): string | null {
    if (!fecha) return null

    return tipo === "semana_atipica"
        ? `Semana del ${formatSemanaCorta(fecha)}`
        : formatSemanaCorta(fecha)
}

interface ChartTooltipProps {
    active?: boolean
    label?: string
    payload?: {
        name?: string
        value?: number | string
        color?: string
        payload?: { nombre?: string }
    }[]
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
    if (!active || !payload?.length) return null

    return (
        <div className="min-w-36 rounded-xl border bg-popover px-4 py-3 shadow-xl">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
                {label ?? "Gravedad"}
            </p>

            <div className="space-y-1.5">
                {payload.map((item, index) => (
                    <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between gap-4 text-xs"
                    >
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name ?? "Casos"}
                        </span>

                        <span className="font-semibold tabular-nums">
                            {formatEje(Number(item.value ?? 0))}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function DashboardAnomalias() {
    const { data, isLoading, isError } = useAnomalias()

    const anomalias = useMemo(
        () => data?.anomalias ?? [],
        [data?.anomalias]
    )

    const visibles = anomalias.slice(0, MAX_VISIBLES)
    const restantes = anomalias.length - visibles.length
    const semanas = data?.semanasRevisadas ?? 8

    // Distribución de anomalías por gravedad.
    const distribucion = useMemo(
        () => [
            {
                nombre: "Gravedad alta",
                valor: anomalias.filter((item) => item.severidad === "alta").length,
            },
            {
                nombre: "Gravedad media",
                valor: anomalias.filter((item) => item.severidad === "media").length,
            },
        ],
        [anomalias]
    )

    // Cantidad de anomalías por tipo y gravedad.
    const porTipo = useMemo(
        () =>
            TIPOS_ORDEN.map((tipo) => ({
                tipo: TIPOS[tipo],
                alta: anomalias.filter(
                    (item) => item.tipo === tipo && item.severidad === "alta"
                ).length,
                media: anomalias.filter(
                    (item) => item.tipo === tipo && item.severidad === "media"
                ).length,
            })),
        [anomalias]
    )

    const totalAltas = data?.altas ?? 0
    const totalMedias = data?.medias ?? 0
    const total = data?.total ?? 0

    return (
        <Card className="h-full overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6 pb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        aria-hidden="true"
                    >
                        <ScanSearch className="size-6" />
                    </div>

                    <div className="space-y-1">
                        <CardTitle className="text-lg">Análisis de anomalías</CardTitle>
                        <CardDescription className="text-foreground/60">
                            {data && total > 0
                                ? `${total} ${total === 1 ? "caso detectado" : "casos detectados"} en ${semanas} semanas`
                                : `Ventas, movimientos y stock de las últimas ${semanas} semanas`}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 px-4 pb-5 pt-0 sm:px-6">
                {isLoading ? (
                    <div className="space-y-4" aria-busy="true">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-20 rounded-2xl" />
                            ))}
                        </div>
                        <Skeleton className="h-72 w-full rounded-2xl" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 px-6 py-12 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">
                            No se pudieron revisar las anomalías
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Intenta de nuevo en unos minutos.
                        </p>
                    </div>
                ) : anomalias.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-background/70 px-6 py-14 text-center ring-1 ring-primary/10">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">
                                Sin anomalías detectadas
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Nada fuera de lo habitual en las últimas {semanas} semanas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Indicadores principales */}
                        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                    <ScanSearch className="size-5" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Total de casos
                                    </dt>
                                    <dd className="text-lg font-semibold tabular-nums">
                                        {total}
                                    </dd>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                                    <ShieldAlert className="size-5" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Gravedad alta
                                    </dt>
                                    <dd className="text-lg font-semibold tabular-nums text-destructive">
                                        {totalAltas}
                                    </dd>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                                    <Shield className="size-5" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Gravedad media
                                    </dt>
                                    <dd className="text-lg font-semibold tabular-nums text-warning">
                                        {totalMedias}
                                    </dd>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                    <CalendarRange className="size-5" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <dt className="text-xs font-medium text-muted-foreground">
                                        Semanas revisadas
                                    </dt>
                                    <dd className="text-lg font-semibold tabular-nums">
                                        {semanas}
                                    </dd>
                                </div>
                            </div>
                        </dl>

                        {/* Gráficos */}
                        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                            {/* Distribución por gravedad */}
                            <section className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="mb-2 space-y-1">
                                    <h3 className="text-sm font-semibold">
                                        Distribución por gravedad
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Proporción de casos detectados
                                    </p>
                                </div>

                                <div className="relative h-52 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip
                                                content={<ChartTooltip />}
                                            />
                                            <Pie
                                                data={distribucion}
                                                dataKey="valor"
                                                nameKey="nombre"
                                                innerRadius={57}
                                                outerRadius={82}
                                                paddingAngle={4}
                                                stroke="none"
                                                animationDuration={700}
                                            >
                                                <Cell fill="var(--destructive)" />
                                                <Cell fill="var(--warning)" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold tabular-nums">
                                            {total}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            anomalías
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="size-2.5 rounded-full bg-destructive" />
                                        Alta
                                        <span className="font-semibold text-foreground">
                                            {totalAltas}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="size-2.5 rounded-full bg-warning" />
                                        Media
                                        <span className="font-semibold text-foreground">
                                            {totalMedias}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Anomalías por tipo */}
                            <section className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-foreground/10">
                                <div className="mb-2 space-y-1">
                                    <h3 className="text-sm font-semibold">
                                        Anomalías por categoría
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Casos agrupados según el tipo de anomalía
                                    </p>
                                </div>

                                <div className="h-56 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={porTipo}
                                            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                                            barCategoryGap="25%"
                                        >
                                            <CartesianGrid
                                                vertical={false}
                                                stroke="var(--border)"
                                                strokeDasharray="3 6"
                                                strokeOpacity={0.8}
                                            />

                                            <XAxis
                                                dataKey="tipo"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={10}
                                                interval={0}
                                                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                                            />

                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                width={35}
                                                allowDecimals={false}
                                                tickFormatter={formatEje}
                                                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                                            />

                                            <Tooltip
                                                cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
                                                content={<ChartTooltip />}
                                            />

                                            <Bar
                                                dataKey="alta"
                                                name="Gravedad alta"
                                                stackId="gravedad"
                                                fill="var(--destructive)"
                                                radius={[0, 0, 0, 0]}
                                                maxBarSize={46}
                                                animationDuration={700}
                                            />

                                            <Bar
                                                dataKey="media"
                                                name="Gravedad media"
                                                stackId="gravedad"
                                                fill="var(--warning)"
                                                radius={[7, 7, 0, 0]}
                                                maxBarSize={46}
                                                animationDuration={700}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-1 flex justify-center gap-5">
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="size-2.5 rounded-full bg-destructive" />
                                        Alta
                                    </span>
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="size-2.5 rounded-full bg-warning" />
                                        Media
                                    </span>
                                </div>
                            </section>
                        </div>

                       
{/* Detalle de anomalías */}
<section className="space-y-2.5">
    <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
            <h3 className="text-xs font-semibold">
                Detalle de anomalías
            </h3>
            <p className="text-[11px] text-muted-foreground">
                Casos ordenados por gravedad
            </p>
        </div>

        <Badge variant="outline" className="shrink-0 text-[10px]">
            {total} {total === 1 ? "caso" : "casos"}
        </Badge>
    </div>

    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {visibles.map((item, index) => {
            const severidad = SEVERIDADES[item.severidad]
            const cuando = getCuando(item.tipo, item.fecha)

            return (
                <li
                    key={`${item.tipo}-${item.productId}-${item.fecha ?? "sin-fecha"}-${index}`}
                    className={cn(
                        "flex min-w-0 flex-col gap-2 rounded-xl bg-background/80 p-3 shadow-sm ring-1 transition-shadow hover:shadow-md",
                        item.severidad === "alta"
                            ? "ring-destructive/20"
                            : "ring-warning/20"
                    )}
                >
                    {/* Producto y severidad */}
                    <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-xs font-semibold">
                            {item.nombre}
                        </p>

                        <Badge
                            variant="outline"
                            className={cn(
                                "shrink-0 px-1.5 py-0 text-[10px]",
                                severidad.className
                            )}
                        >
                            {severidad.label}
                        </Badge>
                    </div>

                    {/* Información secundaria */}
                    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-muted-foreground">
                        <span className="truncate font-mono">
                            {item.sku}
                        </span>

                        <span aria-hidden="true">·</span>

                        <span>{TIPOS[item.tipo]}</span>

                        {cuando && (
                            <>
                                <span aria-hidden="true">·</span>
                                <span>{cuando}</span>
                            </>
                        )}
                    </div>

                    {/* Mensaje */}
                    <p className="border-t border-border/60 pt-2 text-xs leading-relaxed text-foreground/80">
                        {item.mensaje}
                    </p>
                </li>
            )
        })}
    </ul>

    {restantes > 0 && (
        <p className="text-center text-[11px] text-muted-foreground">
            y {restantes} {restantes === 1 ? "caso más" : "casos más"}
        </p>
    )}
</section>

                    </>
                )}
            </CardContent>
        </Card>
    )
}