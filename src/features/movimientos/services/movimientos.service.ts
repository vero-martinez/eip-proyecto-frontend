/**
 * Servicio mock para la gestión unificada de movimientos de inventario.
 */

import {
    getProveedoresService,
    getStockEntriesService,
} from "@/features/entradas/services/entradas.service"
import { getMermasService } from "@/features/mermas/services/mermas.service"
import { getProductsService } from "@/features/products/services/products.service"
import { getVentasService } from "@/features/ventas/services/ventas.service"
import { getTipoVentaLabel } from "@/features/ventas/utils"

import type { Venta } from "@/features/ventas/types"
import type { Product } from "@/types/products"
import type { InventoryMovement, MovementRecord } from "../types"

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

let built = false
let MOCK_MOVEMENTS: MovementRecord[] | null = null
let movementId = 0

async function ensureBuilt(
    products: Product[],
    ventas: Venta[]
): Promise<MovementRecord[]> {
    if (built && MOCK_MOVEMENTS) return MOCK_MOVEMENTS

    const [entries, mermas, proveedores] = await Promise.all([
        getStockEntriesService(),
        getMermasService(),
        getProveedoresService(),
    ])

    const proveedorById = new Map(
        proveedores.map((proveedor) => [proveedor.id, proveedor.name])
    )
    const costById = new Map(
        products.map((product) => [product.id, product.costPrice])
    )
    const salePriceById = new Map(
        products.map((product) => [product.id, product.salePrice])
    )

    MOCK_MOVEMENTS = [
        ...entries.map((entry): MovementRecord => {
            movementId += 1
            return {
                id: movementId,
                productId: entry.productId,
                responsable: entry.responsable ?? "Sin asignar",
                movementType: "entrada",
                quantity: entry.quantity,
                unitSoldPrice: salePriceById.get(entry.productId),
                unitCostPrice: costById.get(entry.productId),
                proveedor: entry.proveedorId
                    ? proveedorById.get(entry.proveedorId)
                    : undefined,
                createdAt: entry.createdAt,
            }
        }),
        ...mermas.map((merma): MovementRecord => {
            movementId += 1
            return {
                id: movementId,
                productId: merma.productId,
                responsable: merma.responsable,
                movementType: "merma",
                quantity: -merma.quantity,
                reason: merma.detalle,
                unitSoldPrice: salePriceById.get(merma.productId),
                unitCostPrice: costById.get(merma.productId),
                wasteType: merma.motivo,
                createdAt: merma.createdAt,
            }
        }),
        ...ventas.flatMap((venta): MovementRecord[] =>
            venta.items.map((item) => {
                movementId += 1
                return {
                    id: movementId,
                    productId: item.productId,
                    responsable: venta.responsable,
                    movementType: "venta",
                    quantity: -item.quantity,
                    unitSoldPrice: item.unitPrice,
                    unitCostPrice: costById.get(item.productId),
                    saleGroupId: venta.id,
                    createdAt: venta.createdAt,
                }
            })
        ),
    ]

    built = true
    return MOCK_MOVEMENTS
}

/** Agrega un nuevo registro al ledger en memoria. */
export async function appendMovimiento(
    data: Omit<MovementRecord, "id" | "createdAt"> & { createdAt?: string }
): Promise<MovementRecord> {
    const record: MovementRecord = {
        id: movementId + 1,
        createdAt: new Date().toISOString(),
        ...data,
    }
    if (!built || !MOCK_MOVEMENTS) return record

    movementId += 1
    MOCK_MOVEMENTS.unshift(record)
    return record
}

/** Obtiene la lista completa de movimientos enriquecidos con datos de productos y ventas. */
export async function getMovimientosService(): Promise<InventoryMovement[]> {
    await delay()

    const [products, ventas] = await Promise.all([
        getProductsService(),
        getVentasService(),
    ])
    const records = await ensureBuilt(products, ventas)

    const productById = new Map(products.map((product) => [product.id, product]))
    const ventaById = new Map(ventas.map((venta) => [venta.id, venta]))

    return [...records]
        .map((record) => {
            const product = productById.get(record.productId)
            const venta = record.saleGroupId
                ? ventaById.get(record.saleGroupId)
                : undefined
            return {
                ...record,
                productName: product?.name ?? "Producto no disponible",
                sku: product?.sku ?? "—",
                unitType: product?.unitType ?? "UNIDAD",
                tipoVenta: venta
                    ? getTipoVentaLabel(venta.tipoVenta)
                    : undefined,
                folio: venta?.folio,
            }
        })
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
}