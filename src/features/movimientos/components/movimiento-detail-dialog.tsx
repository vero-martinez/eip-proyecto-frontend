import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/common/form-dialog"
import { formatCurrency } from "@/lib/utils"

import {
    formatMovementQuantity,
    formatVentaDateTime,
    getMovementDetail,
    getMovementMotivo,
    getMovementTint,
    getMovementTypeLabel,
} from "../utils"
import type { InventoryMovement } from "../types"

interface MovimientoDetailDialogProps {
    movement: InventoryMovement | null
    onOpenChange: (open: boolean) => void
}

const orDash = (value?: string | number | null): string =>
    value === undefined || value === null || value === "" ? "—" : String(value)

function DetailItem({
    label,
    children,
    mono = false,
    valueClassName,
}: {
    label: string
    children: ReactNode
    mono?: boolean
    valueClassName?: string
}) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
            </dt>
            <dd
                className={cn(
                    "text-sm font-medium text-foreground sm:text-right",
                    mono && "font-mono text-xs",
                    valueClassName
                )}
            >
                {children}
            </dd>
        </div>
    )
}

export function MovimientoDetailDialog({
    movement,
    onOpenChange,
}: MovimientoDetailDialogProps) {
    const isSalida = movement?.movementType !== "entrada"

    const footer = (
        <div className="flex justify-end border-t bg-muted/40 p-3 sm:px-6">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                aria-label="Cerrar detalle del movimiento"
            >
                Cerrar
            </Button>
        </div>
    )

    return (
        <FormDialog
            open={movement !== null}
            onOpenChange={onOpenChange}
            title={
                movement ? `Detalle del Movimiento #${movement.id}` : "Detalle"
            }
            description={
                movement
                    ? `Registro completo del movimiento para ${movement.productName}.`
                    : undefined
            }
            footer={footer}
        >
            {movement && (
                <div className="space-y-4 p-1">
                    {/* Encabezado Principal */}
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/30 p-3.5">
                        <div className="space-y-0.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Estado / Tipo
                            </span>
                            <div>
                                <Badge
                                    className={cn(
                                        "h-6 px-2.5 text-xs font-semibold shadow-none",
                                        getMovementTint(movement.movementType)
                                    )}
                                >
                                    {getMovementTypeLabel(movement.movementType)}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right space-y-0.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Cantidad
                            </span>
                            <p
                                className={cn(
                                    "text-base font-bold tabular-nums",
                                    isSalida
                                        ? "text-rose-600 dark:text-rose-400"
                                        : "text-emerald-600 dark:text-emerald-400"
                                )}
                            >
                                {formatMovementQuantity(movement)}
                            </p>
                        </div>
                    </div>

                    {/* Información del Producto */}
                    <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5">
                            Información del Producto
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Producto">
                                {movement.productName}
                            </DetailItem>
                            <DetailItem label="SKU" mono valueClassName="text-primary font-semibold">
                                {movement.sku}
                            </DetailItem>
                        </dl>
                    </div>

                    {/* Costos e Importes (Acento Azul) */}
                    <div className="rounded-lg border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 border-b border-blue-200/50 dark:border-blue-900/30 pb-1.5">
                            Métricas Financieras
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Precio Unit. Venta" valueClassName="text-blue-600 dark:text-blue-400 font-semibold">
                                <span className="tabular-nums">
                                        {movement.unitSoldPrice !==
                                            undefined &&
                                        movement.unitSoldPrice > 0
                                            ? formatCurrency(
                                                  movement.unitSoldPrice
                                              )
                                            : "—"}
                                    </span>
                            </DetailItem>
                            <DetailItem label="Costo Unitario">
                                <span className="tabular-nums">
                                    {movement.unitCostPrice !== undefined
                                        ? formatCurrency(movement.unitCostPrice)
                                        : "—"}
                                </span>
                            </DetailItem>
                        </dl>
                    </div>

                    {/* Detalles Operativos (Acento Morado) */}
                    <div className="rounded-lg border border-violet-200/60 dark:border-violet-900/40 bg-violet-50/40 dark:bg-violet-950/20 p-3.5 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 border-b border-violet-200/50 dark:border-violet-900/30 pb-1.5">
                            Origen y Motivo
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Origen">
                                {orDash(getMovementDetail(movement))}
                            </DetailItem>
                            <DetailItem label="Motivo">
                                {orDash(getMovementMotivo(movement))}
                            </DetailItem>
                            <DetailItem label="Grupo de Venta" mono valueClassName="text-violet-700 dark:text-violet-300">
                                {orDash(movement.saleGroupId)}
                            </DetailItem>
                        </dl>
                    </div>

                    {/* Auditoría y Registro (Acento Ámbar/Cálido) */}
                    <div className="rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 p-3.5 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border-b border-amber-200/50 dark:border-amber-900/30 pb-1.5">
                            Auditoría
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Responsable">
                                {movement.responsable}
                            </DetailItem>
                            <DetailItem label="Fecha y Hora">
                                {formatVentaDateTime(movement.createdAt)}
                            </DetailItem>
                            <DetailItem label="ID Movimiento" mono valueClassName="text-muted-foreground">
                                {movement.id}
                            </DetailItem>
                        </dl>
                    </div>
                </div>
            )}
        </FormDialog>
    )
}