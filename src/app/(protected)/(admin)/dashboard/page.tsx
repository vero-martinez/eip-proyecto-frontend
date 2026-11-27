"use client"

import { AlertTriangle, CheckCircle2, Info, RefreshCw, ShoppingCart, Sparkles, TrendingUp } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardAnomalias } from "@/features/dashboard/components/dashboard-anomalias"
import { DashboardML } from "@/features/dashboard/components/dashboard-ml"
import { DashboardPeriodoToggle } from "@/features/dashboard/components/dashboard-periodo-toggle"
import { DashboardPronostico } from "@/features/dashboard/components/dashboard-pronostico"
import { DashboardReposicion } from "@/features/dashboard/components/dashboard-reposicion"
import { DashboardSemanalChart } from "@/features/dashboard/components/dashboard-semanal-chart"
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats"
import { DashboardTopProductos } from "@/features/dashboard/components/dashboard-top-productos"
import { useAnomalias } from "@/features/dashboard/hooks/use-anomalias"
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard"
import { usePronostico } from "@/features/dashboard/hooks/use-pronostico"
import { useReposicion } from "@/features/dashboard/hooks/use-reposicion"
import type { PeriodoDashboard, SerieSemanal } from "@/features/dashboard/types"
import {
    formatFechaHora,
    formatFechaLarga,
    formatPiezas,
    formatRangoPeriodo,
    getResumenAnomalias,
} from "@/features/dashboard/utils"
import { cn } from "@/lib/utils"

interface ResumenHoyProps {
    serie: SerieSemanal[]
    datosListos: boolean
    cargando: boolean
    hayError: boolean
    onReintentar: () => void
    urgente: {
        nombre: string
        cantidad: number
        fecha: string | null
    } | null
    resumenAnomalias: { texto: string | null; clave: string | null }
    onVerDetalle: () => void
    unidadesEsperadas: number | null
}

function ResumenHoy({
    serie,
    datosListos,
    cargando,
    hayError,
    onReintentar,
    urgente,
    resumenAnomalias,
    onVerDetalle,
    unidadesEsperadas,
}: ResumenHoyProps) {
    const frases: {
        tono: "rojo" | "naranja" | "verde"
        Icono: typeof ShoppingCart
        texto: string
        onClick?: () => void
    }[] = []

    if (urgente) {
        frases.push({
            tono: "rojo",
            Icono: ShoppingCart,
            texto: `Debes pedir ${formatPiezas(urgente.cantidad)} unidades de ${urgente.nombre} antes del ${formatFechaLarga(urgente.fecha)}.`,
        })
    }

    if (resumenAnomalias.texto) {
        frases.push({
            tono: "naranja",
            Icono: AlertTriangle,
            texto: resumenAnomalias.texto,
            onClick: onVerDetalle,
        })
    }

    if (unidadesEsperadas !== null && unidadesEsperadas > 0) {
        frases.push({
            tono: "verde",
            Icono: TrendingUp,
            texto: `Se espera vender unas ${formatPiezas(Math.round(unidadesEsperadas))} unidades en las próximas 4 semanas (todas las unidades: piezas y kilos).`,
        })
    }

    const estilos = {
        rojo: "border-red-300 bg-red-100 text-red-800 shadow-sm shadow-red-500/10",
        naranja: "border-amber-300 bg-amber-100 text-amber-900 shadow-sm shadow-amber-500/10",
        verde: "border-emerald-300 bg-emerald-100 text-emerald-900 shadow-sm shadow-emerald-500/10",
    }

    return (
        <section
            aria-label="Resumen de hoy"
            className="rounded-2xl border border-primary/25 bg-gradient-to-br from-[#F4F0FF] via-[#FAF8FF] to-white p-4 text-slate-900 shadow-sm shadow-primary/10 sm:p-6"
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">Resumen de hoy</h2>
                    <p className="text-xs text-slate-600">
                        Lo que necesita tu negocio en este momento
                    </p>
                </div>
                <span className="text-xs text-slate-600">
                    {datosListos ? `${serie.length} semanas revisadas` : "Preparando resumen"}
                </span>
            </div>

            {cargando ? (
                <div className="grid gap-4 sm:grid-cols-3" aria-busy="true">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-xl" />
                    ))}
                </div>
            ) : hayError ? (
                <div className="flex flex-col items-start gap-4 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-red-700">
                        No se pudo preparar el resumen de hoy.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                            event.stopPropagation()
                            onReintentar()
                        }}
                    >
                        <RefreshCw className="size-4" aria-hidden="true" />
                        Reintentar
                    </Button>
                </div>
            ) : frases.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-100 p-4 text-emerald-900 shadow-sm shadow-emerald-500/10">
                    <CheckCircle2 className="size-6 shrink-0" aria-hidden="true" />
                    <div>
                        <p className="text-base font-semibold">Todo en orden: sin ventas raras</p>
                        <p className="text-xs text-slate-600">
                            No hay compras urgentes ni ventas inusuales por revisar.
                        </p>
                    </div>
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-3">
                    {frases.map(({ tono, Icono, texto, onClick }) => {
                        const contenido = (
                            <>
                                <Icono className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                                <span>{texto}</span>
                            </>
                        )

                        return (
                            <li
                                key={texto}
                                className={cn(
                                    "rounded-xl border p-4 text-sm leading-relaxed",
                                    estilos[tono]
                                )}
                            >
                                {onClick ? (
                                    <button
                                        type="button"
                                        onClick={onClick}
                                        className="flex w-full items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                    >
                                        {contenido}
                                    </button>
                                ) : (
                                    <div className="flex items-start gap-3">{contenido}</div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

export default function DashboardPage() {
    const [periodo, setPeriodo] = React.useState<PeriodoDashboard>("mes")
    const [anomaliaResaltada, setAnomaliaResaltada] = React.useState<{
        clave: string
        nonce: number
    } | null>(null)
    const dashboard = useDashboard(periodo)
    const reposicion = useReposicion()
    const pronostico = usePronostico()
    const anomalias = useAnomalias()

    const resumenAnomalias = React.useMemo(
        () => getResumenAnomalias(anomalias.data?.anomalias ?? []),
        [anomalias.data?.anomalias]
    )

    const datosAuxiliaresListos =
        !reposicion.isLoading && !pronostico.isLoading && !anomalias.isLoading
    const hayErrorAuxiliar = reposicion.isError || pronostico.isError || anomalias.isError

    function reintentarAuxiliares() {
        if (reposicion.isError) void reposicion.refetch()
        if (pronostico.isError) void pronostico.refetch()
        if (anomalias.isError) void anomalias.refetch()
    }

    if (dashboard.isError) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="flex h-64 flex-col items-center justify-center gap-4 text-center text-muted-foreground"
            >
                <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        No se pudo cargar el panel.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Ocurrió un problema al conectar con el servidor.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => void dashboard.refetch()}
                    className="gap-2"
                >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Reintentar
                </Button>
            </div>
        )
    }

    if (dashboard.isLoading) return <DashboardEsqueleton />

    const data = dashboard.data
    if (!data) return null

    const productosReposicion = reposicion.data?.productos ?? []
    const urgente = [...productosReposicion]
        .filter((item) => item.estado === "pedir_ya" && item.cantidadSugerida > 0)
        .sort((a, b) => b.cantidadSugerida - a.cantidadSugerida)[0]

    const unidadesEsperadas = pronostico.data?.productos.reduce(
        (total, producto) =>
            total + producto.semanas.reduce((suma, semana) => suma + semana.unidades, 0),
        0
    )

    const actualizaciones = [
        reposicion.dataUpdatedAt,
        pronostico.dataUpdatedAt,
        anomalias.dataUpdatedAt,
    ].filter((valor) => valor > 0)
    const ultimaActualizacion = actualizaciones.length
        ? Math.max(...actualizaciones)
        : null

    function verDetalleAnomalias() {
        const destino =
            document.getElementById("detalle-anomalias") ??
            document.getElementById("anomalias")
        destino?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
        if (resumenAnomalias.clave) {
            setAnomaliaResaltada({
                clave: resumenAnomalias.clave,
                nonce: Date.now(),
            })
        }
    }

    return (
        <main className="flex flex-col gap-8">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Panel de control</h1>
                    <p className="text-xs text-muted-foreground">
                        {formatRangoPeriodo(data.desde, data.hasta)} ·{" "}
                        {data.resumenVentas.cantidadVentas}{" "}
                        {data.resumenVentas.cantidadVentas === 1
                            ? "operación registrada"
                            : "operaciones registradas"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Última actualización: {formatFechaHora(ultimaActualizacion)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <DashboardPeriodoToggle
                        periodo={periodo}
                        onPeriodoChange={setPeriodo}
                        disabled={dashboard.isFetching}
                    />
                    <Button
                        variant="outline"
                        onClick={() => void dashboard.refetch()}
                        disabled={dashboard.isFetching}
                        className="gap-2"
                    >
                        <RefreshCw
                            className={cn("size-4", dashboard.isFetching && "animate-spin")}
                            aria-hidden="true"
                        />
                        Actualizar
                    </Button>
                </div>
            </header>

            <ResumenHoy
                serie={data.serieSemanal}
                datosListos={datosAuxiliaresListos}
                cargando={!datosAuxiliaresListos && !hayErrorAuxiliar}
                hayError={hayErrorAuxiliar}
                onReintentar={reintentarAuxiliares}
                urgente={
                    urgente
                        ? {
                              nombre: urgente.nombre,
                              cantidad: urgente.cantidadSugerida,
                              fecha: urgente.fechaLimitePedido,
                          }
                        : null
                }
                resumenAnomalias={resumenAnomalias}
                onVerDetalle={verDetalleAnomalias}
                unidadesEsperadas={unidadesEsperadas ?? null}
            />

            <DashboardStats resumen={data.resumenVentas} serie={data.serieSemanal} />

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="min-w-0 xl:col-span-2">
                    <DashboardSemanalChart serie={data.serieSemanal} />
                </div>
                <div className="min-w-0">
                    <DashboardTopProductos productos={data.topProductos} />
                </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-4 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            aria-hidden="true"
                        >
                            <Sparkles className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">Inteligencia de datos</h2>
                            <p className="text-xs text-muted-foreground">
                                Predicciones automáticas basadas en tu historial de ventas
                            </p>
                        </div>
                    </div>

                    <span
                        className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
                        title="Predicciones generadas con el modelo de demanda"
                        aria-label="Detalles del origen de las predicciones"
                    >
                        <Info className="size-4" aria-hidden="true" />
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                    <div className="flex min-w-0 flex-col gap-4 xl:col-span-7">
                        <DashboardPronostico />
                        <DashboardML />
                    </div>
                    <div className="min-w-0 xl:col-span-5">
                        <DashboardReposicion alertas={data.alertasStock} />
                    </div>
                </div>
            </section>

            <DashboardAnomalias
                serie={data.serieSemanal}
                resaltado={anomaliaResaltada}
            />
        </main>
    )
}

function DashboardEsqueleton() {
    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className="flex flex-col gap-8"
        >
            <span className="sr-only">Cargando panel...</span>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-72" />
            </div>
            <Skeleton className="h-28 rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28" />
                ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
                <Skeleton className="h-[520px] xl:col-span-2" />
                <Skeleton className="h-[520px]" />
            </div>
            <div className="space-y-4 rounded-3xl border border-primary/20 bg-primary/5 p-4 sm:p-6">
                <Skeleton className="h-10 w-80" />
                <div className="grid gap-4 xl:grid-cols-12">
                    <div className="flex flex-col gap-4 xl:col-span-7">
                        <Skeleton className="h-[600px]" />
                        <Skeleton className="h-48" />
                    </div>
                    <Skeleton className="h-full min-h-[600px] xl:col-span-5" />
                </div>
            </div>
            <Skeleton className="h-[480px]" />
        </div>
    )
}
