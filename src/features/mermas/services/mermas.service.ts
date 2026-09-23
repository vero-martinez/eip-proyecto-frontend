/**
 * Servicio de Mermas con datos mock persistidos en localStorage.
 */

import type { Merma } from "../types"
import { getProductByIdService } from "@/features/products/services/products.service"
import { consumirLotesService } from "@/features/inventario/services/lotes.service"
import { costoConsumoTotal, round2 } from "@/features/inventario/utils"
import { appendMovimiento } from "@/features/inventario/services/ledger.service"
import { createLocalStore } from "@/lib/persistence"

// ===== Seeds / Datos Iniciales =====

/**
 * Genera una fecha ISO relativa a los días transcurridos desde hoy.
 */
function daysAgo(days: number, hour = 11): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(hour, 0, 0, 0)
    return date.toISOString()
}

function seedMermas(): Merma[] {
    return [
        {
            id: 1,
            productId: 5,
            quantity: 1,
            motivo: "Rotura o daño durante pulido",
            responsable: "Taller Mock",
            createdAt: daysAgo(1),
        },
        {
            id: 2,
            productId: 7,
            quantity: 1,
            motivo: "Defecto de calidad",
            responsable: "Carlos Ríos",
            createdAt: daysAgo(3),
        },
        {
            id: 3,
            productId: 4,
            quantity: 2,
            motivo: "Pérdida o extravío",
            responsable: "María Gómez",
            detalle: "No se encontró en el conteo físico del almacén.",
            createdAt: daysAgo(6),
        },
        {
            id: 4,
            productId: 2,
            quantity: 2.5,
            motivo: "Rotura o daño durante pulido",
            responsable: "Taller Mock",
            createdAt: daysAgo(10),
        },
        {
            id: 5,
            productId: 6,
            quantity: 1,
            motivo: "Error de producción",
            responsable: "Carlos Ríos",
            createdAt: daysAgo(14),
        },
        {
            id: 6,
            productId: 1,
            quantity: 3,
            motivo: "Defecto de calidad",
            responsable: "María Gómez",
            detalle: "Piezas manchadas por humedad.",
            createdAt: daysAgo(22),
        },
        {
            id: 7,
            productId: 3,
            quantity: 5.5,
            motivo: "Defecto de calidad",
            responsable: "Taller Mock",
            createdAt: daysAgo(35),
        },
        {
            id: 8,
            productId: 7,
            quantity: 2,
            motivo: "Pérdida o extravío",
            responsable: "Carlos Ríos",
            createdAt: daysAgo(50),
        },
    ]
}

// ===== Declaración del Store =====

const mermasStore = createLocalStore<Merma[]>("mermas", seedMermas)

// Simula la latencia de red.
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Service =====

/**
 * Obtiene las mermas ordenadas de la más reciente a la más antigua desde localStorage.
 */
export async function getMermasService(): Promise<Merma[]> {
    await delay()
    const currentMermas = mermasStore.get()
    return [...currentMermas].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

/**
 * Registra una nueva merma: consume la cantidad del stock del producto
 * a través del motor de lotes (FIFO), persiste el cambio en localStorage y
 * deja el COGS real en el ledger.
 */
export async function registerMermaService(data: {
    productId: number
    quantity: number
    motivo: string
    detalle?: string
    responsable: string
}): Promise<Merma> {
    await delay()

    // Consume el stock del motor de lotes (FIFO); si el producto no
    // alcanza, se lanza "Stock insuficiente" y la merma no se registra.
    const detalleLotes = await consumirLotesService(data.productId, data.quantity)
    const costoUnitarioFifo = round2(costoConsumoTotal(detalleLotes) / data.quantity)

    const currentMermas = mermasStore.get()
    const maxId = currentMermas.length > 0 ? Math.max(...currentMermas.map((m) => m.id)) : 0

    const newMerma: Merma = {
        id: maxId + 1,
        productId: data.productId,
        quantity: data.quantity,
        motivo: data.motivo,
        detalle: data.detalle,
        responsable: data.responsable,
        createdAt: new Date().toISOString(),
    }

    mermasStore.set([newMerma, ...currentMermas])

    // Escribe la fila en el ledger de inventario.
    const product = await getProductByIdService(data.productId).catch(() => null)
    await appendMovimiento({
        productId: data.productId,
        responsable: data.responsable,
        movementType: "merma",
        quantity: -data.quantity,
        reason: data.detalle,
        wasteType: data.motivo,
        unitSoldPrice: product?.salePrice,
        unitCostPrice: costoUnitarioFifo,
    })

    return newMerma
}