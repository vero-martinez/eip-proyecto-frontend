/**
 * Hook para listar todos los movimientos del stock (ledger unificado).
 */

import { useQuery } from "@tanstack/react-query"
import { getMovimientosService } from "../services/movimientos.service"

export function useMovimientos() {
    return useQuery({
        queryKey: ["movimientos"],
        queryFn: getMovimientosService,
    })
}