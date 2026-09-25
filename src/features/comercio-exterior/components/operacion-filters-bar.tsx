"use client"

/**
 * Barra de filtros de la tabla de operaciones: socio comercial, rango de
 * fechas, tipo de operación, orden y botón para limpiar filtros activos.
 */

import { ArrowUpDown, Globe } from "lucide-react"
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

import { TIPO_OPERACION_ITEMS } from "../constants"
import {
    OPERACION_SORT_ITEMS,
    type OperacionSortOption,
} from "../hooks/use-operacion-filters"
import type { TipoOperacion } from "../types"

const TIPO_FILTER_ITEMS: {
    value: TipoOperacion | "all"
    label: string
}[] = [{ value: "all", label: "Todas" }, ...TIPO_OPERACION_ITEMS]

// Estilo común para aplicar fondo bg-primary/30 y accesibilidad en los filtros.
const filterInputBaseClass =
    "h-9 text-xs bg-primary/30 border-primary/20 hover:bg-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 text-foreground placeholder:text-muted-foreground transition-colors"

interface OperacionFiltersBarProps {
    socioComercial: string
    onSocioComercialChange: (value: string) => void
    socioComercialOptions: SearchableSelectOption[]
    desde: string
    onDesdeChange: (value: string) => void
    hasta: string
    onHastaChange: (value: string) => void
    tipo: TipoOperacion | "all"
    onTipoChange: (value: TipoOperacion | "all") => void
    sort: OperacionSortOption
    onSortChange: (value: OperacionSortOption) => void
    hasActiveFilters: boolean
    onClearFilters: () => void
}

export function OperacionFiltersBar({
    socioComercial,
    onSocioComercialChange,
    socioComercialOptions,
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
}: OperacionFiltersBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-56">
                <SearchableSelect
                    value={socioComercial}
                    onValueChange={onSocioComercialChange}
                    options={socioComercialOptions}
                    placeholder="Todos los socios comerciales"
                    searchPlaceholder="Buscar socio comercial..."
                    emptyText="Sin socios comerciales"
                    ariaLabel="Filtrar por socio comercial"
                    triggerClassName={cn(filterInputBaseClass, "w-full")}
                    contentClassName="max-w-[300px]"
                />
            </div>

            <div className="w-full sm:w-36">
                <Input
                    type="date"
                    value={desde}
                    onChange={(e) => onDesdeChange(e.target.value)}
                    aria-label="Filtrar operaciones desde la fecha"
                    className={filterInputBaseClass}
                />
            </div>

            <div className="w-full sm:w-36">
                <Input
                    type="date"
                    value={hasta}
                    onChange={(e) => onHastaChange(e.target.value)}
                    aria-label="Filtrar operaciones hasta la fecha"
                    className={filterInputBaseClass}
                />
            </div>

            <Select
                value={tipo}
                onValueChange={(val) =>
                    onTipoChange((val ?? "all") as TipoOperacion | "all")
                }
                items={TIPO_FILTER_ITEMS}
            >
                <SelectTrigger
                    aria-label="Filtrar por tipo de operación"
                    className={cn(
                        filterInputBaseClass,
                        "h-9 min-h-9 w-full justify-start gap-2 sm:w-auto",
                        tipo !== "all" &&
                            "border-violet-500 font-medium text-violet-700 dark:text-violet-300"
                    )}
                >
                    <Globe
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
                    onSortChange((val ?? "recent") as OperacionSortOption)
                }
                items={OPERACION_SORT_ITEMS}
            >
                <SelectTrigger
                    aria-label="Ordenar operaciones por fecha"
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
                    {OPERACION_SORT_ITEMS.map((option) => (
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