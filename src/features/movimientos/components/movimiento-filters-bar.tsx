"use client"

/**
 * Barra de filtros de la tabla de movimientos: responsable,
 * rango de fechas, tipo de movimiento, orden y botón para limpiar
 * los filtros activos.
 */

import { ArrowUpDown, Boxes } from "lucide-react"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
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

import { MOVIMIENTO_TIPO_ITEMS, SORT_ITEMS } from "../constants"
import type { SortOption } from "../constants"
import type { MovementType } from "../types"

const TIPO_FILTER_ITEMS: {
    value: MovementType | "all"
    label: string
}[] = [{ value: "all", label: "Todos" }, ...MOVIMIENTO_TIPO_ITEMS]

// Estilo común para aplicar fondo bg-primary/30 y accesibilidad en los filtros.
const filterInputBaseClass =
    "h-9 text-xs bg-primary/30 border-primary/20 hover:bg-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 text-foreground placeholder:text-muted-foreground transition-colors"

interface MovimientoFiltersBarProps {
    responsable: string
    onResponsableChange: (value: string) => void
    responsableOptions: SearchableSelectOption[]
    desde: string
    onDesdeChange: (value: string) => void
    hasta: string
    onHastaChange: (value: string) => void
    tipo: MovementType | "all"
    onTipoChange: (value: MovementType | "all") => void
    sort: SortOption
    onSortChange: (value: SortOption) => void
    hasActiveFilters: boolean
    onClearFilters: () => void
}

export function MovimientoFiltersBar({
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
}: MovimientoFiltersBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-56">
                <SearchableSelect
                    value={responsable}
                    onValueChange={onResponsableChange}
                    options={responsableOptions}
                    placeholder="Todos los responsables"
                    searchPlaceholder="Buscar responsable..."
                    emptyText="Sin responsables"
                    ariaLabel="Filtrar por responsable"
                    triggerClassName={cn(filterInputBaseClass, "w-full")}
                    contentClassName="max-w-[300px]"
                />
            </div>

            <div className="w-full sm:w-36">
                <Input
                    type="date"
                    value={desde}
                    onChange={(e) => onDesdeChange(e.target.value)}
                    aria-label="Filtrar movimientos desde la fecha"
                    className={filterInputBaseClass}
                />
            </div>

            <div className="w-full sm:w-36">
                <Input
                    type="date"
                    value={hasta}
                    onChange={(e) => onHastaChange(e.target.value)}
                    aria-label="Filtrar movimientos hasta la fecha"
                    className={filterInputBaseClass}
                />
            </div>

            <Select
                value={tipo}
                onValueChange={(val) =>
                    onTipoChange((val ?? "all") as MovementType | "all")
                }
                items={TIPO_FILTER_ITEMS}
            >
                <SelectTrigger
                    aria-label="Filtrar por tipo de movimiento"
                    className={cn(
                        filterInputBaseClass,
                        "h-9 min-h-9 w-full justify-start gap-2 sm:w-auto",
                        tipo !== "all" &&
                            "border-violet-500 font-medium text-violet-700 dark:text-violet-300"
                    )}
                >
                    <Boxes
                        className="size-3.5 text-foreground/70 shrink-0"
                        aria-hidden="true"
                    />
                    <SelectValue />
                </SelectTrigger>

                <SelectContent align="end">
                    {TIPO_FILTER_ITEMS.map((option) => (
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
                items={SORT_ITEMS}
            >
                <SelectTrigger
                    aria-label="Ordenar movimientos por fecha"
                    className={cn(
                        filterInputBaseClass,
                        "h-9 min-h-9 w-full justify-start gap-2 sm:w-auto"
                    )}
                >
                    <ArrowUpDown
                        className="size-3.5 text-foreground/70 shrink-0"
                        aria-hidden="true"
                    />
                    <SelectValue />
                </SelectTrigger>

                <SelectContent align="end">
                    {SORT_ITEMS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <ClearFiltersButton
                    onClick={onClearFilters}
                    ariaLabel="Limpiar todos los filtros activos"
                    className={cn(
                        filterInputBaseClass,
                        "px-3 border-transparent hover:border-primary/30"
                    )}
                />
            )}
        </div>
    )
}