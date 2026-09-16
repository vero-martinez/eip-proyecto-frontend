/**
 * Hook para listar las categorías
 */

import { useQuery } from "@tanstack/react-query"
import { getCategoriesService } from "../services/products.service"

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCategoriesService,
    })
}