/**
 * Hook para listar las operaciones de comercio exterior registradas.
 */

import { useQuery } from "@tanstack/react-query"

import { getOperacionesService } from "../services/comercio-exterior.service"

export function useOperaciones() {
    return useQuery({
        queryKey: ["comercio-exterior"],
        queryFn: getOperacionesService,
    })
}