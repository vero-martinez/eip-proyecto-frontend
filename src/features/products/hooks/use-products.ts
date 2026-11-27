/**
 * Hook para listar todos los productos.
 * Usa useQuery: TanStack Query maneja el loading, error y cache
 * automáticamente.
 */

import { useQuery } from "@tanstack/react-query"
import {
    getProductService,
    getProductsService,
} from "../services/products.service"

export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: getProductsService,
    })
}

export function useProduct(id: number | null, enabled = true) {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => getProductService(id as number),
        enabled: id !== null && enabled,
    })
}