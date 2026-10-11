/**
 * Hook para actualizar un producto existente.
 * Invalida "products" al tener éxito, igual que en create.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    updateProductService,
    type ProductUpdateData,
} from "../services/products.service"

interface UpdateProductParams {
    id: number
    data: ProductUpdateData
}

export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: UpdateProductParams) =>
            updateProductService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}