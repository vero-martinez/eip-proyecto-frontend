/**
 * Utilidades del módulo de Inventario: cálculos de stock y costos de
 * lotes, resolución de etiquetas visuales y métricas del historial de
 * entradas.
 */

import type { Product, UnitType } from "@/types/products"
import { getUnitSymbol, hasLowStock } from "@/lib/units"
import { formatDate } from "@/lib/utils"

import { ORIGEN_LOTE_ITEMS } from "./constants"
import type { Proveedor } from "@/features/proveedores/types"
import type {
    ConsumoDetalle,
    Lote,
    OrigenLote,
    StockEntry,
} from "./types"

export const round2 = (n: number): number => Math.round(n * 100) / 100

/** Valida que una cantidad sea un número finito positivo y la devuelve redondeada. */
export function validarCantidadPositiva(cantidad: number): number {
    if (!Number.isFinite(cantidad) || round2(cantidad) <= 0) {
        throw new Error("La cantidad debe ser mayor a 0")
    }
    return round2(cantidad)
}

/** Valida que un costo no sea un número finito negativo y lo devuelve redondeado. */
export function validarCostoNoNegativo(costo: number): number {
    if (!Number.isFinite(costo) || costo < 0) {
        throw new Error("El costo no puede ser negativo")
    }
    return round2(costo)
}

/** Suma la cantidad total disponible en los lotes. */
export function sumDisponible(lotes: Lote[]): number {
    return round2(
        lotes.reduce((total, lote) => total + lote.cantidadDisponible, 0)
    )
}

/** Calcula el costo promedio ponderado del stock disponible. */
export function costoPromedioPonderado(lotes: Lote[]): number {
    const total = sumDisponible(lotes)
    if (total <= 0) return 0

    const valor = lotes.reduce(
        (acumulado, lote) => acumulado + lote.cantidadDisponible * lote.costoUnitarioSoles,
        0
    )
    return round2(valor / total)
}

/** Calcula el costo total de las salidas de stock (COGS). */
export function costoConsumoTotal(detalles: ConsumoDetalle[]): number {
    return round2(
        detalles.reduce(
            (acumulado, detalle) => acumulado + detalle.cantidad * detalle.costoUnitarioSoles,
            0
        )
    )
}

/** Filtra los lotes con stock de un producto, del más antiguo al más reciente (FIFO). */
export function filtrarLotesConStock(lotes: Lote[], productId: number): Lote[] {
    return lotes
        .filter(
            (lote) => lote.productId === productId && lote.cantidadDisponible > 0
        )
        .sort(
            (a, b) =>
                new Date(a.fechaIngreso).getTime() -
                    new Date(b.fechaIngreso).getTime() || a.id - b.id
        )
}

/** Asigna el consumo FIFO contra los lotes disponibles. Lanza si no alcanza el stock. */
export function asignarConsumoFIFO(
    lotes: Lote[],
    cantidad: number
): ConsumoDetalle[] {
    const detalle: ConsumoDetalle[] = []
    let restante = round2(cantidad)

    for (const lote of lotes) {
        if (restante <= 0) break
        const cargar = Math.min(lote.cantidadDisponible, restante)
        if (cargar <= 0) continue

        detalle.push({
            loteId: lote.id,
            cantidad: round2(cargar),
            costoUnitarioSoles: lote.costoUnitarioSoles,
        })
        restante = round2(restante - cargar)
    }

    if (restante > 0) {
        throw new Error("Stock insuficiente")
    }

    return detalle
}

/** Etiqueta y tint del badge según el origen del lote. */
export function getOrigenLoteInfo(origen: OrigenLote): (typeof ORIGEN_LOTE_ITEMS)[number] {
    return (
        ORIGEN_LOTE_ITEMS.find((item) => item.value === origen) ?? {
            value: origen,
            label: "Desconocido",
            tint: "bg-slate-500/10 text-slate-600 ring-slate-500/25 dark:text-slate-300",
        }
    )
}

/* ===== Entradas ===== */

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/** Busca el nombre de un proveedor según su ID. */
export function getProveedorName(
    proveedorId: number | undefined,
    proveedores: Proveedor[]
): string | undefined {
    if (proveedorId === undefined) return undefined
    return proveedores.find((proveedor) => proveedor.id === proveedorId)?.name
}

/** Comprueba si la entrada se registró en los últimos 30 días. */
function isWithinLast30Days(entry: StockEntry): boolean {
    return Date.now() - new Date(entry.createdAt).getTime() <= THIRTY_DAYS_MS
}

/** Agrega el símbolo de la unidad a la cantidad ingresada (ej: "+6 u"). */
export function formatEntryQuantity(quantity: number, unitType: UnitType): string {
    return `+${quantity} ${getUnitSymbol(unitType)}`
}

/** Obtiene los últimos N registros de entrada con su producto resuelto, del más reciente al más antiguo. */
export function getRecentEntradas(
    entries: StockEntry[],
    products: Product[],
    limit = 5
): (StockEntry & { product: Product })[] {
    return [...entries]
        .map((entry) => ({
            ...entry,
            product: products.find((p) => p.id === entry.productId),
        }))
        .filter(
            (item): item is StockEntry & { product: Product } =>
                item.product !== undefined
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit)
}

/** Calcula el resumen de métricas para las tarjetas del panel. */
export function summarizeEntradas(
    entries: StockEntry[],
    products: Product[]
): {
    totalInventory: number
    entriesLast30: number
    unitsLast30: number
    lowStock: number
    lastEntry: (StockEntry & { product: Product }) | undefined
} {
    const totalInventory = products.filter((p) => p.currentStock > 0).length
    const lowStock = products.filter(hasLowStock).length

    const entriesLast30 = entries.filter(isWithinLast30Days)
    const unitsLast30 = entriesLast30.reduce((sum, item) => sum + item.quantity, 0)

    const [lastEntry] = getRecentEntradas(entries, products, 1)

    return {
        totalInventory,
        entriesLast30: entriesLast30.length,
        unitsLast30,
        lowStock,
        lastEntry,
    }
}

/** Formatea la fecha de la última entrada para mostrar en pantalla. */
export function formatLastEntryDate(date: string): string {
    return `el ${formatDate(date)}`
}