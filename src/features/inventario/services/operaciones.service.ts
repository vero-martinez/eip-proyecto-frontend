/**
 * Operaciones de Inventario.
 * Comandos de alto nivel para gestionar ingresos de stock, compras y aperturas iniciales.
 */

import type { Product } from "@/types/products"
import {
    crearProductoService,
    obtenerProductoService,
} from "./adapters"
import { getProveedoresService } from "@/features/proveedores/services/proveedores.service"
import {
    getLotesPorProductoService,
    ingresarLoteService,
} from "./lotes.service"
import { appendMovimiento } from "./ledger.service"
import { appendStockEntryService } from "./entradas.service"
import type { Lote, StockEntry } from "../types"
import type { Proveedor } from "@/features/proveedores/types"
import { validarCantidadPositiva, validarCostoNoNegativo } from "../utils"

// ===== Helpers internos =====

/** Busca un proveedor por su ID y lanza un error si no existe. */
async function resolverProveedor(
    proveedorId: number | undefined
): Promise<Proveedor | undefined> {
    if (proveedorId === undefined) return undefined

    const proveedores = await getProveedoresService()
    const proveedor = proveedores.find((p) => p.id === proveedorId)
    if (!proveedor) throw new Error("Proveedor no encontrado")
    return proveedor
}

/** Verifica si un producto ya tiene al menos un lote de stock. */
async function tieneLotes(productId: number): Promise<boolean> {
    const lotes = await getLotesPorProductoService(productId)
    return lotes.length > 0
}

/** Registra el movimiento de tipo entrada en el ledger. */
async function appenderMovimiento(data: {
    productId: number
    responsable: string
    quantity: number
    reason?: string
    unitSoldPrice?: number
    unitCostPrice: number
    proveedor?: string
}): Promise<void> {
    await appendMovimiento({
        productId: data.productId,
        responsable: data.responsable,
        movementType: "entrada",
        quantity: data.quantity,
        reason: data.reason,
        unitSoldPrice: data.unitSoldPrice,
        unitCostPrice: data.unitCostPrice,
        proveedor: data.proveedor,
    })
}

interface RegistrarIngresarDatos {
    productId: number
    quantity: number
    origen: Lote["origen"]
    responsable: string
    costoUnitarioSoles?: number
    proveedor?: Proveedor | Lote["proveedor"]
    notas?: string
}

/** Procesa el ingreso creando el lote, actualizando el historial y registrando el movimiento. */
async function registrarIngreso(
    data: RegistrarIngresarDatos
): Promise<StockEntry> {
    const product = await obtenerProductoService(data.productId)
    const lote = await ingresarLoteService({
        productId: data.productId,
        cantidad: data.quantity,
        origen: data.origen,
        responsable: data.responsable,
        costoUnitarioSoles: data.costoUnitarioSoles,
        proveedor: data.proveedor,
    })

    const entry = await appendStockEntryService({
        productId: data.productId,
        quantity: data.quantity,
        proveedorId: data.proveedor?.id,
        responsable: data.responsable,
        notas: data.notas,
    })

    await appenderMovimiento({
        productId: data.productId,
        responsable: data.responsable,
        quantity: data.quantity,
        reason: data.notas ?? "Registro de inventario",
        unitSoldPrice: product.salePrice,
        unitCostPrice: lote.costoUnitarioSoles,
        proveedor: data.proveedor?.name,
    })

    return entry
}

// ===== Service =====

/** Registra ingresos por fabricación o taller interno sin alterar el costo promedio. */
export async function registrarEntradaProduccionService(data: {
    productId: number
    quantity: number
    responsable: string
    notas?: string
}): Promise<StockEntry> {
    return registrarIngreso({
        productId: data.productId,
        quantity: validarCantidadPositiva(data.quantity),
        origen: "entrada",
        responsable: data.responsable,
        notas: data.notas ?? "Producción del taller",
    })
}

/** Registra compras a proveedores y recalcula el costo promedio del producto. */
export async function registrarCompraService(data: {
    productId: number
    quantity: number
    proveedorId?: number
    costoUnitarioSoles?: number
    responsable: string
    notas?: string
}): Promise<StockEntry> {
    const quantity = validarCantidadPositiva(data.quantity)
    const costoUnitarioSoles =
        data.costoUnitarioSoles !== undefined
            ? validarCostoNoNegativo(data.costoUnitarioSoles)
            : undefined

    const proveedor = await resolverProveedor(data.proveedorId)

    if (
        data.costoUnitarioSoles === undefined &&
        !(await tieneLotes(data.productId))
    ) {
        throw new Error(
            "El costo de compra es obligatorio cuando el producto aún no tiene stock"
        )
    }

    return registrarIngreso({
        productId: data.productId,
        quantity: quantity,
        origen: "compra",
        responsable: data.responsable,
        costoUnitarioSoles,
        proveedor,
        notas: data.notas ?? "Compra a proveedor",
    })
}

/** Registra el stock inicial por primera vez para un producto existente. */
export async function registrarAperturaService(data: {
    productId: number
    cantidad: number
    costoUnitarioSoles: number
    proveedorId?: number
    responsable?: string
}): Promise<Lote> {
    const cantidad = validarCantidadPositiva(data.cantidad)
    if (await tieneLotes(data.productId)) {
        throw new Error(
            "El producto ya tiene stock registrado; usá Compra para sumar inventario"
        )
    }
    const proveedor = await resolverProveedor(data.proveedorId)

    await registrarIngreso({
        productId: data.productId,
        quantity: cantidad,
        origen: "apertura",
        responsable: data.responsable ?? "Administrador",
        costoUnitarioSoles: validarCostoNoNegativo(data.costoUnitarioSoles),
        proveedor,
        notas: "Apertura inicial",
    })

    const [lote] = await getLotesPorProductoService(data.productId)
    return lote
}

/** Crea un producto nuevo y genera su lote de apertura inicial si incluye stock. */
export async function registrarProductoConAperturaService(data: {
    producto: Omit<Product, "id" | "createdAt">
    responsable?: string
}): Promise<{ product: Product; lote: Lote | null }> {
    const product = await crearProductoService(data.producto)

    if (product.currentStock > 0) {
        const lote = await registrarAperturaService({
            productId: product.id,
            cantidad: product.currentStock,
            costoUnitarioSoles: product.costPrice,
            proveedorId: data.producto.proveedorId,
            responsable: data.responsable,
        })
        return { product, lote }
    }

    return { product, lote: null }
}