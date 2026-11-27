import { useQuery } from "@tanstack/react-query"

import { getComprasService } from "../services/compras.service"

export function useCompras() {
    return useQuery({
        queryKey: ["compras"],
        queryFn: getComprasService,
    })
}
