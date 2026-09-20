/**
 * Hook para crear un producto.
 * Al tener éxito, invalida la query "products" para que la lista
 * se vuelva a pedir automáticamente y refleje el nuevo producto,
 * sin tener que recargar la página a mano.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProductService } from "../services/products.service"

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProductService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}