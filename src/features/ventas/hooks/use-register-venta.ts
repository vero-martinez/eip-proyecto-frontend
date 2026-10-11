/**
 * Hook para registrar una venta del punto de venta.
 * Al tener éxito, invalida las queries "ventas" y "products" para que
 * el historial y el inventario (stock) reflejen la venta sin recargar.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerVentaService } from "../services/ventas.service"

export function useRegisterVenta() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: registerVentaService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ventas"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["movimientos"] })
            queryClient.invalidateQueries({ queryKey: ["lotes"] })
        },
    })
}