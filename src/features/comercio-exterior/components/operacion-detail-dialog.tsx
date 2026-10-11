/**
 * Dialog de detalle de una operación de comercio exterior: datos de
 * cabecera, los productos involucrados y los montos en USD/PEN.
 */

import type { ReactNode } from "react"
import {
    CircleDollarSign,
    Landmark,
    Package,
    Plane,
    ShieldCheck,
    Ship,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { getUnitSymbol } from "@/lib/units"
import { formatVentaDateTime } from "@/features/ventas/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/common/form-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    formatUSD,
    getIncotermLabel,
    getMedioTransporteLabel,
    getTipoOperacionLabel,
    getTipoOperacionTint,
} from "../utils"
import type { OperacionComercioExterior } from "../types"

interface OperacionDetailDialogProps {
    operacion: OperacionComercioExterior | null
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

export function OperacionDetailDialog({
    operacion,
    onOpenChange,
}: OperacionDetailDialogProps) {
    const footer = (
        <div className="flex justify-end border-t bg-muted/40 p-3 sm:px-6">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                aria-label="Cerrar detalle de la operación"
            >
                Cerrar
            </Button>
        </div>
    )

    return (
        <FormDialog
            open={operacion !== null}
            onOpenChange={onOpenChange}
            title={
                operacion ? `Detalle de ${operacion.folio}` : "Detalle"
            }
            description={
                operacion
                    ? `Registro completo de la operación con ${operacion.socioComercial.nombre}.`
                    : undefined
            }
            footer={footer}
            className="sm:max-w-xl"
        >
            {operacion && (
                <div className="space-y-4 p-1">
                    {/* Encabezado principal */}
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/30 p-3.5">
                        <div className="space-y-0.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Tipo de operación
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    className={cn(
                                        "h-6 px-2.5 text-xs font-semibold shadow-none",
                                        getTipoOperacionTint(operacion.tipo)
                                    )}
                                >
                                    {getTipoOperacionLabel(operacion.tipo)}
                                </Badge>
                                <span className="font-mono text-xs text-primary">
                                    {operacion.folio}
                                </span>
                            </div>
                        </div>
                        <div className="text-right space-y-0.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Total (US$)
                            </span>
                            <p
                                className={cn(
                                    "text-base font-bold tabular-nums",
                                    operacion.tipo === "exportacion"
                                        ? "text-success"
                                        : "text-info"
                                )}
                            >
                                {formatUSD(operacion.totalUSD)}
                            </p>
                        </div>
                    </div>

                    {/* Socio comercial */}
                    <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5">
                            <Landmark className="size-3.5" aria-hidden="true" />
                            {operacion.tipo === "exportacion"
                                ? "Cliente"
                                : "Proveedor"}
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Nombre">
                                {operacion.socioComercial.nombre}
                            </DetailItem>
                            <DetailItem label="País">
                                {operacion.socioComercial.pais}
                            </DetailItem>
                            <DetailItem label="Fecha de operación">
                                {formatDate(operacion.fecha)}
                            </DetailItem>
                        </dl>
                    </div>

                    {/* Datos de despacho */}
                    <div className="rounded-lg border border-primary/25 bg-primary/10 p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1.5">
                            {operacion.medioTransporte === "aereo" ? (
                                <Plane className="size-3.5" aria-hidden="true" />
                            ) : (
                                <Ship className="size-3.5" aria-hidden="true" />
                            )}
                            Datos de despacho
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Incoterm">
                                {orDash(getIncotermLabel(operacion.incoterm))}
                            </DetailItem>
                            <DetailItem label="Transporte">
                                {orDash(
                                    getMedioTransporteLabel(
                                        operacion.medioTransporte
                                    )
                                )}
                            </DetailItem>
                            <DetailItem label="Tipo de cambio (US$ → S/)">
                                {operacion.tipoCambio}
                            </DetailItem>
                        </dl>
                    </div>

                    {/* Productos */}
                    <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5">
                            <Package className="size-3.5" aria-hidden="true" />
                            Productos ({operacion.lineas.length})
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-border/60">
                            <Table className="min-w-[420px]">
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="h-9 px-3 text-[11px] font-semibold text-muted-foreground uppercase">
                                            Producto
                                        </TableHead>
                                        <TableHead className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase">
                                            Cantidad
                                        </TableHead>
                                        <TableHead className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase">
                                            US$
                                        </TableHead>
                                        <TableHead className="h-9 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase">
                                            Subtotal
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {operacion.lineas.map((linea, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="px-3 py-2">
                                                <span className="text-xs font-medium text-foreground">
                                                    {linea.producto.name}
                                                </span>
                                                <span className="block font-mono text-[10px] text-muted-foreground">
                                                    {linea.producto.sku}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right text-xs tabular-nums text-foreground">
                                                {linea.cantidad}{" "}
                                                {getUnitSymbol(
                                                    linea.producto.unitType
                                                )}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right text-xs tabular-nums text-foreground">
                                                {linea.precioUSD.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-foreground">
                                                {formatUSD(linea.subtotalUSD)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Montos */}
                    <div className="rounded-lg border border-warning/25 bg-warning/10 p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warning border-b border-warning/20 pb-1.5">
                            <CircleDollarSign className="size-3.5" aria-hidden="true" />
                            Montos
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Subtotal (US$)">
                                {formatUSD(operacion.subtotalUSD)}
                            </DetailItem>
                            <DetailItem label="Total (US$)">
                                {formatUSD(operacion.totalUSD)}
                            </DetailItem>
                            <DetailItem label="Total (S/)" valueClassName="font-semibold">
                                {formatCurrency(operacion.totalPEN)}
                            </DetailItem>
                        </dl>
                    </div>

                    {/* Auditoría */}
                    <div className="rounded-lg border border-border/60 bg-card p-3.5 space-y-2.5">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5">
                            <ShieldCheck className="size-3.5" aria-hidden="true" />
                            Auditoría
                        </h4>
                        <dl className="space-y-2">
                            <DetailItem label="Responsable">
                                {operacion.responsable}
                            </DetailItem>
                            {operacion.notas && (
                                <DetailItem label="Notas">
                                    {operacion.notas}
                                </DetailItem>
                            )}
                            <DetailItem label="Registrado el">
                                {formatVentaDateTime(operacion.createdAt)}
                            </DetailItem>
                            <DetailItem
                                label="ID operación"
                                mono
                                valueClassName="text-muted-foreground"
                            >
                                {operacion.id}
                            </DetailItem>
                        </dl>
                    </div>
                </div>
            )}
        </FormDialog>
    )
}