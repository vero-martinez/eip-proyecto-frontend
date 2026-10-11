"use client"

/**
 * Botón reutilizable para limpiar los filtros activos de una barra
 * de filtros. Presentacional: el padre decide cuándo mostrarlo.
 */

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "cn"

interface ClearFiltersButtonProps {
    onClick: () => void
    label?: string
    ariaLabel?: string
    className?: string
}

export function ClearFiltersButton({
    onClick,
    label = "Limpiar filtros",
    ariaLabel,
    className,
}: ClearFiltersButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            aria-label={ariaLabel}
            className={cn(
                "gap-1.5 rounded-full bg-primary/20 text-muted-foreground hover:bg-primary/30 hover:text-foreground",
                className
            )}
        >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {label}
        </Button>
    )
}