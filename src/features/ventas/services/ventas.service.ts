/**
 * Servicio de Ventas con datos mock.
 * Simula el registro de ventas del punto de venta hasta tener el
 * backend real (FastAPI). Al registrar, descuenta el stock de cada
 * producto vendido a través del motor de lotes (FIFO) y deja el COGS
 * real en el ledger, compartiendo el inventario con el catálogo y los
 * módulos del taller.
 */

import type { Venta, VentaItem } from "../types"
import { computeTotals } from "../utils"
import { consumirLotesService } from "@/features/inventario/services/lotes.service"
import { costoConsumoTotal, round2 } from "@/features/inventario/utils"
import { appendMovimiento } from "@/features/inventario/services/ledger.service"

// --- Helpers & Mock Data ---

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

let mockId = 0

function daysAgo(days: number, hour = 16): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function createVenta(
  items: VentaItem[],
  tipoVenta: string,
  metodoPago: string,
  responsable: string,
  days: number,
  opts: { pagoCon?: number; vuelto?: number; hour?: number } = {}
): Venta {
  mockId += 1
  const { subtotal, total } = computeTotals(items)
  return {
    id: mockId,
    folio: `BLT-${String(mockId).padStart(4, "0")}`,
    items,
    tipoVenta,
    metodoPago,
    subtotal,
    total,
    pagoCon: opts.pagoCon,
    vuelto: opts.vuelto,
    responsable,
    createdAt: daysAgo(days, opts.hour ?? 16),
  }
}

const MOCK_VENTAS: Venta[] = [
  createVenta(
    [
      { productId: 4, name: "Amatista pulida S", sku: "EIP-0001", unitType: "UNIDAD", unitPrice: 60, quantity: 2 },
      { productId: 6, name: "Anillo citrino plata", sku: "EIP-0007", unitType: "UNIDAD", unitPrice: 70, quantity: 1 },
    ],
    "tienda",
    "billetera-digital",
    "Vendedor Mock",
    1
  ),
  createVenta(
    [{ productId: 1, name: "Pulsera Amatista 8mm", sku: "PUL-AMAT-8MM", unitType: "UNIDAD", unitPrice: 25, quantity: 4 }],
    "feria",
    "efectivo",
    "Vendedor Mock",
    3
  ),
  createVenta(
    [{ productId: 2, name: "Pirita Metálica en Bruto", sku: "PIR-BRUTO-KG", unitType: "KILOGRAMO", unitPrice: 45, quantity: 1.5 }],
    "digital",
    "efectivo",
    "Admin Mock",
    6
  ),
  createVenta(
    [
      { productId: 1, name: "Pulsera Amatista 8mm", sku: "PUL-AMAT-8MM", unitType: "UNIDAD", unitPrice: 25, quantity: 3 },
      { productId: 6, name: "Anillo citrino plata", sku: "EIP-0007", unitType: "UNIDAD", unitPrice: 70, quantity: 1 },
    ],
    "tienda",
    "efectivo",
    "Vendedor Mock",
    0,
    { hour: 11, pagoCon: 150, vuelto: 5 }
  ),
]

// --- Service Methods ---

export async function getVentasService(): Promise<Venta[]> {
  await delay()
  return [...MOCK_VENTAS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function registerVentaService(data: {
  items: VentaItem[]
  tipoVenta: string
  metodoPago: string
  responsable: string
  pagoCon?: number
  vuelto?: number
}): Promise<Venta> {
  await delay()

  // Consume el stock del motor de lotes (FIFO) antes de registrar la
  // venta: si algún item no alcanza, se lanza "Stock insuficiente" y
  // la venta no se registra parcialmente.
  const costosUnitarios: number[] = []
  for (const item of data.items) {
    const detalle = await consumirLotesService(item.productId, item.quantity)
    costosUnitarios.push(round2(costoConsumoTotal(detalle) / item.quantity))
  }

  const { subtotal, total } = computeTotals(data.items)
  mockId += 1

  const newVenta: Venta = {
    id: mockId,
    folio: `BLT-${String(mockId).padStart(4, "0")}`,
    subtotal,
    total,
    createdAt: new Date().toISOString(),
    ...data,
  }

  MOCK_VENTAS.push(newVenta)

  // Escribe una fila por item en el ledger (inventario), agrupadas por
  // el id de la venta (sale_group_id), como hará el backend.
  for (let index = 0; index < data.items.length; index++) {
    const item = data.items[index]
    await appendMovimiento({
      productId: item.productId,
      responsable: data.responsable,
      movementType: "venta",
      quantity: -item.quantity,
      unitSoldPrice: item.unitPrice,
      unitCostPrice: costosUnitarios[index],
      saleGroupId: newVenta.id,
    })
  }

  return newVenta
}