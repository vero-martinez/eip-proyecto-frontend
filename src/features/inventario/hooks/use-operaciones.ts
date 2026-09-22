/**
 * Hooks de Operaciones de Inventario.
 * Mutaciones para registrar entradas de producción, compras y aperturas con invalidación de queries.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    registrarAperturaService,
    registrarCompraService,
    registrarEntradaProduccionService,
} from "../services/operaciones.service"

const DOMINIOS_AFECTADOS = [
    "products",
    "stock-entries",
    "movimientos",
    "lotes",
    "alertas",
] as const

/** Registra una entrada interna de taller e invalida los dominios de inventario afectados. */
export function useRegistrarEntradaProduccion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: registrarEntradaProduccionService,
        onSuccess: () => {
            for (const key of DOMINIOS_AFECTADOS) {
                queryClient.invalidateQueries({ queryKey: [key] })
            }
        },
    })
}

/** Registra una compra a proveedor e invalida los dominios de inventario afectados. */
export function useRegistrarCompra() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: registrarCompraService,
        onSuccess: () => {
            for (const key of DOMINIOS_AFECTADOS) {
                queryClient.invalidateQueries({ queryKey: [key] })
            }
        },
    })
}

/** Registra la apertura de stock inicial e invalida los dominios de inventario afectados. */
export function useRegistrarApertura() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: registrarAperturaService,
        onSuccess: () => {
            for (const key of DOMINIOS_AFECTADOS) {
                queryClient.invalidateQueries({ queryKey: [key] })
            }
        },
    })
}