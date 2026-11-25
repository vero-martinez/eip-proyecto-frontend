"use client"

/**
 * Página del Dashboard: resumen gerencial del periodo seleccionado.
 *
 * Todos los indicadores provienen de `GET /dashboard/resumen`; el selector de
 * periodo cambia la consulta y la serie semanal se recalcula con la respuesta.
 */

import { AlertTriangle, RefreshCw } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardAlertas } from "@/features/dashboard/components/dashboard-alertas"
import { DashboardPeriodoToggle } from "@/features/dashboard/components/dashboard-periodo-toggle"
import { DashboardSemanalChart } from "@/features/dashboard/components/dashboard-semanal-chart"
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats"
import { DashboardTopProductos } from "@/features/dashboard/components/dashboard-top-productos"
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard"
import type { PeriodoDashboard } from "@/features/dashboard/types"
import { formatRangoPeriodo } from "@/features/dashboard/utils"
import { cn } from "@/lib/utils"
import { DashboardPronostico } from "@/features/dashboard/components/dashboard-pronostico"
import { DashboardReposicion } from "@/features/dashboard/components/dashboard-reposicion"
import { DashboardAnomalias } from "@/features/dashboard/components/dashboard-anomalias"

export default function DashboardPage() {
    const [periodo, setPeriodo] = React.useState<PeriodoDashboard>("mes")
    const { data, isLoading, isFetching, isError, refetch } = useDashboard(periodo)

    if (isError) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="flex h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground"
            >
                <AlertTriangle
                    className="size-8 text-destructive"
                    aria-hidden="true"
                />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        No se pudo cargar el dashboard.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Ocurrió un problema al conectar con el servidor.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="mt-2 gap-2"
                >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Reintentar</span>
                </Button>
            </div>
        )
    }

    if (isLoading) {
        return <DashboardEsqueleton />
    }

    if (!data) return null

    
return (
    <main className="flex flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-lg font-semibold tracking-tight">
                    Resumen del periodo
                </h1>
                <p className="text-xs text-muted-foreground">
                    {formatRangoPeriodo(data.desde, data.hasta)} ·{" "}
                    {data.resumenVentas.cantidadVentas}{" "}
                    {data.resumenVentas.cantidadVentas === 1
                        ? "operación registrada"
                        : "operaciones registradas"}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <DashboardPeriodoToggle
                    periodo={periodo}
                    onPeriodoChange={setPeriodo}
                    disabled={isFetching}
                />
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Actualizar dashboard"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw
                        className={cn("size-4", isFetching && "animate-spin")}
                        aria-hidden="true"
                    />
                </Button>
            </div>
        </header>

        <DashboardStats resumen={data.resumenVentas} />

        {/* Ventas, productos y alertas */}
<section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
    {/* Gráfico de ventas */}
    <div className="min-w-0 xl:col-span-2">
                    <DashboardSemanalChart serie={data.serieSemanal} />
      </div>

    {/* Productos y alertas */}
    <div className="flex min-w-0 flex-col gap-4">
        <DashboardTopProductos productos={data.topProductos} />

        <DashboardAlertas alertas={data.alertasStock} />
    </div>
</section>

        {/* Pronóstico y reposición */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="min-w-0">
                <DashboardPronostico />
            </div>

            <div className="min-w-0">
                <DashboardReposicion />
            </div>
        </section>

        {/* Análisis de anomalías */}
        <section className="w-full min-w-0">
            <DashboardAnomalias />
        </section>
    </main>
)

}

/** Esqueleto con la misma silueta del dashboard para evitar el salto al cargar. */

function DashboardEsqueleton() {
    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className="flex flex-col gap-6 sm:gap-8"
        >
            <span className="sr-only">Cargando dashboard...</span>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-48" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28" />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Skeleton className="h-80 lg:col-span-2" />
                <Skeleton className="h-80" />
            </div>

            <Skeleton className="h-64" />
        </div>
    )
}