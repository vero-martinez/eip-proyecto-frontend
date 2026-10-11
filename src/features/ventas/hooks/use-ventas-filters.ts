/**
 * Hook para gestionar la búsqueda, el filtrado, el ordenamiento y la
 * paginación del historial de ventas.
 *
 * El responsable se recibe controlado desde la página, no se guarda acá:
 * es el único filtro que también mueve las tarjetas de métricas, que
 * viven fuera del listado.
 */

import { useMemo, useState } from "react"

import { SORT_ITEMS } from "../constants"
import type { SortOption } from "../constants"
import type { Venta } from "../types"
import { isInDateRange } from "../utils"

const PAGE_SIZE = 10

export function useVentasFilters(ventas: Venta[], responsable = "all") {
    const [search, setSearchState] = useState("")
    const [tipo, setTipoState] = useState("all")
    const [desde, setDesdeState] = useState("")
    const [hasta, setHastaState] = useState("")
    const [sort, setSortState] = useState<SortOption>(SORT_ITEMS[0].value)
    const [page, setPage] = useState(0)

    const setSearch = (value: string) => {
        setSearchState(value)
        setPage(0)
    }

    const setTipo = (value: string) => {
        setTipoState(value)
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

    const setSort = (value: SortOption) => {
        setSortState(value)
        setPage(0)
    }

    /**
     * Ventas que pasan todos los filtros, ordenadas según `sort`.
     * El folio es el único código de la venta ("BLT-0001") y ya
     * contiene el id, por eso basta con buscar por él.
     */
    const items = useMemo(() => {
        const term = search.trim().toLowerCase()
        const from = desde || undefined
        const to = hasta || undefined

        const filtered = ventas.filter(
            (venta) =>
                (!term || venta.folio.toLowerCase().includes(term)) &&
                isInDateRange(venta.createdAt, from, to) &&
                (tipo === "all" || venta.tipoVenta === tipo) &&
                (responsable === "all" || venta.responsable === responsable)
        )

        return [...filtered].sort((a, b) => {
            const diff =
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            return sort === "recent" ? diff : -diff
        })
    }, [ventas, search, tipo, responsable, desde, hasta, sort])

    const totalCount = items.length
    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    const safePage = Math.min(page, pageCount - 1)
    const pageItems = items.slice(
        safePage * PAGE_SIZE,
        (safePage + 1) * PAGE_SIZE
    )
    const rangeStart = totalCount === 0 ? 0 : safePage * PAGE_SIZE + 1
    const rangeEnd = Math.min(totalCount, (safePage + 1) * PAGE_SIZE)

    const hasActiveFilters =
        search.trim() !== "" ||
        responsable !== "all" ||
        tipo !== "all" ||
        Boolean(desde || hasta)

    const clearFilters = () => {
        setSearchState("")
        setTipoState("all")
        setDesdeState("")
        setHastaState("")
        setSortState(SORT_ITEMS[0].value)
        setPage(0)
    }

    return {
        search,
        setSearch,
        tipo,
        setTipo,
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
