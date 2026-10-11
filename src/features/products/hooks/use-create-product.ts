/**
 * Hook personalizado para la creación de un nuevo producto.
 * El alta es mínima: solo cataloga el producto (sin stock, sin precio,
 * nace inactivo). El stock y el costo llegan después vía Compras.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    createProductService,
    type ProductCreateData,
} from "../services/products.service"

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (producto: ProductCreateData) =>
            createProductService(producto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["alertas"] })
        },
    })
}