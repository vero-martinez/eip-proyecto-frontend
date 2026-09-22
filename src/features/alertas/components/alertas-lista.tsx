/**
 * Componente: AlertasLista
 * 
 * Descripción:
 * Renderiza un panel/tarjeta con la lista de productos que requieren atención según el estado
 * de su inventario (sin stock/agotados, stock por debajo del mínimo configurado o productos inactivos).
 * 
 * Funcionalidad:
 * - Permite filtrar la lista por categoría de alerta (Todas, Agotados, Bajo stock, Inactivos).
 * - Muestra métricas visuales del estado de stock de cada producto frente a su mínimo establecido.
 * - Incluye accesos directos para registrar entradas de inventario asociadas al producto seleccionado.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    AlertTriangle,
    CheckCircle2,
    CircleOff,
    EyeOff,
    Inbox,
    PackagePlus,
} from "lucide-react"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatStock, getUnitSymbol } from "@/lib/units"
import { getParentCategoryName } from "@/lib/categories"
import type { Category, Product } from "@/types/products"

import {
    getStockBadges,
    getStockToMinPercent,
    getUnitsToMin,
    matchesAlertFilter,
    sortAlertasBySeverity,
    type AlertFilter,
} from "../utils"

interface AlertasListaProps {
    products: Product[]
    categories: Category[]
}

const FILTER_OPTIONS: { value: AlertFilter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "agotado", label: "Agotados" },
    { value: "bajo", label: "Bajo stock" },
    { value: "inactivo", label: "Inactivos" },
]

type Tone = "agotado" | "bajo" | "inactivo"

const TONES: Record<
    Tone,
    { stripe: string; bar: string; icon: string; text: string }
> = {
    agotado: {
        stripe: "before:bg-rose-500",
        bar: "bg-rose-500",
        icon: "bg-rose-500/10 text-rose-600 ring-rose-500/25 dark:text-rose-400",
        text: "text-rose-600 dark:text-rose-400",
    },
    bajo: {
        stripe: "before:bg-amber-300",
        bar: "bg-amber-300",
        icon: "bg-amber-300/20 text-amber-600 ring-amber-300/50 dark:text-amber-300",
        text: "text-amber-700 dark:text-amber-400",
    },
    inactivo: {
        stripe: "before:bg-slate-400 dark:before:bg-slate-600",
        bar: "bg-slate-400",
        icon: "bg-slate-500/10 text-slate-500 ring-slate-500/25 dark:text-slate-400",
        text: "text-slate-600 dark:text-slate-400",
    },
}

export function AlertasLista({ products, categories }: AlertasListaProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<AlertFilter>("all")

    const alerts = sortAlertasBySeverity(products)
    const filtered =
        filter === "all"
            ? alerts
            : alerts.filter((product) => matchesAlertFilter(product, filter))

    const counts = Object.fromEntries(
        FILTER_OPTIONS.map((option) => [
            option.value,
            option.value === "all"
                ? alerts.length
                : alerts.filter((p) => matchesAlertFilter(p, option.value)).length,
        ])
    ) as Record<AlertFilter, number>

    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader className="gap-4 pb-4">
                <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/25 dark:text-rose-400">
                        <AlertTriangle className="size-4" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold leading-tight">
                            Alertas de stock
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {alerts.length
                                ? `${alerts.length} ${
                                      alerts.length === 1
                                          ? "producto requiere"
                                          : "productos requieren"
                                  } atención.`
                                : "Todo el catálogo está en orden."}
                        </CardDescription>
                    </div>
                </div>

                <div
                    role="group"
                    aria-label="Filtrar alertas por tipo"
                    className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
                >
                    {FILTER_OPTIONS.map((option) => {
                        const active = filter === option.value
                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setFilter(option.value)}
                                className={cn(
                                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    active
                                        ? "border-violet-400 bg-violet-400 text-violet-950"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {option.label}
                                <span
                                    className={cn(
                                        "rounded-full px-1.5 text-xs tabular-nums",
                                        active
                                            ? "bg-violet-950/15 text-violet-950"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {counts[option.value]}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-2 pt-0">
                {filtered.length ? (
                    filtered.map((product) => {
                        const percent = Math.min(
                            100,
                            Math.max(0, getStockToMinPercent(product))
                        )
                        const missing = getUnitsToMin(product)
                        const unit = getUnitSymbol(product.unitType)
                        const badges = getStockBadges(product)
                        const categoryName = getParentCategoryName(
                            product.categoryId,
                            categories
                        )
                        const tone: Tone = badges.inactivo
                            ? "inactivo"
                            : badges.agotado
                            ? "agotado"
                            : "bajo"
                        const styles = TONES[tone]
                        const Icon = badges.inactivo
                            ? EyeOff
                            : badges.agotado
                            ? CircleOff
                            : AlertTriangle

                        return (
                            <div
                                key={product.id}
                                className={cn(
                                    "relative grid gap-4 overflow-hidden rounded-lg border border-border bg-card py-3 pl-5 pr-3 transition-colors hover:bg-muted/40",
                                    "before:absolute before:inset-y-0 before:left-0 before:w-1",
                                    "md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center",
                                    styles.stripe,
                                    badges.inactivo && "opacity-80"
                                )}
                            >
                                {/* Producto */}
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        className={cn(
                                            "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1",
                                            styles.icon
                                        )}
                                    >
                                        <Icon className="size-4" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <p
                                            className="truncate text-sm font-semibold text-foreground"
                                            title={product.name}
                                        >
                                            {product.name}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {product.sku}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="rounded-full px-2 py-0 text-xs font-normal text-muted-foreground"
                                            >
                                                {categoryName}
                                            </Badge>
                                            {badges.agotado && (
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full border-rose-500/30 bg-rose-500/10 px-2 py-0 text-xs font-medium text-rose-600 dark:text-rose-400"
                                                >
                                                    Agotado
                                                </Badge>
                                            )}
                                            {badges.bajoStock && (
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full border-amber-300/60 bg-amber-300/20 px-2 py-0 text-xs font-medium text-amber-700 dark:text-amber-300"
                                                >
                                                    Bajo stock
                                                </Badge>
                                            )}
                                            {badges.inactivo && (
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full border-slate-500/30 bg-slate-500/10 px-2 py-0 text-xs font-medium text-slate-600 dark:text-slate-300"
                                                >
                                                    Inactivo
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="space-y-1.5">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-lg font-semibold leading-none tabular-nums text-foreground">
                                            {formatStock(product)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            mínimo{" "}
                                            <span className="font-medium tabular-nums text-foreground">
                                                {product.minStockAlert} {unit}
                                            </span>
                                        </span>
                                    </div>
                                    <div
                                        role="progressbar"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={Math.round(percent)}
                                        aria-label="Porcentaje de stock frente al mínimo"
                                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                                    >
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-[width] duration-500",
                                                styles.bar
                                            )}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <p
                                        className={cn(
                                            "text-xs font-medium",
                                            missing > 0
                                                ? styles.text
                                                : "text-emerald-600 dark:text-emerald-400"
                                        )}
                                    >
                                        {missing > 0
                                            ? `Faltan ${missing} ${unit} para el mínimo`
                                            : "En el nivel mínimo"}
                                    </p>
                                </div>

                                {/* Acción */}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={badges.inactivo ? "outline" : "default"}
                                    disabled={badges.inactivo}
                                    title={
                                        badges.inactivo
                                            ? "Los productos inactivos no pueden recibir entradas"
                                            : undefined
                                    }
                                    onClick={() =>
                                        router.push(`/entradas?producto=${product.id}`)
                                    }
                                    className="h-9 w-full gap-2 md:w-auto"
                                >
                                    <PackagePlus className="size-4" aria-hidden="true" />
                                    <span>Registrar entrada</span>
                                </Button>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex h-44 flex-col items-center justify-center gap-2.5 text-center">
                        <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                            <CheckCircle2
                                className="size-5 text-emerald-500"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                                {alerts.length
                                    ? "Sin resultados para este filtro"
                                    : "Sin alertas"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {alerts.length
                                    ? "Probá con otro tipo de alerta o elegí “Todas”."
                                    : "Todos los productos activos están sobre su mínimo y no hay inactivos."}
                            </p>
                        </div>
                    </div>
                )}

                {alerts.length > 0 && (
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <Inbox className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <p>
                            “Registrar entrada” abre el módulo de entradas con el
                            producto ya seleccionado. Los productos inactivos no
                            pueden recibir entradas.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}