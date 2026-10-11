/**
 * Estado vacío del reporte: el filtro es válido pero no hay datos que
 * mostrar, así que se explica cómo salir de esa situación.
 */

import { FileQuestion } from "lucide-react"

interface ReportesEmptyStateProps {
    titulo: string
    descripcion: string
}

export function ReportesEmptyState({
    titulo,
    descripcion,
}: ReportesEmptyStateProps) {
    return (
        <div
            role="status"
            className="flex flex-col items-center justify-center gap-2.5 rounded-[10px] border border-dashed border-border bg-muted/40 p-8 text-center text-muted-foreground"
        >
            <div className="flex size-10 items-center justify-center rounded-full bg-muted ring-1 ring-border/60">
                <FileQuestion
                    className="size-5 text-muted-foreground/70"
                    aria-hidden="true"
                />
            </div>
            <div className="space-y-1">
                <p className="text-[13px] font-semibold text-foreground">{titulo}</p>
                <p className="text-[11.5px] text-muted-foreground">{descripcion}</p>
            </div>
        </div>
    )
}
