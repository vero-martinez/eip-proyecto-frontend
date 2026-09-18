/**
 * Hook para registrar una entrada de stock.
 * Al tener éxito, invalida las queries "stock-entries" y "products"
 * para que tanto la lista de entradas como el inventario (stat cards
 * y catálogo) reflejen la nueva entrada sin recargar la página.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerStockEntryService } from "../services/entradas.service"

export function useRegisterStockEntry() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: registerStockEntryService,
        onSuccess: () => {
            // El registro suma stock al producto: refrescar ambos dominios.
            queryClient.invalidateQueries({ queryKey: ["stock-entries"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}