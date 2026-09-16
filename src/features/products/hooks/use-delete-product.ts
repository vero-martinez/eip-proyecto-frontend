/**
 * Hook para eliminar un producto.
 * Invalida "products" al tener éxito.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteProductService } from "../services/products.service"

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProductService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}