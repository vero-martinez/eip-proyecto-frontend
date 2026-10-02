"use client"

/**
 * Selector de periodo del Dashboard.
 */

import { CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"

import { PERIODO_ITEMS } from "../constants"
import type { PeriodoDashboard } from "../types"

interface DashboardPeriodoToggleProps {
    periodo: PeriodoDashboard
    onPeriodoChange: (periodo: PeriodoDashboard) => void
    disabled?: boolean
}

export function DashboardPeriodoToggle({
    periodo,
    onPeriodoChange,
    disabled,
}: DashboardPeriodoToggleProps) {
    return (
        <div
            role="group"
            aria-label="Periodo del resumen"
            className={cn(
                "inline-flex items-center gap-1 rounded-2xl bg-primary/[0.08] p-1.5 ring-1 ring-primary/15",
                disabled && "opacity-60"
            )}
        >
            <span
                className="hidden size-8 shrink-0 items-center justify-center text-primary sm:flex"
                aria-hidden="true"
            >
                <CalendarDays className="size-4" />
            </span>

            {PERIODO_ITEMS.map((item) => {
                const activo = item.value === periodo
                return (
                    <button
                        key={item.value}
                        type="button"
                        aria-pressed={activo}
                        disabled={disabled}
                        onClick={() => onPeriodoChange(item.value)}
                        className={cn(
                            "relative rounded-xl px-4 py-2 text-sm font-medium outline-none transition-all duration-200",
                            "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            "disabled:cursor-not-allowed",
                            activo
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                        )}
                    >
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}