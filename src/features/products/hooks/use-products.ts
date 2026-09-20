/**
 * Hook para listar todos los productos.
 * Usa useQuery: TanStack Query maneja el loading, error y cache
 * automáticamente.
 */

import { useQuery } from "@tanstack/react-query"
import { getProductsService } from "../services/products.service"

export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: getProductsService,
    })
}