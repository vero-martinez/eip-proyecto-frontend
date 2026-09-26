"use client"

/**
 * Barras de filtros del historial de ventas.
 *
 * VentasFiltersBar es la barra primaria (rango de fechas, tipo, orden y,
 * en la vista global, responsable). VentasSearchBar es la barra
 * secundaria con el buscador por folio.
 *
 * Ambas son presentacionales puras: reciben valor y callback de cada
 * control. El estado vive en useVentasFilters y el listado decide
 * cuáles montar.
 */

import {
    ArrowUpDown,
    Search,
    Store,
    X,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ClearFiltersButton } from "@/components/common/clear-filters-button"
import {
    SearchableSelect,
    type SearchableSelectOption,
} from "@/components/common/searchable-select"

import { SORT_ITEMS, TIPOS_VENTA, type SortOption } from "../constants"

const TIPO_FILTER_ITEMS: Record<string, string> = {
    all: "Todos",
    ...Object.fromEntries(TIPOS_VENTA.map((option) => [option.value, option.label])),
}

/** Clases del buscador por folio, con el mismo tinte violeta de la barra. */
const SEARCH_GROUP_CLASS =
    "h-8 w-full max-w-xs border-violet-200 bg-white/60 focus-within:ring-2 focus-within:ring-violet-500 dark:border-violet-800 dark:bg-slate-900/60"

interface VentasFiltersBarProps {
    /** Muestra el selector de responsable (solo vista global). */
    mostrarResponsable: boolean
    responsable: string
    onResponsableChange?: (value: string) => void
    responsableOptions: SearchableSelectOption[]
    desde: string
    onDesdeChange: (value: string) => void
    hasta: string
    onHastaChange: (value: string) => void
    tipo: string
    onTipoChange: (value: string) => void
    sort: SortOption
    onSortChange: (value: SortOption) => void
    hasActiveFilters: boolean
    onClearFilters: () => void
}

export function VentasFiltersBar({
    mostrarResponsable,
    responsable,
    onResponsableChange,
    responsableOptions,
    desde,
    onDesdeChange,
    hasta,
    onHastaChange,
    tipo,
    onTipoChange,
    sort,
    onSortChange,
    hasActiveFilters,
    onClearFilters,
}: VentasFiltersBarProps) {
    return (
        <div
            role="search"
            aria-label="Filtros de historial de ventas"
            className="flex flex-col items-center gap-3 rounded-2xl border border-violet-200/70 bg-white/60 p-3.5 dark:border-violet-900/40 dark:bg-slate-900/60 sm:flex-row sm:items-end sm:justify-between"
        >
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                {mostrarResponsable && onResponsableChange && (
                    <div className="flex w-full flex-col items-center text-center gap-1 sm:w-56 sm:items-start sm:text-left">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-900/70 dark:text-violet-300">
                            Responsable
                        </span>
                        <SearchableSelect
                            value={responsable}
                            onValueChange={onResponsableChange}
                            options={responsableOptions}
                            placeholder="Todos los responsables"
                            searchPlaceholder="Buscar responsable..."
                            emptyText="Sin responsables"
                            ariaLabel="Filtrar por responsable"
                            triggerClassName="h-8 w-full justify-start gap-1.5 border-violet-300/80 text-xs font-bold text-violet-900 dark:border-violet-800 dark:text-violet-200"
                            contentClassName="max-w-[300px]"
                        />
                    </div>
                )}

                <div className="flex w-full flex-col items-center text-center sm:w-auto sm:items-start sm:text-left gap-1">
                    <label
                        htmlFor="ventas-desde"
                        className="text-[11px] font-bold uppercase tracking-wider text-violet-900/70 dark:text-violet-300"
                    >
                        Desde
                    </label>
                    <Input
                        id="ventas-desde"
                        type="date"
                        value={desde}
                        onChange={(e) => onDesdeChange(e.target.value)}
                        className="h-8 w-full sm:w-36 border-violet-200 text-xs text-center sm:text-left focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-violet-800"
                    />
                </div>

                <div className="flex w-full flex-col items-center text-center sm:w-auto sm:items-start sm:text-left gap-1">
                    <label
                        htmlFor="ventas-hasta"
                        className="text-[11px] font-bold uppercase tracking-wider text-violet-900/70 dark:text-violet-300"
                    >
                        Hasta
                    </label>
                    <Input
                        id="ventas-hasta"
                        type="date"
                        value={hasta}
                        onChange={(e) => onHastaChange(e.target.value)}
                        className="h-8 w-full sm:w-36 border-violet-200 text-xs text-center sm:text-left focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-violet-800"
                    />
                </div>

                {hasActiveFilters && (
                    <ClearFiltersButton
                        onClick={onClearFilters}
                        ariaLabel="Limpiar todos los filtros activos"
                        className="h-8"
                    />
                )}
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:ml-auto">
                <Select
                    value={tipo}
                    onValueChange={(val) => onTipoChange(val ?? "all")}
                    items={TIPO_FILTER_ITEMS}
                >
                    <SelectTrigger
                        size="sm"
                        aria-label="Filtrar por tipo de venta"
                        className="h-8 w-full sm:w-auto justify-center gap-2 border-violet-300/80 text-xs font-bold text-violet-900 dark:border-violet-800 dark:text-violet-200"
                    >
                        <Store className="size-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">Todos</SelectItem>
                        {TIPOS_VENTA.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={sort}
                    onValueChange={(val) =>
                        onSortChange((val ?? "recent") as SortOption)
                    }
                    items={Object.fromEntries(
                        SORT_ITEMS.map((item) => [item.value, item.label])
                    )}
                >
                    <SelectTrigger
                        size="sm"
                        aria-label="Ordenar resultados por fecha"
                        className="h-8 w-full sm:w-auto justify-center gap-2 border-violet-300/80 text-xs font-bold text-violet-900 dark:border-violet-800 dark:text-violet-200"
                    >
                        <ArrowUpDown className="size-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                        {SORT_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

interface VentasSearchBarProps {
    search: string
    onSearchChange: (value: string) => void
}

export function VentasSearchBar({
    search,
    onSearchChange,
}: VentasSearchBarProps) {
    return (
        <InputGroup className={SEARCH_GROUP_CLASS}>
            <InputGroupAddon align="inline-start">
                <Search
                    className="size-3.5 text-violet-600 dark:text-violet-400"
                    aria-hidden="true"
                />
            </InputGroupAddon>

            <InputGroupInput
                placeholder="Buscar por código..."
                aria-label="Buscar por número de código"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="text-xs font-medium text-violet-900 dark:text-violet-200"
            />

            {search && (
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        aria-label="Limpiar campo de búsqueda"
                        onClick={() => onSearchChange("")}
                    >
                        <X className="size-3.5" />
                    </InputGroupButton>
                </InputGroupAddon>
            )}
        </InputGroup>
    )
}
