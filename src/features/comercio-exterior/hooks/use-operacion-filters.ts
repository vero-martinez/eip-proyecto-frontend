/**
 * Hook personalizado para filtrar, ordenar y paginar operaciones de Comercio Exterior.
 */

import { useMemo, useState } from "react"

import type { OperacionComercioExterior, TipoOperacion } from "../types"

// --- CONSTANTES ---

const PAGE_SIZE = 10

export type OperacionSortOption = "recent" | "oldest"

export const OPERACION_SORT_ITEMS: {
    value: OperacionSortOption
    label: string
}[] = [
    { value: "recent", label: "Más recientes" },
    { value: "oldest", label: "Más antiguas" },
]

// --- HOOK PRINCIPAL ---

// Administra el estado de filtros, ordenación y la paginación derivada
export function useOperacionFilters(
    operaciones: OperacionComercioExterior[]
) {
    // Estado base de filtros y paginación
    const [search, setSearchState] = useState("")
    const [tipo, setTipoState] = useState<TipoOperacion | "all">("all")
    const [socioComercial, setSocioComercialState] = useState("all")
    const [desde, setDesdeState] = useState("")
    const [hasta, setHastaState] = useState("")
    const [sort, setSortState] = useState<OperacionSortOption>(
        OPERACION_SORT_ITEMS[0].value
    )
    const [page, setPage] = useState(0)

    // Setters que reinician la página a la primera posición
    const setSearch = (value: string) => {
        setSearchState(value)
        setPage(0)
    }

    const setTipo = (value: TipoOperacion | "all") => {
        setTipoState(value)
        setPage(0)
    }

    const setSocioComercial = (value: string) => {
        setSocioComercialState(value)
        setPage(0)
    }

    const setDesde = (value: string) => {
        setDesdeState(value)
        setPage(0)
    }

    const setHasta = (value: string) => {
        setHastaState(value)
        setPage(0)
    }

    const setSort = (value: OperacionSortOption) => {
        setSortState(value)
        setPage(0)
    }

    // Lista única y ordenada de socios comerciales para selectores de filtro
    const sociosComerciales = useMemo(() => {
        const nombres = new Set<string>()
        for (const operacion of operaciones) {
            nombres.add(operacion.socioComercial.nombre)
        }
        return [...nombres]
            .sort((a, b) => a.localeCompare(b))
            .map((nombre) => ({ value: nombre, label: nombre }))
    }, [operaciones])

    // Filtrado y ordenamiento en memoria de las operaciones
    const filteredOperaciones = useMemo(() => {
        let result = operaciones

        // Filtro por texto libre (folio, nombre o país)
        const term = search.trim().toLowerCase()
        if (term) {
            result = result.filter(
                (op) =>
                    op.folio.toLowerCase().includes(term) ||
                    op.socioComercial.nombre.toLowerCase().includes(term) ||
                    op.socioComercial.pais.toLowerCase().includes(term)
            )
        }

        // Filtro por tipo de operación
        if (tipo !== "all") {
            result = result.filter((op) => op.tipo === tipo)
        }

        // Filtro por socio comercial
        if (socioComercial !== "all") {
            result = result.filter(
                (op) => op.socioComercial.nombre === socioComercial
            )
        }

        // Filtros por rango de fechas
        if (desde) {
            result = result.filter((op) => op.fecha >= desde)
        }

        if (hasta) {
            result = result.filter((op) => op.fecha <= hasta)
        }

        // Ordenamiento por fecha e ID
        return [...result].sort((a, b) => {
            if (a.fecha !== b.fecha) {
                const diff =
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                return sort === "recent" ? diff : -diff
            }
            return sort === "recent" ? b.id - a.id : a.id - b.id
        })
    }, [operaciones, search, tipo, socioComercial, desde, hasta, sort])

    // Cálculos de paginación y rangos de visualización
    const totalCount = filteredOperaciones.length
    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    const safePage = Math.min(page, pageCount - 1)
    const pageItems = filteredOperaciones.slice(
        safePage * PAGE_SIZE,
        (safePage + 1) * PAGE_SIZE
    )
    const rangeStart = totalCount === 0 ? 0 : safePage * PAGE_SIZE + 1
    const rangeEnd = Math.min(totalCount, (safePage + 1) * PAGE_SIZE)

    // Indicador de filtros activos
    const hasActiveFilters =
        search.trim() !== "" ||
        tipo !== "all" ||
        socioComercial !== "all" ||
        Boolean(desde || hasta) ||
        sort !== OPERACION_SORT_ITEMS[0].value

    // Restablece todos los filtros a sus valores iniciales
    const clearFilters = () => {
        setSearchState("")
        setTipoState("all")
        setSocioComercialState("all")
        setDesdeState("")
        setHastaState("")
        setSortState(OPERACION_SORT_ITEMS[0].value)
        setPage(0)
    }

    return {
        search,
        setSearch,
        tipo,
        setTipo,
        socioComercial,
        setSocioComercial,
        sociosComerciales,
        desde,
        setDesde,
        hasta,
        setHasta,
        sort,
        setSort,
        pageItems,
        totalCount,
        page: safePage,
        pageCount,
        rangeStart,
        rangeEnd,
        hasActiveFilters,
        clearFilters,
        goToPage: (target: number) =>
            setPage(Math.min(Math.max(target, 0), pageCount - 1)),
    }
}