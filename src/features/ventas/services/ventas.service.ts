/**
 * Servicio de Ventas con datos mock.
 * Simula el registro de ventas del punto de venta hasta tener el
 * backend real (FastAPI). Al registrar, descuenta el stock de cada
 * producto vendido para compartir el inventario con el catálogo y los
 * módulos del taller.
 */

import type { Venta, VentaItem } from "../types"
import { computeTotals } from "../utils"
import { adjustProductStockService } from "@/features/products/services/products.service"

// ===== Mock data =====

/**
 * Genera una fecha ISO relativa a los días transcurridos desde hoy.
 */
function daysAgo(days: number, hour = 16): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(hour, 0, 0, 0)
    return date.toISOString()
}

let mockId = 0
function venta(
    items: VentaItem[],
    tipoVenta: string,
    metodoPago: string,
    responsable: string,
    days: number
): Venta {
    mockId += 1
    const { subtotal, total } = computeTotals(items)
    return {
        id: mockId,
        items,
        tipoVenta,
        metodoPago,
        subtotal,
        total,
        responsable,
        createdAt: daysAgo(days),
    }
}

const MOCK_VENTAS: Venta[] = [
    venta(
        [
            { productId: 4, name: "Amatista pulida S", sku: "EIP-0001", unitType: "UNIDAD", unitPrice: 60, quantity: 2 },
            { productId: 6, name: "Anillo citrino plata", sku: "EIP-0007", unitType: "UNIDAD", unitPrice: 70, quantity: 1 },
        ],
        "tienda",
        "billetera-digital",
        "Vendedor Mock",
        1
    ),
    venta(
        [
            { productId: 1, name: "Pulsera Amatista 8mm", sku: "PUL-AMAT-8MM", unitType: "UNIDAD", unitPrice: 25, quantity: 4 },
        ],
        "feria",
        "efectivo",
        "Vendedor Mock",
        3
    ),
    venta(
        [
            { productId: 2, name: "Pirita Metálica en Bruto", sku: "PIR-BRUTO-KG", unitType: "KILOGRAMO", unitPrice: 45, quantity: 1.5 },
        ],
        "digital",
        "efectivo",
        "Admin Mock",
        6
    ),
]

// Simula la latencia de red.
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Service =====

/**
 * Obtiene las ventas ordenadas de la más reciente a la más antigua.
 */
export async function getVentasService(): Promise<Venta[]> {
    await delay()
    return [...MOCK_VENTAS].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

/**
 * Registra una venta completa: guarda el snapshot de la venta y descuenta
 * del stock la cantidad vendida de cada producto.
 */
export async function registerVentaService(data: {
    items: VentaItem[]
    tipoVenta: string
    metodoPago: string
    responsable: string
    pagoCon?: number
    vuelto?: number
}): Promise<Venta> {
    await delay()

    const { subtotal, total } = computeTotals(data.items)
    const newVenta: Venta = {
        id: mockId + 1,
        items: data.items,
        tipoVenta: data.tipoVenta,
        metodoPago: data.metodoPago,
        subtotal,
        total,
        pagoCon: data.pagoCon,
        vuelto: data.vuelto,
        responsable: data.responsable,
        createdAt: new Date().toISOString(),
    }
    mockId += 1
    MOCK_VENTAS.push(newVenta)

    // Descuenta stock de cada linea vendida.
    for (const item of data.items) {
        await adjustProductStockService(item.productId, -item.quantity)
    }

    return newVenta
}