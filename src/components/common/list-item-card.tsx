import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ListItemCardProps {
	/** Clases del borde completo (ej: "border-emerald-500"). */
	borderClassName?: string
	/** Clases del borde izquierdo de acento (ej: "border-l-emerald-500"). */
	accentClassName?: string
	/** Clases del avatar con el icono (fondo, color, redondeo). */
	avatarClassName?: string
	icon: LucideIcon
	/** Línea principal del card (ej: producto, boleta). */
	title: ReactNode
	/** Clases extra para la línea principal. */
	titleClassName?: string
	/** Dato que acompaña al título (ej: fecha). */
	titleMeta?: ReactNode
	/** Fila de badges bajo el título. */
	badges?: ReactNode
	/** Subtítulo descriptivo (ej: ítems, SKU, responsable). */
	description?: ReactNode
	/** Columna derecha: monto/cantidad + botón de acción. */
	trailing?: ReactNode
	className?: string
}

/**
 * Card de fila reutilizable para listados (ventas, movimientos, ...).
 * Presenta un layout fijo: avatar, contenido principal y columna
 * derecha; cada feature provee tonos vía props.
 */
export function ListItemCard({
	borderClassName,
	accentClassName,
	avatarClassName,
	icon: Icon,
	title,
	titleClassName,
	titleMeta,
	badges,
	description,
	trailing,
	className,
}: ListItemCardProps) {
	return (
		<li
			className={cn(
				"group relative grid gap-3 rounded-2xl border border-l-[5px] bg-background p-4 shadow-2xs transition-all hover:shadow-md md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
				borderClassName ?? "border-border",
				className,
				accentClassName
			)}
		>
			<div className="flex min-w-0 items-start gap-3.5">
				<div
					className={cn(
						"mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl shadow-2xs bg-muted text-muted-foreground",
						avatarClassName
					)}
					aria-hidden="true"
				>
					<Icon className="size-5" />
				</div>

				<div className="min-w-0 space-y-1.5">
					{title && (
						<div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
							<span
								className={cn(
									"font-medium text-foreground",
									titleClassName
								)}
							>
								{title}
							</span>
							{titleMeta && (
								<span className="text-xs font-medium text-muted-foreground">
									{titleMeta}
								</span>
							)}
						</div>
					)}

					{badges && (
						<div
							className="flex flex-wrap items-center gap-1.5"
							aria-label="Detalles del registro"
						>
							{badges}
						</div>
					)}

					{description && (
						<p className="line-clamp-2 text-xs font-medium text-muted-foreground">
							{description}
						</p>
					)}
				</div>
			</div>

			{trailing && (
				<div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3 md:flex-col md:items-end md:gap-2 md:border-t-0 md:pt-0">
					{trailing}
				</div>
			)}
		</li>
	)
}