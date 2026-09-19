/**
 * Tipos para el módulo de Mermas (ajustes por descarte/pérdida de stock).
 */

/**
 * Registro de descarte/ajuste negativo de producto al inventario del taller.
 */
export interface Merma {
    id: number
    productId: number
    quantity: number
    /** Motivo del descarte (proviene de la lista predefinida). */
    motivo: string
    /** Detalle adicional opcional del ajuste. */
    detalle?: string
    /** Nombre de la persona que realizó el ajuste. */
    responsable: string
    createdAt: string
}