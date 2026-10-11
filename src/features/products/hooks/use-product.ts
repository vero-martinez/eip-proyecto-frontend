/**
 * Hook para obtener el detalle de un producto por id.
 * "enabled: !!id" evita que se dispare la query si todavía
 * no hay un id válido (ej: mientras se abre un modal de edición).
 */

import { useQuery } from "@tanstack/react-query"
import { getProductByIdService } from "../services/products.service"

export function useProduct(id: number | undefined) {
    return useQuery({
        queryKey: ["products", id],
        queryFn: () => getProductByIdService(id!),
        enabled: !!id,
    })
}