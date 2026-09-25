/**
 * Hook para registrar una operación de comercio exterior
 * (importación/exportación). Invalida los dominios de inventario afectados.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { registrarOperacionService } from "../services/comercio-exterior.service"

const DOMINIOS_AFECTADOS = [
    "comercio-exterior",
    "products",
    "lotes",
    "movimientos",
    "alertas",
] as const

export function useRegistrarOperacion() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: registrarOperacionService,
        onSuccess: () => {
            for (const key of DOMINIOS_AFECTADOS) {
                queryClient.invalidateQueries({ queryKey: [key] })
            }
        },
    })
}