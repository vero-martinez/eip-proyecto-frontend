import type { ReactNode } from "react"
import {
    CircleDollarSign,
    MapPin,
    Package,
    ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/common/form-dialog"
import { formatCurrency } from "@/lib/utils"

import {
    formatMovementQuantity,
    formatPrecioDoble,
    formatPrecioSoles,
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
    const isSalida =
        movement?.movementType !== "entrada" &&
        movement?.movementType !== "importacion"

    const esComercio =
        movement?.movementType === "importacion" ||
        movement?.movementType === "exportacion"
    const esImportacion = movement?.movementType === "importacion"

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
                                        ? "text-destructive"
                                        : "text-success"
                                )}
                            >
                                {formatMovementQuantity(movement)}
                            </p>
                        </div>
                    </div>

                    {/* Información del Producto */}
                    <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5">
                            <Package className="size-3.5" aria-hidden="true" />
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
                    <div className="rounded-lg border border-info/25 bg-info/10 p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-info border-b border-info/20 pb-1.5">
                            <CircleDollarSign className="size-3.5" aria-hidden="true" />
                            Métricas Financieras
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Precio Unit. Venta" valueClassName="text-info font-semibold">
                                <span className="tabular-nums">
                                    {movement.movementType ===
                                        "exportacion"
                                        ? formatPrecioDoble(
                                              movement.unitPriceUSD,
                                              movement.unitSoldPrice
                                          )
                                        : formatPrecioSoles(
                                              movement.unitSoldPrice
                                          )}
                                </span>
                            </DetailItem>
                            <DetailItem label="Costo Unitario">
                                <span className="tabular-nums">
                                    {esImportacion
                                        ? formatPrecioDoble(
                                              movement.unitPriceUSD,
                                              movement.unitCostPrice
                                          )
                                        : movement.unitCostPrice !== undefined
                                          ? formatCurrency(
                                                movement.unitCostPrice
                                            )
                                          : "—"}
                                </span>
                            </DetailItem>
                            {esComercio && (
                                <DetailItem label="Tipo de cambio">
                                    <span className="tabular-nums">
                                        {orDash(movement.tipoCambio)}
                                    </span>
                                </DetailItem>
                            )}
                        </dl>
                    </div>

                    {/* Detalles Operativos (Acento Morado) */}
                    <div className="rounded-lg border border-primary/25 bg-primary/10 p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1.5">
                            <MapPin className="size-3.5" aria-hidden="true" />
                            Origen y Motivo
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Origen">
                                {orDash(getMovementDetail(movement))}
                            </DetailItem>
                            {getMovementMotivo(movement) !== undefined && (
                                <DetailItem label="Motivo">
                                    {orDash(getMovementMotivo(movement))}
                                </DetailItem>
                            )}
                            {movement.movementType === "merma" && (
                                <DetailItem label="Detalle">
                                    {orDash(movement.reason)}
                                </DetailItem>
                            )}
                            {movement.movementType === "venta" && (
                                <DetailItem
                                    label="Grupo de Venta"
                                    mono
                                    valueClassName="text-primary"
                                >
                                    {orDash(movement.saleGroupId)}
                                </DetailItem>
                            )}
                            {(movement.movementType === "importacion" ||
                                movement.movementType === "exportacion") && (
                                <DetailItem
                                    label="Folio"
                                    mono
                                    valueClassName="text-primary"
                                >
                                    {orDash(movement.folio)}
                                </DetailItem>
                            )}
                        </dl>
                    </div>

                    {/* Auditoría y Registro (Acento Ámbar/Cálido) */}
                    <div className="rounded-lg border border-warning/25 bg-warning/10 p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warning border-b border-warning/20 pb-1.5">
                            <ShieldCheck className="size-3.5" aria-hidden="true" />
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