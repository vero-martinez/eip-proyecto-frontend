/**
 * Hook para actualizar un producto existente.
 * Invalida "products" al tener éxito, igual que en create.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProductService } from "../services/products.service"
import type { Product } from "@/types/products"

interface UpdateProductParams {
    id: number
    data: Partial<Omit<Product, "id" | "createdAt">>
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