/**
 * Ledger de Inventario.
 * Registra y consulta el historial de movimientos de stock en localStorage.
 */

import { createLocalStore } from "@/lib/persistence"
import type { MovementRecord } from "../types"

/** Simula latencia de red. */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const movimientosStore = createLocalStore<MovementRecord[]>(
    "movimientos-ledger",
    () => []
)

/** Agrega un nuevo registro de movimiento al ledger. */
export async function appendMovimiento(
    data: Omit<MovementRecord, "id" | "createdAt"> & { createdAt?: string }
): Promise<MovementRecord> {
    const current = movimientosStore.get()
    const record: MovementRecord = {
        id: Math.max(0, ...current.map((mov) => mov.id)) + 1,
        createdAt: new Date().toISOString(),
        ...data,
    }
    try {
        movimientosStore.set([record, ...current])
        return record
    } finally {
        await delay()
    }
}

/** Siembra el ledger con el historial inicial, solo si aún no tiene datos. */
export async function seedMovimientosLedger(
    records: MovementRecord[]
): Promise<void> {
    try {
        if (records.length === 0) return
        if (movimientosStore.get().length === 0) {
            movimientosStore.set(records)
        }
    } finally {
        await delay()
    }
}

/** Obtiene los movimientos registrados ordenados del más reciente al más antiguo. */
export async function getMovimientosLedgerService(): Promise<MovementRecord[]> {
    await delay()
    return [...movimientosStore.get()].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}