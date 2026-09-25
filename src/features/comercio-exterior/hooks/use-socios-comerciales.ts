/**
 * Hook para listar los socios comerciales internacionales (catálogo del
 * formulario de operaciones).
 */

import { useQuery } from "@tanstack/react-query"

import { getSociosComercialesService } from "../services/comercio-exterior.service"

export function useSociosComerciales() {
    return useQuery({
        queryKey: ["socios-comerciales"],
        queryFn: getSociosComercialesService,
    })
}