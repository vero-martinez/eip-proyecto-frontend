/**
 * Hook que reúne las listas crudas que alimentan los reportes.
 *
 * Reutiliza los hooks que ya consumen el resto de módulos, así que los
 * reportes salen de la misma caché que Ventas, Movimientos, Comercio Exterior
 * y Productos: no hay peticiones duplicadas y el reporte refleja lo mismo
 * que ve el usuario en esas pantallas.
 */

import { useMemo } from "react"

import { useOperaciones } from "@/features/comercio-exterior/hooks/use-operaciones"
import { useMovimientos } from "@/features/movimientos/hooks/use-movimientos"
import { useCategories } from "@/features/products/hooks/use-categories"
import { useProducts } from "@/features/products/hooks/use-products"
import { useVentas } from "@/features/ventas/hooks/use-ventas"

import type { DatosReportes } from "../types"

export function useReportesDatos() {
    const ventas = useVentas()
    const movimientos = useMovimientos()
    const operaciones = useOperaciones()
    const productos = useProducts()
    const categorias = useCategories()

    const consultas = [ventas, movimientos, operaciones, productos, categorias]

    const datos = useMemo<DatosReportes>(
        () => ({
            ventas: ventas.data ?? [],
            movimientos: movimientos.data ?? [],
            operaciones: operaciones.data ?? [],
            productos: productos.data ?? [],
            categorias: categorias.data ?? [],
        }),
        [
            ventas.data,
            movimientos.data,
            operaciones.data,
            productos.data,
            categorias.data,
        ]
    )

    return {
        datos,
        isFetching: consultas.some((consulta) => consulta.isFetching),
        isError: consultas.some((consulta) => consulta.isError),
        refetch: () => {
            for (const consulta of consultas) void consulta.refetch()
        },
    }
}
