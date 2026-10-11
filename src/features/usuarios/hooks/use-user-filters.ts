/**
 * Hook de filtros, orden y paginación de la tabla de usuarios.
 */

import { useMemo, useState } from "react"

import type { Rol } from "@/types/auth"
import type { User, StatusFilter, SortBy } from "../types"

const PAGE_SIZE = 10

export function useUserFilters(users: User[]) {
    const [search, setSearchState] = useState("")
    const [roleFilter, setRoleFilterState] = useState<Rol | "all">("all")
    const [statusFilter, setStatusFilterState] = useState<StatusFilter>("all")
    const [sortBy, setSortByState] = useState<SortBy>("newest")
    const [page, setPage] = useState(0)

    const setSearch = (value: string) => {
        setSearchState(value)
        setPage(0)
    }

    const setRoleFilter = (value: Rol | "all") => {
        setRoleFilterState(value)
        setPage(0)
    }

    const setStatusFilter = (value: StatusFilter) => {
        setStatusFilterState(value)
        setPage(0)
    }

    const setSortBy = (value: SortBy) => {
        setSortByState(value)
        setPage(0)
    }

    const filteredUsers = useMemo(() => {
        let result = users

        if (roleFilter !== "all") {
            result = result.filter((u) => u.role === roleFilter)
        }

        if (statusFilter === "active") {
            result = result.filter((u) => u.isActive)
        } else if (statusFilter === "inactive") {
            result = result.filter((u) => !u.isActive)
        }

        const term = search.trim().toLowerCase()
        if (term) {
            result = result.filter(
                (u) =>
                    u.fullName.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term)
            )
        }

        return [...result].sort((a, b) => {
            switch (sortBy) {
                case "oldest":
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                case "name":
                    return a.fullName.localeCompare(b.fullName)
                default:
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
            }
        })
    }, [users, roleFilter, statusFilter, search, sortBy])

    const totalCount = filteredUsers.length
    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    const safePage = Math.min(page, pageCount - 1)
    const pageItems = filteredUsers.slice(
        safePage * PAGE_SIZE,
        (safePage + 1) * PAGE_SIZE
    )
    const rangeStart = totalCount === 0 ? 0 : safePage * PAGE_SIZE + 1
    const rangeEnd = Math.min(totalCount, (safePage + 1) * PAGE_SIZE)

    const hasActiveFilters =
        search.trim() !== "" ||
        roleFilter !== "all" ||
        statusFilter !== "all" ||
        sortBy !== "newest"

    const clearFilters = () => {
        setSearchState("")
        setRoleFilterState("all")
        setStatusFilterState("all")
        setSortByState("newest")
        setPage(0)
    }

    return {
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
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