/**
 * Card reutilizable de estadística: panel lateral con el icono a
 * toda la altura y la información (label, valor, sublabel) a la
 * derecha. El color viene definido por un tema ("tone") y puede
 * sobrescribirse por card con cardClassName/panelClassName.
 */

import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export type StatTone = "violet" | "rose" | "slate" | "amber"

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    sublabel?: string
    tone?: StatTone
    cardClassName?: string
    panelClassName?: string
    valueClassName?: string
}

const toneClasses: Record<StatTone, { card: string; panel: string; value?: string }> = {
    violet: {
        card: "border-violet-300 bg-violet-100/70 dark:border-violet-700 dark:bg-violet-950/50",
        panel: "bg-violet-400 dark:bg-violet-600",
    },
    rose: {
        card: "border-rose-300 bg-rose-100/70 dark:border-rose-700 dark:bg-rose-950/50",
        panel: "bg-rose-500 dark:bg-rose-600",
        value: "text-rose-600 dark:text-rose-400",
    },
    slate: {
        card: "border-slate-300 bg-slate-100/70 dark:border-slate-700 dark:bg-slate-950/50",
        panel: "bg-slate-300 dark:bg-slate-600",
    },
    amber: {
        card: "border-amber-300 bg-amber-100/70 dark:border-amber-700 dark:bg-amber-950/50",
        panel: "bg-amber-200 dark:bg-amber-600",
    },
}

export function StatCard({
    icon: Icon,
    label,
    value,
    sublabel,
    tone = "violet",
    cardClassName,
    panelClassName,
    valueClassName,
}: StatCardProps) {
    const { card, panel, value: toneValue } = toneClasses[tone]

    return (
        <Card className={cn("border py-0 ring-0", card, cardClassName)}>
            <div className="flex min-h-28">
                <div
                    aria-hidden="true"
                    className={cn(
                        "flex w-16 shrink-0 items-center justify-center",
                        panel,
                        panelClassName
                    )}
                >
                    <Icon className="size-7 text-white" />
                </div>
                {/* Agregado min-w-0 para permitir que los hijos con truncate funcionen correctamente en flex */}
                <CardContent className="flex flex-1 min-w-0 flex-col justify-center p-5">
                    <CardTitle className="font-medium truncate">{label}</CardTitle>
                    <p
                        title={String(value)}
                        className={cn(
                            "mt-1 text-xl font-bold tracking-tight truncate",
                            toneValue,
                            valueClassName
                        )}
                    >
                        {value}
                    </p>
                    {sublabel && (
                        <CardDescription className="mt-1 text-foreground truncate">
                            {sublabel}
                        </CardDescription>
                    )}
                </CardContent>
            </div>
        </Card>
    )
}