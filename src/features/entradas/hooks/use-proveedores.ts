/**
 * Hook para listar los proveedores disponibles (referencia para el
 * selector del formulario de entradas y las listas).
 */

import { useQuery } from "@tanstack/react-query"
import { getProveedoresService } from "../services/entradas.service"

export function useProveedores() {
    return useQuery({
        queryKey: ["proveedores"],
        queryFn: getProveedoresService,
    })
}