"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type ActivityTone = "positive" | "negative"

const TONE_ICON_CLASSES: Record<ActivityTone, string> = {
    positive: "bg-primary/10 text-primary ring-1 ring-primary/20",
    negative: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
}

export interface ActivityListProps<T> {
    icon: LucideIcon
    title: string
    description: string
    tone?: ActivityTone
    items: T[]
    renderItem: (item: T, index: number) => ReactNode
    emptyTitle: string
    emptyHint: string
    emptyIcon?: LucideIcon
    className?: string
}

/**
 * Card con header (icono + título + descripción), lista de items
 * recientes y estado vacío. Cada feature provee su fila vía renderItem
 * y el color del encabezado vía tone.
 */
export function ActivityList<T>({
    icon: Icon,
    title,
    description,
    tone = "positive",
    items,
    renderItem,
    emptyTitle,
    emptyHint,
    emptyIcon: EmptyIcon = Inbox,
    className,
}: ActivityListProps<T>) {
    return (
        <Card
            className={cn(
                "border-border/80 shadow-sm transition-all duration-200 hover:shadow-md",
                className
            )}
        >
            <CardHeader className="pb-4">
                <div className="flex items-start gap-2.5">
                    <span
                        className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                            TONE_ICON_CLASSES[tone]
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                    </span>

                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold leading-tight">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            {description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pt-0">
                {items.length ? (
                    <ul className="flex flex-col gap-2">
                        {items.map((item, index) => renderItem(item, index))}
                    </ul>
                ) : (
                    <div className="flex h-44 flex-col items-center justify-center gap-2.5 text-center text-muted-foreground">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50">
                            <EmptyIcon
                                className="size-5 text-muted-foreground/70"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                                {emptyTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {emptyHint}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}