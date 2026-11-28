"use client"

import { useMemo, useState } from "react"

import {
    AlertTriangle,
    CalendarRange,
    Info,
    RefreshCw,
    Sparkles,
} from "lucide-react"

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
import { getUnitSymbol } from "@/lib/units"
import { cn } from "@/lib/utils"

import { usePrediccionML, type OrigenHistorialML } from "../hooks/use-ml"
import { usePronostico } from "../hooks/use-pronostico"
import { formatFechaHora, formatPiezas, formatSemanaCorta } from "../utils"

function formatearProbabilidad(valor: number | null): string {
    if (valor === null || !Number.isFinite(valor)) return "—"
    const porcentaje = valor <= 1 ? valor * 100 : valor
    return `${Math.round(porcentaje)}%`
}

function etiquetaOrigenHistorial(origen: OrigenHistorialML): string {
    if (origen === "real") return "Historial real"
    if (origen === "mixto") return "Historial mixto"
    return "Historial simulado"
}

export function DashboardML() {
    const { data, isLoading, isError, refetch } = usePronostico()
    const productos = useMemo(() => data?.productos ?? [], [data?.productos])
    const [productoId, setProductoId] = useState<number | null>(null)
    const { estado, recomendacion, mensajeError, consultar, reiniciar } = usePrediccionML()

    const producto =
        productos.find((item) => item.productId === productoId) ?? productos[0]
    const simbolo = producto ? getUnitSymbol(producto.unitType) : ""

    return (
        <Card className="overflow-hidden rounded-2xl border border-primary/30 border-t-4 border-t-primary bg-gradient-to-br from-primary/10 via-background to-background shadow-md">
            <CardHeader className="space-y-4 p-4 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            aria-hidden="true"
                        >
                            <Sparkles className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="text-xl">
                                Recomendación para la próxima semana
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Demanda estimada para ayudarte a decidir tu pedido
                            </CardDescription>
                        </div>
                    </div>

                    <span
                        className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
                        title={`Generado con ${recomendacion?.version ?? "el modelo disponible en el servidor"}`}
                        aria-label="Detalles de la recomendación"
                    >
                        <Info className="size-4" aria-hidden="true" />
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 pt-0">
                {isLoading ? (
                    <div className="space-y-4" aria-busy="true">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-background/70 px-4 py-10 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">No se pudo cargar la recomendación</p>
                        <Button variant="outline" onClick={() => void refetch()}>
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Reintentar
                        </Button>
                    </div>
                ) : !producto ? (
                    <div className="flex items-center gap-4 rounded-xl border border-success/25 bg-success/5 p-4 text-success">
                        <CalendarRange className="size-6 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-base font-semibold">Sin recomendación por ahora</p>
                            <p className="text-xs text-muted-foreground">
                                Hacen falta ventas anteriores para calcularla.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <select
                                value={producto.productId}
                                onChange={(event) => {
                                    setProductoId(Number(event.target.value))
                                    reiniciar()
                                }}
                                aria-label="Elegir producto"
                                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-72"
                            >
                                {productos.map((item) => (
                                    <option key={item.productId} value={item.productId}>
                                        {item.nombre}
                                    </option>
                                ))}
                            </select>

                            <Button
                                disabled={estado === "cargando"}
                                onClick={() => void consultar(producto)}
                                className="gap-2"
                            >
                                <RefreshCw
                                    className={cn("size-4", estado === "cargando" && "animate-spin")}
                                    aria-hidden="true"
                                />
                                {estado === "cargando" ? "Calculando..." : "Calcular recomendación"}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Última actualización de las predicciones:{" "}
                            {formatFechaHora(recomendacion?.fechaHora ?? null)}
                        </p>

                        {estado === "cargando" ? (
                            <div className="space-y-4" aria-busy="true">
                                <Skeleton className="h-5 w-2/3 rounded" />
                                <Skeleton className="h-16 w-full rounded-xl" />
                            </div>
                        ) : estado === "error" ? (
                            <div
                                role="alert"
                                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive"
                            >
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                <span>{mensajeError ?? "No se pudo calcular la recomendación."}</span>
                            </div>
                        ) : recomendacion ? (
                            <div className="space-y-4 rounded-xl bg-gradient-to-br from-primary/10 to-background p-4 shadow-sm ring-1 ring-primary/20">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0 space-y-1">
                                        <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <CalendarRange className="size-4" aria-hidden="true" />
                                            Semana del {formatSemanaCorta(recomendacion.semanaObjetivo)}
                                        </p>
                                        <p className="text-base font-semibold">
                                            {recomendacion.unidades > 0
                                                ? `Se espera vender ${formatPiezas(recomendacion.unidades)} ${simbolo}.`
                                                : "Mantener el stock actual."}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="border-success/40 text-xs text-success"
                                        >
                                            Estimación automática
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-muted-foreground/30 text-xs text-muted-foreground"
                                        >
                                            {etiquetaOrigenHistorial(recomendacion.origenHistorial)}
                                        </Badge>
                                    </div>
                                </div>

                                <dl className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg bg-muted/40 p-4">
                                        <dt className="text-xs text-muted-foreground">Unidades estimadas</dt>
                                        <dd className="mt-1 text-2xl font-semibold tabular-nums">
                                            {formatPiezas(recomendacion.unidades)} {simbolo}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 p-4">
                                        <dt
                                            className="text-xs text-muted-foreground"
                                            title={`Banda calibrada con el test reservado. Cobertura observada: ${formatearProbabilidad(recomendacion.coberturaConfianza)}.`}
                                        >
                                            Intervalo {formatearProbabilidad(recomendacion.nivelConfianza)}
                                        </dt>
                                        <dd className="mt-1 text-2xl font-semibold tabular-nums">
                                            {recomendacion.intervaloInferior !== null &&
                                            recomendacion.intervaloSuperior !== null
                                                ? `${formatPiezas(recomendacion.intervaloInferior)} – ${formatPiezas(recomendacion.intervaloSuperior)} ${simbolo}`
                                                : "—"}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg bg-muted/40 p-4">
                                        <dt className="text-xs text-muted-foreground">Historial usado</dt>
                                        <dd className="mt-1 text-2xl font-semibold tabular-nums">
                                            {recomendacion.semanasBase} semanas
                                        </dd>
                                    </div>
                                </dl>

                            </div>
                        ) : null}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
