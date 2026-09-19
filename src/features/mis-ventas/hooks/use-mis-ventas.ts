/**
 * Hook para listar las ventas registradas (todas; el módulo "Mis
 * ventas" filtra por responsable del usuario logueado).
 * Usa la query "ventas" que invalida useRegisterVenta al confirmar
 * una venta en el Punto de Venta, así el historial se refresca solo.
 */

import { useQuery } from "@tanstack/react-query"
import { getVentasService } from "@/features/ventas/services/ventas.service"

export function useMisVentas() {
    return useQuery({
        queryKey: ["ventas"],
        queryFn: getVentasService,
    })
}