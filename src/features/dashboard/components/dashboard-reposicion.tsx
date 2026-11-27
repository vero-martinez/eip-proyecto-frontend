"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    PackageCheck,
    RefreshCw,
    ShoppingCart,
} from "lucide-react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getUnitSymbol } from "@/lib/units"
import type { UnitType } from "@/types/products"

import { MAX_REPOSICION_VISIBLES } from "../constants"
import { useReposicion } from "../hooks/use-reposicion"
import type {
    AlertaStockItem,
    AlertasStock,
    ReposicionProducto,
} from "../types"
import {
    formatFechaLarga,
    formatPiezas,
    formatSemanasLegibles,
} from "../utils"

interface DashboardReposicionProps {
    alertas: AlertasStock
}

type EstadoFila = "pedir_ya" | "pedir_pronto" | "suficiente"

interface FilaReposicion {
    productId: number
    nombre: string
    sku: string
    unitType: UnitType
    estado: EstadoFila
    stockActual: number
    stockMinimo: number
    demandaHorizonte: number
    semanasCobertura: number | null
    semanaAgotamiento: string | null
    cantidadSugerida: number
    fechaLimitePedido: string | null
    plazoSemanas: number
    confiable: boolean
}

const ESTADO: Record<
    EstadoFila,
    { etiqueta: string; clase: string; punto: string; barra: string }
> = {
    pedir_ya: {
        etiqueta: "Urgente",
        clase: "border-destructive/40 bg-destructive/10 text-destructive",
        punto: "bg-destructive",
        barra: "var(--destructive)",
    },
    pedir_pronto: {
        etiqueta: "Pronto",
        clase: "border-warning/40 bg-warning/10 text-warning",
        punto: "bg-warning",
        barra: "var(--warning)",
    },
    suficiente: {
        etiqueta: "Stock OK",
        clase: "border-success/40 bg-success/10 text-success",
        punto: "bg-success",
        barra: "var(--success)",
    },
}

const ORDEN_ESTADO: EstadoFila[] = ["pedir_ya", "pedir_pronto", "suficiente"]

function desdeAlerta(item: AlertaStockItem): FilaReposicion {
    const faltante = Math.max(0, item.unidadesFaltantes)
    return {
        productId: item.productId,
        nombre: item.nombre,
        sku: item.sku,
        unitType: item.unitType,
        estado: item.estado === "agotado" ? "pedir_ya" : "pedir_pronto",
        stockActual: item.currentStock,
        stockMinimo: item.currentStock + faltante,
        demandaHorizonte: faltante,
        semanasCobertura: null,
        semanaAgotamiento: null,
        cantidadSugerida: faltante,
        fechaLimitePedido: null,
        plazoSemanas: 0,
        confiable: false,
    }
}

function desdeReposicion(
    item: ReposicionProducto,
    alerta?: AlertaStockItem
): FilaReposicion {
    const faltanteAlerta = alerta ? Math.max(0, alerta.unidadesFaltantes) : 0
    const estado: EstadoFila =
        item.estado === "pedir_ya" || alerta?.estado === "agotado"
            ? "pedir_ya"
            : item.estado === "pedir_pronto" || faltanteAlerta > 0
              ? "pedir_pronto"
              : "suficiente"

    return {
        productId: item.productId,
        nombre: item.nombre,
        sku: item.sku,
        unitType: item.unitType,
        estado,
        stockActual: item.stockActual,
        stockMinimo: alerta
            ? alerta.currentStock + faltanteAlerta
            : item.stockMinimo,
        demandaHorizonte: item.demandaHorizonte,
        semanasCobertura: item.semanasCobertura,
        semanaAgotamiento: item.semanaAgotamiento,
        cantidadSugerida: Math.max(item.cantidadSugerida, faltanteAlerta),
        fechaLimitePedido: item.fechaLimitePedido,
        plazoSemanas: item.plazoSemanas,
        confiable: item.confiable,
    }
}

function MetricCard({
    titulo,
    valor,
    descripcion,
    descripcionVacia,
    icono: Icono,
    claseIcono,
    borde,
    numero,
    mostrarCheckVacio = false,
}: {
    titulo: string
    valor: number
    descripcion: string
    descripcionVacia: string
    icono: typeof ShoppingCart
    claseIcono?: string
    borde: string
    numero: string
    mostrarCheckVacio?: boolean
}) {
    const sinDatos = valor === 0
    const checkVacio = sinDatos && mostrarCheckVacio

    return (
        <div
            className={cn(
                "rounded-xl border-l-4 bg-background/80 p-3 shadow-sm ring-1 ring-foreground/10 sm:p-4",
                borde
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="min-h-8 break-words text-xs font-medium leading-tight text-muted-foreground">
                    {titulo}
                </p>
                <Icono className={cn("size-4 shrink-0", claseIcono ?? "text-primary")} aria-hidden="true" />
            </div>
            {checkVacio ? (
                <div className="mt-2 flex items-center gap-2 text-success">
                    <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-semibold">Sin urgencias hoy</span>
                </div>
            ) : (
                <p className={cn("mt-2 text-3xl font-semibold tabular-nums tracking-tight", numero)}>
                    {sinDatos ? "—" : formatPiezas(valor)}
                </p>
            )}
            {!checkVacio && (
                <p className="mt-1 min-h-8 break-words text-xs leading-tight text-muted-foreground">
                    {sinDatos ? descripcionVacia : descripcion}
                </p>
            )}
        </div>
    )
}

function StockTooltip({
    active,
    payload,
    label,
    sufijo,
}: {
    active?: boolean
    payload?: {
        payload?: {
            nombreCompleto?: string
            estado?: EstadoFila
            unidades?: number
            minimo?: number
        }
    }[]
    label?: string
    sufijo: string
}) {
    if (!active || !payload?.length) return null

    const fila = payload[0]?.payload
    const valor = Number(fila?.unidades ?? 0)
    const minimo = Number(fila?.minimo ?? 0)
    const estado = fila?.estado ? ESTADO[fila.estado] : null

    return (
        <div className="min-w-56 rounded-lg border bg-popover px-3 py-2 shadow-lg">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold">{fila?.nombreCompleto ?? label}</p>
                {estado && (
                    <span
                        className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            estado.clase
                        )}
                    >
                        <span className={cn("size-1.5 rounded-full", estado.punto)} />
                        {estado.etiqueta}
                    </span>
                )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
                Stock actual: {formatPiezas(valor)} {sufijo}
            </p>
            <p className="text-xs text-muted-foreground">
                Stock mínimo: {formatPiezas(minimo)} {sufijo}
            </p>
        </div>
    )
}

export function DashboardReposicion({
    alertas,
}: DashboardReposicionProps) {
    const { data, isLoading, isError, refetch } = useReposicion()
    const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)

    const horizonte = data?.horizonteSemanas ?? 4

    const filas = useMemo(() => {
        const alertasPorId = new Map(
            (alertas.items ?? [])
                .filter((item) => item.estado !== "inactivo")
                .map((item) => [item.productId, item])
        )

        const mapa = new Map<number, FilaReposicion>()
        ;(data?.productos ?? []).forEach((item) =>
                mapa.set(item.productId, desdeReposicion(item, alertasPorId.get(item.productId)))
            )

        alertasPorId.forEach((item, productId) => {
            if (!mapa.has(productId)) mapa.set(productId, desdeAlerta(item))
        })

        return [...mapa.values()].sort((a, b) => {
            const porEstado =
                ORDEN_ESTADO.indexOf(a.estado) - ORDEN_ESTADO.indexOf(b.estado)
            if (porEstado !== 0) return porEstado
            const coberturaA = a.semanasCobertura ?? Number.POSITIVE_INFINITY
            const coberturaB = b.semanasCobertura ?? Number.POSITIVE_INFINITY
            if (coberturaA !== coberturaB) return coberturaA - coberturaB
            if (b.cantidadSugerida !== a.cantidadSugerida) {
                return b.cantidadSugerida - a.cantidadSugerida
            }
            return a.nombre.localeCompare(b.nombre)
        })
    }, [alertas.items, data?.productos])

    const visibles = filas.slice(0, MAX_REPOSICION_VISIBLES)
    const seleccionado =
        visibles.find((item) => item.productId === seleccionadoId) ?? visibles[0]

    const resumen = useMemo(
        () => ({
            urgente: filas.filter((item) => item.estado === "pedir_ya").length,
            pronto: filas.filter((item) => item.estado === "pedir_pronto").length,
            ok: filas.filter((item) => item.estado === "suficiente").length,
            sugerido: filas
                .filter((item) => item.estado !== "suficiente")
                .reduce((total, item) => total + item.cantidadSugerida, 0),
        }),
        [filas]
    )

    const datosGrafico = useMemo(
        () =>
            filas.slice(0, MAX_REPOSICION_VISIBLES).map((item) => ({
                nombre: item.nombre.length > 26 ? `${item.nombre.slice(0, 25)}…` : item.nombre,
                nombreCompleto: item.nombre,
                productId: item.productId,
                estado: item.estado,
                unidades: item.stockActual,
                minimo: item.stockMinimo,
                unidadesBarra: Math.max(item.stockActual, 1),
                minimoBarra: Math.max(item.stockMinimo, 1),
            })),
        [filas]
    )

    const unidad = seleccionado ? getUnitSymbol(seleccionado.unitType) : ""

    return (
        <Card className="h-full overflow-hidden rounded-2xl border border-warning/30 border-t-4 border-t-warning bg-gradient-to-br from-[#FFF8E7] via-background to-background shadow-md dark:from-warning/10">
            <CardHeader className="space-y-4 p-4 pb-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning ring-1 ring-warning/30"
                            aria-hidden="true"
                        >
                            <ShoppingCart className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="text-xl">¿Qué debo comprar?</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Productos que necesitas reponer y cuánto pedir
                            </CardDescription>
                        </div>
                    </div>

                    {visibles.length > 0 && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                            {filas.length} {filas.length === 1 ? "producto" : "productos"}
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <MetricCard
                        titulo="Urgente"
                        valor={resumen.urgente}
                        descripcion="Por pedir ya"
                        descripcionVacia="Sin urgencias"
                        icono={AlertTriangle}
                        claseIcono="text-destructive"
                        borde="border-l-destructive"
                        numero="text-destructive"
                        mostrarCheckVacio
                    />
                    <MetricCard
                        titulo="Pronto"
                        valor={resumen.pronto}
                        descripcion="Por pedir pronto"
                        descripcionVacia="Sin pendientes"
                        icono={BarChart3}
                        claseIcono="text-warning"
                        borde="border-l-warning"
                        numero="text-warning"
                    />
                    <MetricCard
                        titulo="Stock OK"
                        valor={resumen.ok}
                        descripcion="Nada que pedir"
                        descripcionVacia="Nada cubierto"
                        icono={PackageCheck}
                        claseIcono="text-success"
                        borde="border-l-success"
                        numero="text-success"
                    />
                    <MetricCard
                        titulo="Total sugerido a comprar"
                        valor={resumen.sugerido}
                        descripcion="Unidades a pedir"
                        descripcionVacia="Sin unidades a pedir"
                        icono={ShoppingCart}
                        claseIcono="text-primary"
                        borde="border-l-primary"
                        numero="text-primary"
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 pt-0">
                {isLoading ? (
                    <div className="space-y-4" aria-busy="true">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-40 rounded-xl" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-background/70 px-4 py-10 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">No se pudo calcular la reposición</p>
                        <Button variant="outline" onClick={() => void refetch()}>
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Reintentar
                        </Button>
                    </div>
                ) : filas.length === 0 ? (
                    <div className="flex items-center gap-4 rounded-xl border border-success/25 bg-success/5 p-4 text-success">
                        <CheckCircle2 className="size-6 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-base font-semibold">Sin urgencias hoy</p>
                            <p className="text-xs text-muted-foreground">
                                No hay productos que necesiten pedido por ahora.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <section className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="flex items-center gap-2 text-base font-semibold">
                                    <BarChart3 className="size-4 text-primary" aria-hidden="true" />
                                    Top {MAX_REPOSICION_VISIBLES} más urgentes
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Solo los {MAX_REPOSICION_VISIBLES} con mayor prioridad · las cards resumen todos
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                {ORDEN_ESTADO.map((estado) => (
                                    <span key={estado} className="inline-flex items-center gap-1.5">
                                        <span className={cn("size-2.5 rounded-full", ESTADO[estado].punto)} />
                                        {ESTADO[estado].etiqueta}
                                    </span>
                                ))}
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="size-2.5 rounded-full bg-muted-foreground/60" />
                                    Stock mínimo
                                </span>
                                <span className="text-[11px] text-muted-foreground/80">
                                    Color = prioridad · largo = stock
                                </span>
                            </div>

                            <div
                                role="img"
                                aria-label={`Stock actual y mínimo de ${visibles.length} productos`}
                                tabIndex={0}
                                className="h-72 w-full rounded-xl bg-background/80 px-2 pb-2 pt-4 shadow-sm ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={datosGrafico}
                                        layout="vertical"
                                        margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
                                        barCategoryGap="25%"
                                    >
                                        <CartesianGrid
                                            horizontal={false}
                                            stroke="var(--border)"
                                            strokeDasharray="3 6"
                                        />
                                        <XAxis
                                            type="number"
                                            scale="log"
                                            domain={[1, "dataMax"]}
                                            ticks={[1, 10, 100]}
                                            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                            tickFormatter={(valor: number) => formatPiezas(valor)}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="nombre"
                                            width={150}
                                            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                                            offset={24}
                                            content={<StockTooltip sufijo={unidad} />}
                                        />
                                        <Bar
                                            dataKey="unidadesBarra"
                                            name="Stock actual"
                                            radius={[0, 7, 7, 0]}
                                            maxBarSize={16}
                                        >
                                            {datosGrafico.map((fila) => (
                                                <Cell
                                                    key={fila.productId}
                                                    fill={ESTADO[fila.estado].barra}
                                                    fillOpacity={0.85}
                                                />
                                            ))}
                                            <LabelList
                                                dataKey="unidades"
                                                position="right"
                                                fontSize={12}
                                                fill="var(--foreground)"
                                                formatter={(valor: unknown) =>
                                                    formatPiezas(Number(valor ?? 0))
                                                }
                                            />
                                        </Bar>
                                        <Bar
                                            dataKey="minimoBarra"
                                            name="Stock mínimo"
                                            fill="var(--muted-foreground)"
                                            fillOpacity={0.55}
                                            radius={[0, 7, 7, 0]}
                                            maxBarSize={16}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {seleccionado && (
                            <section className="space-y-4 border-t border-border pt-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0 space-y-1">
                                        <h3 className="text-base font-semibold">
                                            {seleccionado.nombre}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {seleccionado.sku}
                                        </p>
                                    </div>
                                    <select
                                        value={seleccionado.productId}
                                        onChange={(event) =>
                                            setSeleccionadoId(Number(event.target.value))
                                        }
                                        aria-label="Elegir producto"
                                        className="h-10 max-w-64 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {visibles.map((item) => (
                                            <option key={item.productId} value={item.productId}>
                                                {item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="rounded-xl bg-gradient-to-br from-warning/10 to-background p-4 shadow-sm ring-1 ring-warning/20">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <Badge
                                            variant="outline"
                                            className={ESTADO[seleccionado.estado].clase}
                                        >
                                            {ESTADO[seleccionado.estado].etiqueta}
                                        </Badge>
                                        {seleccionado.cantidadSugerida > 0 && (
                                            <p className="text-base font-semibold text-primary">
                                                Pedir {formatPiezas(seleccionado.cantidadSugerida)} unidades
                                            </p>
                                        )}
                                    </div>

                                    <ul className="mt-4 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
                                        {seleccionado.semanasCobertura !== null && (
                                            <li>
                                                Te alcanza para unas {formatSemanasLegibles(seleccionado.semanasCobertura)}.
                                            </li>
                                        )}
                                        {seleccionado.semanaAgotamiento && (
                                            <li>
                                                Se acabaría el {formatFechaLarga(seleccionado.semanaAgotamiento)}.
                                            </li>
                                        )}
                                        {seleccionado.demandaHorizonte > 0 && (
                                            <li>
                                                Se espera vender {formatPiezas(seleccionado.demandaHorizonte)} unidades en {horizonte} semanas.
                                            </li>
                                        )}
                                        {seleccionado.fechaLimitePedido && (
                                            <li>
                                                Haz el pedido antes del {formatFechaLarga(seleccionado.fechaLimitePedido)}.
                                            </li>
                                        )}
                                        {seleccionado.plazoSemanas > 0 && (
                                            <li>
                                                Considerando {seleccionado.plazoSemanas}{" "}
                                                {seleccionado.plazoSemanas === 1 ? "semana" : "semanas"} de entrega.
                                            </li>
                                        )}
                                    </ul>

                                    {!seleccionado.confiable && (
                                        <p className="mt-4 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
                                            Predicción aproximada: revisa este pedido antes de confirmarlo.
                                        </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-4">
                                        {seleccionado.cantidadSugerida > 0 && (
                                            <Link
                                                href="/compras"
                                                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                            >
                                                Crear orden de compra
                                            </Link>
                                        )}
                                        <Link
                                            href={`/productos?producto=${seleccionado.productId}`}
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                        >
                                            Ver producto
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="flex justify-center pt-4">
                            <Link
                                href="/productos"
                                className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                                Ver todos
                            </Link>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
