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
    tone = "violet",
    cardClassName,
    panelClassName,
    valueClassName,
}: StatCardProps) {
    const { card, panel, icon, value: toneValue } = toneClasses[tone]

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
                    <Icon className={cn("size-7", icon)} />
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