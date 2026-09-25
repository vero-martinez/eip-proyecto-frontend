/**
 * Servicio de Lotes.
 * Gestiona el control de inventario por lotes usando el método FIFO.
 */

import type { Product } from "@/types/products"
import { actualizarStockService, obtenerProductosService } from "./adapters"
import { getProveedoresService } from "@/features/proveedores/services/proveedores.service"
import {
    asignarConsumoFIFO,
    costoPromedioPonderado,
    filtrarLotesConStock,
    round2,
    sumDisponible,
    validarCantidadPositiva,
    validarCostoNoNegativo,
} from "../utils"
import {
    type ConsumoDetalle,
    type Lote,
    type LoteRequest,
    type LotesFilters,
    type OrigenLote,
} from "../types"

// ===== Mock data =====

const APERTURAS_INICIALES: {
    productId: number
    cantidad: number
    costoUnitarioSoles: number
    proveedorId?: number
    fechaIngreso?: string
}[] = [
        { productId: 1, cantidad: 30, costoUnitarioSoles: 8, proveedorId: 3 },
        { productId: 2, cantidad: 85.5, costoUnitarioSoles: 18 },
        { productId: 3, cantidad: 250, costoUnitarioSoles: 22 },
        { productId: 4, cantidad: 12, costoUnitarioSoles: 20, proveedorId: 2 },
        { productId: 5, cantidad: 3, costoUnitarioSoles: 30, proveedorId: 2 },
        { productId: 6, cantidad: 9, costoUnitarioSoles: 25, proveedorId: 1 },
        { productId: 7, cantidad: 2, costoUnitarioSoles: 10 },
    ]

const ENTRADAS_INICIALES: {
    productId: number
    cantidad: number
    costoUnitarioSoles: number
    proveedorId?: number
    fechaIngreso: string
}[] = [
        {
            productId: 1,
            cantidad: 10,
            costoUnitarioSoles: 8,
            proveedorId: 3,
            fechaIngreso: "2026-09-15T04:21:22.600Z",
        },
    ]

let MOCK_LOTES: Lote[] = []
let loteNextId = 0
let loteCodeCounter = 0
let built = false

/** Simula latencia de red. */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Helpers internos =====

/** Calcula el costo promedio ponderado actual de un producto. */
async function costoPromedioActual(productId: number): Promise<number> {
    const disponibles = filtrarLotesConStock(MOCK_LOTES, productId)
    return disponibles.length > 0 ? costoPromedioPonderado(disponibles) : 0
}

/** Recalcula y actualiza el stock total y el costo del producto según sus lotes. */
async function syncProductStock(productId: number): Promise<void> {
    await delay(150)
    const disponibles = filtrarLotesConStock(MOCK_LOTES, productId)
    const stock = sumDisponible(disponibles)

    const patch: Partial<Pick<Product, "currentStock" | "costPrice">> = {
        currentStock: round2(stock),
    }
    if (sumDisponible(disponibles) > 0) {
        patch.costPrice = round2(costoPromedioPonderado(disponibles))
    }
    await actualizarStockService(productId, patch)
}

/** Carga los lotes iniciales de prueba una sola vez. */
async function ensureLotes(): Promise<void> {
    if (built) return
    const products = await obtenerProductosService()
    const proveedores = await getProveedoresService()

    const resolverProveedor = (proveedorId?: number) => {
        if (proveedorId === undefined) return undefined
        const proveedor = proveedores.find((p) => p.id === proveedorId)
        return proveedor ? { id: proveedor.id, name: proveedor.name } : undefined
    }

    const pushLote = (data: {
        productId: number
        origen: OrigenLote
        cantidad: number
        costoUnitarioSoles: number
        proveedorId?: number
        fechaIngreso: string
    }) => {
        loteNextId += 1
        loteCodeCounter += 1
        MOCK_LOTES.push({
            id: loteNextId,
            productId: data.productId,
            codigo: `LOTE-${String(loteCodeCounter).padStart(4, "0")}`,
            origen: data.origen,
            cantidadInicial: round2(data.cantidad),
            cantidadDisponible: round2(data.cantidad),
            costoUnitarioSoles: round2(data.costoUnitarioSoles),
            proveedor: resolverProveedor(data.proveedorId),
            responsable: "Sistema",
            fechaIngreso: data.fechaIngreso,
        })
    }

    for (const apertura of APERTURAS_INICIALES) {
        const product = products.find((p) => p.id === apertura.productId)
        if (!product) continue
        pushLote({
            productId: product.id,
            origen: "apertura",
            cantidad: apertura.cantidad,
            costoUnitarioSoles: apertura.costoUnitarioSoles,
            proveedorId: apertura.proveedorId,
            fechaIngreso: apertura.fechaIngreso ?? product.createdAt,
        })
    }

    for (const entrada of ENTRADAS_INICIALES) {
        const product = products.find((p) => p.id === entrada.productId)
        if (!product) continue
        pushLote({
            productId: product.id,
            origen: "compra",
            cantidad: entrada.cantidad,
            costoUnitarioSoles: entrada.costoUnitarioSoles,
            proveedorId: entrada.proveedorId,
            fechaIngreso: entrada.fechaIngreso,
        })
    }

    built = true
}

// ===== Service =====

/** Obtiene la lista de todos los lotes ordenados del más reciente al más antiguo. */
export async function getLotesService(
    filtros?: LotesFilters
): Promise<Lote[]> {
    await delay()
    await ensureLotes()

    let lotes = [...MOCK_LOTES]
    if (filtros?.productId !== undefined) {
        lotes = lotes.filter((lote) => lote.productId === filtros.productId)
    }
    if (filtros?.origen !== undefined) {
        lotes = lotes.filter((lote) => lote.origen === filtros.origen)
    }

    return lotes.sort(
        (a, b) =>
            new Date(b.fechaIngreso).getTime() -
            new Date(a.fechaIngreso).getTime()
    )
}

/** Obtiene los lotes de un producto en orden de consumo FIFO (más antiguos primero). */
export async function getLotesPorProductoService(
    productId: number
): Promise<Lote[]> {
    const lotes = await getLotesService({ productId })
    return lotes.sort(
        (a, b) =>
            new Date(a.fechaIngreso).getTime() -
            new Date(b.fechaIngreso).getTime() || a.id - b.id
    )
}

/** Registra un nuevo lote de producto en el sistema. */
export async function ingresarLoteService(data: LoteRequest): Promise<Lote> {
    await delay()
    await ensureLotes()

    const cantidad = validarCantidadPositiva(data.cantidad)

    const esInterno = data.origen === "entrada"
    if (!esInterno && data.costoUnitarioSoles !== undefined) {
        validarCostoNoNegativo(data.costoUnitarioSoles)
    }

    const costoUnitarioSoles = esInterno
        ? await costoPromedioActual(data.productId)
        : round2(data.costoUnitarioSoles ?? (await costoPromedioActual(data.productId)))

    loteNextId += 1
    loteCodeCounter += 1
    const lote: Lote = {
        id: loteNextId,
        productId: data.productId,
        codigo: data.codigo ?? `LOTE-${String(loteCodeCounter).padStart(4, "0")}`,
        origen: data.origen,
        cantidadInicial: cantidad,
        cantidadDisponible: cantidad,
        costoUnitarioSoles,
        proveedor: data.proveedor,
        responsable: data.responsable,
        fechaIngreso: data.fechaIngreso ?? new Date().toISOString(),
    }

    MOCK_LOTES = [...MOCK_LOTES, lote]
    await syncProductStock(data.productId)
    return lote
}

/** Consume stock de los lotes usando la estrategia FIFO. */
export async function consumirLotesService(
    productId: number,
    cantidad: number
): Promise<ConsumoDetalle[]> {
    await delay()
    await ensureLotes()

    const cantidadValidada = validarCantidadPositiva(cantidad)

    const disponibles = filtrarLotesConStock(MOCK_LOTES, productId)
    const disponibleTotal = sumDisponible(disponibles)
    if (disponibleTotal < cantidadValidada) {
        throw new Error(
            `Stock insuficiente: hay ${disponibleTotal} y se requieren ${cantidad}`
        )
    }

    const detalle = asignarConsumoFIFO(disponibles, cantidadValidada)

    for (const linea of detalle) {
        const index = MOCK_LOTES.findIndex((lote) => lote.id === linea.loteId)
        MOCK_LOTES[index] = {
            ...MOCK_LOTES[index],
            cantidadDisponible: round2(
                MOCK_LOTES[index].cantidadDisponible - linea.cantidad
            ),
        }
    }

    await syncProductStock(productId)
    return detalle
}