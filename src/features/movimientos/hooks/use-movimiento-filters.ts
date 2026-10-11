/**
 * Hook para gestionar el filtrado, ordenamiento y paginación de movimientos.
 */

import { useMemo, useState } from "react"

import { SORT_ITEMS } from "../constants"
import type { SortOption } from "../constants"
import type { InventoryMovement, MovementType } from "../types"

const PAGE_SIZE = 10

export function useMovimientoFilters(movements: InventoryMovement[]) {
    const [search, setSearchState] = useState("")
    const [tipo, setTipoState] = useState<MovementType | "all">("all")
    const [responsable, setResponsableState] = useState("all")
    const [desde, setDesdeState] = useState("")
    const [hasta, setHastaState] = useState("")
    const [sort, setSortState] = useState<SortOption>(SORT_ITEMS[0].value)
    const [page, setPage] = useState(0)

    const setSearch = (value: string) => {
        setSearchState(value)
        setPage(0)
    }

    const setTipo = (value: MovementType | "all") => {
        setTipoState(value)
        setPage(0)
    }

    const setResponsable = (value: string) => {
        setResponsableState(value)
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

    const filteredMovements = useMemo(() => {
        let result = movements

        const term = search.trim().toLowerCase()
        if (term) {
            result = result.filter(
                (m) =>
                    m.productName.toLowerCase().includes(term) ||
                    m.sku.toLowerCase().includes(term)
            )
        }

        if (tipo !== "all") {
            result = result.filter((m) => m.movementType === tipo)
        }

        if (responsable !== "all") {
            result = result.filter((m) => m.responsable === responsable)
        }

        if (desde) {
            const start = new Date(`${desde}T00:00:00`)
            result = result.filter(
                (m) => new Date(m.createdAt).getTime() >= start.getTime()
            )
        }

        if (hasta) {
            const end = new Date(`${hasta}T23:59:59.999`)
            result = result.filter(
                (m) => new Date(m.createdAt).getTime() <= end.getTime()
            )
        }

        return [...result].sort((a, b) => {
            const diff =
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            return sort === "recent" ? diff : -diff
        })
    }, [movements, search, tipo, responsable, desde, hasta, sort])

    const totalCount = filteredMovements.length
    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    const safePage = Math.min(page, pageCount - 1)
    const pageItems = filteredMovements.slice(
        safePage * PAGE_SIZE,
        (safePage + 1) * PAGE_SIZE
    )
    const rangeStart = totalCount === 0 ? 0 : safePage * PAGE_SIZE + 1
    const rangeEnd = Math.min(totalCount, (safePage + 1) * PAGE_SIZE)

    const hasActiveFilters =
        search.trim() !== "" ||
        tipo !== "all" ||
        responsable !== "all" ||
        Boolean(desde || hasta) ||
        sort !== SORT_ITEMS[0].value

    const clearFilters = () => {
        setSearchState("")
        setTipoState("all")
        setResponsableState("all")
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
        responsable,
        setResponsable,
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