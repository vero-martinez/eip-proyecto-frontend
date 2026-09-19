/**
 * Hook para registrar una merma.
 * Al tener éxito, invalida las queries "mermas" y "products"
 * para que tanto la lista de mermas como el inventario (stat cards
 * y catálogo) reflejen el descarte sin recargar la página.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerMermaService } from "../services/mermas.service"

export function useRegisterMerma() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: registerMermaService,
        onSuccess: () => {
            // El registro descuenta stock del producto: refrescar ambos dominios.
            queryClient.invalidateQueries({ queryKey: ["mermas"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}