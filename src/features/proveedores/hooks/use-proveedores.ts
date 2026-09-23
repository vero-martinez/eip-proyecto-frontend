/**
 * Hook para listar los proveedores en el selector de compras.
 */

import { useQuery } from "@tanstack/react-query"
import { getProveedoresService } from "../services/proveedores.service"

export function useProveedores() {
    return useQuery({
        queryKey: ["proveedores"],
        queryFn: () => getProveedoresService(),
    })
}