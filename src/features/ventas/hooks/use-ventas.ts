/**
 * Hook para listar las ventas registradas.
 *
 * Devuelve el historial completo; cada página decide qué parte muestra:
 * "Mis ventas" lo acota al responsable del usuario logueado y la vista
 * de admin lo muestra entero con filtro por responsable.
 *
 * Usa la query "ventas" que invalida useRegisterVenta al confirmar una
 * venta en el Punto de Venta, así el historial se refresca solo.
 */

import { useQuery } from "@tanstack/react-query"
import { getVentasService } from "@/features/ventas/services/ventas.service"

export function useVentas() {
    return useQuery({
        queryKey: ["ventas"],
        queryFn: getVentasService,
    })
}
