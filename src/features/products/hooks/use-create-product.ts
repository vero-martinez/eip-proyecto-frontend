/**
 * Hook personalizado para la creación de un nuevo producto.
 * Gestiona el alta del producto, la apertura de su lote inicial y
 * la invalidación de la caché de las consultas afectadas.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registrarProductoConAperturaService } from "@/features/inventario/services/operaciones.service"

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (
            producto: Parameters<
                typeof registrarProductoConAperturaService
            >[0]["producto"]
        ) =>
            registrarProductoConAperturaService({
                producto,
                responsable: "Administrador",
            }),
        onSuccess: () => {
            for (const key of [
                "products",
                "stock-entries",
                "movimientos",
                "lotes",
                "alertas",
            ] as const) {
                queryClient.invalidateQueries({ queryKey: [key] })
            }
        },
    })
}