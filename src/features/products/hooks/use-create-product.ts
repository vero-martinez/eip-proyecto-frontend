/**
 * Hook personalizado para la creación de un nuevo producto.
 * El alta es mínima: solo cataloga el producto (sin stock, sin precio,
 * nace inactivo). El stock y el costo llegan después vía Compras.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProductService } from "../services/products.service"
import type { Product } from "@/types/products"

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (producto: Omit<Product, "id" | "createdAt">) =>
            createProductService(producto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["alertas"] })
        },
    })
}