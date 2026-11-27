/**
 * Card reutilizable de estadística: panel lateral con el icono a
 * toda la altura y la información (label, valor, sublabel) a la
 * derecha. El color viene definido por un tema ("tone") y puede
 * sobrescribirse por card con cardClassName/panelClassName.
 */

import type { ReactNode } from "react"

import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export type StatTone = "violet" | "rose" | "slate" | "amber"

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    sublabel?: ReactNode
    sublabelClassName?: string
    tone?: StatTone
    cardClassName?: string
    panelClassName?: string
    valueClassName?: string
}

const toneClasses: Record<StatTone, { card: string; panel: string; icon: string; value?: string }> = {
    violet: {
        card: "border-primary/30 bg-primary/10",
        panel: "bg-primary",
        icon: "text-primary-foreground",
    },
    rose: {
        card: "border-destructive/30 bg-destructive/10",
        panel: "bg-destructive",
        icon: "text-destructive-foreground",
        value: "text-destructive",
    },
    slate: {
        card: "border-border bg-muted",
        panel: "bg-muted-foreground",
        icon: "text-background",
    },
    amber: {
        card: "border-warning/30 bg-warning/10",
        panel: "bg-warning",
        icon: "text-warning-foreground",
    },
}

export function StatCard({
    icon: Icon,
    label,
    value,
    sublabel,
    sublabelClassName,
    tone = "violet",
    cardClassName,
    panelClassName,
    valueClassName,
}: StatCardProps) {
    const { card, panel, icon, value: toneValue } = toneClasses[tone]

    return (
        <Card
            className={cn(
                "h-full overflow-hidden rounded-xl border py-0 ring-0",
                card,
                cardClassName
            )}
        >
            <div className="flex h-full min-h-32 items-stretch">
                <div
                    aria-hidden="true"
                    className={cn(
                        "flex w-16 shrink-0 items-center justify-center self-stretch",
                        panel,
                        panelClassName
                    )}
                >
                    <Icon className={cn("size-7", icon)} />
                </div>
                <CardContent className="flex min-w-0 flex-1 flex-col items-stretch justify-start p-5">
                    <CardTitle className="break-words text-xs font-medium leading-tight">
                        {label}
                    </CardTitle>
                    <p
                        title={String(value)}
                        className={cn(
                            "mt-1 break-words text-xl font-bold leading-tight tracking-tight",
                            toneValue,
                            valueClassName
                        )}
                    >
                        {value}
                    </p>
                    {sublabel && (
                        <CardDescription
                            className={cn(
                                "mt-1 break-words text-xs leading-snug text-foreground",
                                sublabelClassName
                            )}
                        >
                            {sublabel}
                        </CardDescription>
                    )}
                </CardContent>
            </div>
        </Card>
    )
}