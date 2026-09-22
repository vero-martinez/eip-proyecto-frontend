/**
 * Ledger de Inventario.
 * Registra y consulta el historial de movimientos de stock en memoria.
 */

import type { MovementRecord } from "../types"

/** Simula latencia de red. */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_MOVEMENTS: MovementRecord[] = []
let movementId = 0

/** Agrega un nuevo registro de movimiento al ledger. */
export async function appendMovimiento(
    data: Omit<MovementRecord, "id" | "createdAt"> & { createdAt?: string }
): Promise<MovementRecord> {
    try {
        const record: MovementRecord = {
            id: movementId + 1,
            createdAt: new Date().toISOString(),
            ...data,
        }
        movementId += 1
        MOCK_MOVEMENTS.unshift(record)
        return record
    } finally {
        await delay()
    }
}

/** Obtiene los movimientos registrados ordenados del más reciente al más antiguo. */
export async function getMovimientosLedgerService(): Promise<MovementRecord[]> {
    await delay()
    return [...MOCK_MOVEMENTS].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}