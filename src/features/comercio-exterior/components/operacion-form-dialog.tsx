"use client"

/**
 * Dialog de registro de una operación de comercio exterior
 * (importación/exportación). Presentacional: la lógica de estado y la
 * mutación viven en useOperacionForm.
 */

import { useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import { useWatch } from "react-hook-form"
import {
    FileText,
    Globe2,
    Landmark,
    PackageCheck,
} from "lucide-react"

import { FormDialog } from "@/components/common/form-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SearchableSelect } from "@/components/common/searchable-select"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/products"
import type { SocioComercial } from "../types"

import {
    INCOTERMS,
    MEDIOS_TRANSPORTE,
} from "../constants"
import { useOperacionForm } from "../hooks"
import { OperacionProductosForm } from "./operacion-productos-form"

const FORM_ID = "operacion-exterior-form"

const ITEM_SIN_ESPECIFICAR = { value: "", label: "Sin especificar" }

const selectFieldBaseClass =
    "h-9 w-full justify-between font-normal bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-xs shadow-xs transition-colors"

interface OperacionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    products: Product[]
    sociosComerciales: SocioComercial[]
    responsable: string
}

function FieldLabel({
    children,
    required = false,
    hint,
}: {
    children: ReactNode
    required?: boolean
    hint?: string
}) {
    return (
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{children}</span>
            {required && <span className="text-destructive font-bold">*</span>}
            {hint && (
                <span className="ml-auto text-[10px] font-normal normal-case text-muted-foreground/70">
                    {hint}
                </span>
            )}
        </Label>
    )
}

function SectionLabel({
    icon: Icon,
    iconClassName,
    children,
}: {
    icon: typeof Globe2
    iconClassName?: string
    children: ReactNode
}) {
    return (
        <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Icon className={cn("size-3.5 shrink-0", iconClassName)} aria-hidden="true" />
            <span>{children}</span>
        </Label>
    )
}

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null
    return (
        <p id={id} role="alert" className="text-[11px] font-medium text-destructive mt-1">
            {message}
        </p>
    )
}

export function OperacionFormDialog({
    open,
    onOpenChange,
    products,
    sociosComerciales,
    responsable,
}: OperacionFormDialogProps) {
    const {
        methods,
        register,
        setValue,
        formState: { errors },
        lineasField,
        lineas,
        tipo,
        selectedSocioComercial,
        montos,
        isSubmitting,
        getCantidadStep,
        appendLinea,
        removeLinea,
        onSubmit,
        reset,
    } = useOperacionForm({
        products,
        sociosComerciales,
        responsable,
        onSaved: () => onOpenChange(false),
    })

    const incoterm = useWatch({ control: methods.control, name: "incoterm" })
    const medioTransporte = useWatch({
        control: methods.control,
        name: "medioTransporte",
    })

    useEffect(() => {
        if (open) reset()
    }, [open, reset])

    const socioComercialOptions = useMemo(
        () =>
            sociosComerciales.map((socio) => ({
                value: String(socio.id),
                label: `${socio.nombre} · ${socio.pais}`,
            })),
        [sociosComerciales]
    )

    const incotermOptions = useMemo(
        () => [ITEM_SIN_ESPECIFICAR, ...INCOTERMS],
        []
    )
    const transporteOptions = useMemo(
        () => [ITEM_SIN_ESPECIFICAR, ...MEDIOS_TRANSPORTE],
        []
    )

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Nueva Operación de Comercio Exterior"
            description="Registra movimientos de importación o exportación para actualizar el inventario."
            formId={FORM_ID}
            submitLabel="Registrar operación"
            isSubmitting={isSubmitting}
            className="sm:max-w-xl"
        >
            <form
                id={FORM_ID}
                noValidate
                onSubmit={onSubmit}
                className="flex flex-col gap-6"
            >
                {/* Modalidad de Operación */}
                <div className="space-y-1.5">
                    <SectionLabel icon={Globe2} iconClassName="text-info">
                        Modalidad de Operación
                    </SectionLabel>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1.5 border border-border/60">
                        <button
                            type="button"
                            onClick={() =>
                                setValue("tipo", "importacion", { shouldValidate: true })
                            }
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer",
                                tipo === "importacion"
                                    ? "bg-background text-foreground shadow-xs border border-border/80"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Importación
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setValue("tipo", "exportacion", { shouldValidate: true })
                            }
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer",
                                tipo === "exportacion"
                                    ? "bg-background text-foreground shadow-xs border border-border/80"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Exportación
                        </button>
                    </div>
                    <FieldError
                        id="operacion-exterior-tipo-error"
                        message={errors.tipo?.message}
                    />
                </div>

                {/* Socio Comercial */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <SectionLabel icon={Landmark} iconClassName="text-primary">
                            Socio Comercial
                        </SectionLabel>
                        {selectedSocioComercial && (
                            <Badge
                                variant="outline"
                                className="border-border bg-muted/50 text-foreground text-[10px] font-medium"
                            >
                                🌎 {selectedSocioComercial.pais}
                            </Badge>
                        )}
                    </div>
                    <SearchableSelect
                        value={selectedSocioComercial ? String(selectedSocioComercial.id) : ""}
                        onValueChange={(value) =>
                            setValue("socioComercialId", Number(value), {
                                shouldValidate: true,
                            })
                        }
                        options={socioComercialOptions}
                        placeholder="Buscar o seleccionar socio comercial..."
                        searchPlaceholder="Buscar por nombre o país..."
                        emptyText="Sin socios comerciales disponibles"
                        ariaLabel="Socio comercial"
                        ariaInvalid={!!errors.socioComercialId}
                        ariaDescribedby={
                            errors.socioComercialId
                                ? "operacion-exterior-socio-comercial-error"
                                : undefined
                        }
                        triggerClassName="w-full h-9 text-xs shadow-xs"
                    />
                    <FieldError
                        id="operacion-exterior-socio-comercial-error"
                        message={errors.socioComercialId?.message}
                    />
                </div>

                {/* Detalles de Despacho */}
                <div className="space-y-3">
                    <SectionLabel icon={PackageCheck} iconClassName="text-success">
                        Detalles de Despacho
                    </SectionLabel>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <FieldLabel>
                                Incoterm <span className="font-normal text-muted-foreground/70 normal-case">(opcional)</span>
                            </FieldLabel>
                            <Select
                                value={incoterm}
                                onValueChange={(value) =>
                                    setValue("incoterm", value || undefined)
                                }
                                items={incotermOptions}
                            >
                                <SelectTrigger
                                    id="operacion-exterior-incoterm"
                                    className={cn(selectFieldBaseClass, "justify-start")}
                                >
                                    <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                                <SelectContent align="start">
                                    {incotermOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel>
                                Transporte <span className="font-normal text-muted-foreground/70 normal-case">(opcional)</span>
                            </FieldLabel>
                            <Select
                                value={medioTransporte}
                                onValueChange={(value) =>
                                    setValue("medioTransporte", value || undefined)
                                }
                                items={transporteOptions}
                            >
                                <SelectTrigger
                                    id="operacion-exterior-transporte"
                                    className={cn(selectFieldBaseClass, "justify-start")}
                                >
                                    <SelectValue placeholder="Sin especificar" />
                                </SelectTrigger>
                                <SelectContent align="start">
                                    {transporteOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <FieldLabel required hint="US$ → S/">
                                Tipo de Cambio
                            </FieldLabel>
                            <Input
                                id="operacion-exterior-tipo-cambio"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="3.75"
                                aria-invalid={errors.tipoCambio ? true : undefined}
                                aria-describedby={
                                    errors.tipoCambio
                                        ? "operacion-exterior-tipo-cambio-error"
                                        : "operacion-exterior-tipo-cambio-hint"
                                }
                                className="h-9 text-xs shadow-xs bg-background"
                                {...register("tipoCambio", {
                                    valueAsNumber: true,
                                })}
                            />
                            <FieldError
                                id="operacion-exterior-tipo-cambio-error"
                                message={errors.tipoCambio?.message}
                            />
                        </div>
                    </div>
                </div>

                {/* Editor de Ítems / Productos */}
                <OperacionProductosForm
                    products={products}
                    tipo={tipo}
                    lineas={lineas}
                    fields={lineasField.fields}
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    montos={montos}
                    getCantidadStep={getCantidadStep}
                    onAppend={appendLinea}
                    onRemove={removeLinea}
                />

                {/* Observaciones */}
                <div className="space-y-1.5">
                    <SectionLabel icon={FileText} iconClassName="text-warning">
                        Observaciones y Notas <span className="font-normal text-muted-foreground/70 normal-case">(opcional)</span>
                    </SectionLabel>
                    <Textarea
                        id="operacion-exterior-notas"
                        rows={2}
                        placeholder="Observaciones de la carga, número de contenedor, etc..."
                        className="resize-none text-xs bg-background shadow-xs focus-visible:ring-1 focus-visible:ring-primary"
                        {...register("notas")}
                    />
                </div>
            </form>
        </FormDialog>
    )
}