"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import type { Product } from "@/types/products"
import { pagoVentaSchema, type PagoVentaInput, type PagoVentaFormData } from "../schemas"
import type { VentaItem } from "../types"
import { computeTotals } from "../utils"

const STORAGE_KEY = "pos_venta_cart_items"

const QUANTITY_STEPS: Record<string, number> = {
    UNIDAD: 1,
    KILOGRAMO: 0.5,
}

const round2 = (value: number) => Math.round(value * 100) / 100

/**
 * Hook para la gestión del carrito y flujo del Punto de Venta (con persistencia).
 */
export function useVentaCart(products: Product[]) {
    // Carga inicial lazy desde localStorage para no bloquear la hidratación
    const [items, setItems] = useState<VentaItem[]>(() => {
        if (typeof window === "undefined") return []
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    const [step, setStep] = useState(0)

    const pagoMethods = useForm<PagoVentaInput, unknown, PagoVentaFormData>({
        resolver: zodResolver(pagoVentaSchema),
        defaultValues: { tipoVenta: "", metodoPago: "", pagoCon: "" },
    })

    // Sincroniza los ítems en localStorage ante cualquier cambio
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        } catch (error) {
            console.error("Error guardando el carrito en localStorage:", error)
        }
    }, [items])

    const totals = useMemo(() => computeTotals(items), [items])

    // --- Helpers ---
    const getStock = (productId: number) =>
        products.find((p) => p.id === productId)?.currentStock ?? 0

    const getStep = (unitType: string) => QUANTITY_STEPS[unitType] ?? 1

    // --- Acciones de Items ---
    const addItem = (product: Product) => {
        if (!product.isActive) return

        const stock = getStock(product.id)
        if (stock <= 0) {
            toast.error(`"${product.name}" no tiene stock disponible`)
            return
        }

        const existing = items.find((i) => i.productId === product.id)
        if (existing && existing.quantity >= stock) {
            toast.error(`Stock máximo alcanzado para "${product.name}"`)
            return
        }

        setItems((prev) =>
            existing
                ? prev.map((i) =>
                      i.productId === product.id
                          ? { ...i, quantity: round2(Math.min(i.quantity + 1, stock)) }
                          : i
                  )
                : [
                      ...prev,
                      {
                          productId: product.id,
                          name: product.name,
                          sku: product.sku,
                          unitType: product.unitType,
                          unitPrice: product.salePrice,
                          quantity: 1,
                      },
                  ]
        )
    }

    const incrementItem = (productId: number) => {
        const current = items.find((i) => i.productId === productId)
        if (!current) return

        const stock = getStock(productId)
        const next = round2(Math.min(current.quantity + getStep(current.unitType), stock))

        if (next <= current.quantity) {
            toast.error(`Stock máximo alcanzado para "${current.name}"`)
            return
        }

        setItems((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity: next } : i))
        )
    }

    const decrementItem = (productId: number) => {
        const current = items.find((i) => i.productId === productId)
        if (!current) return

        const next = round2(current.quantity - getStep(current.unitType))
        if (next <= 0) {
            removeItem(productId)
            return
        }

        setItems((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity: next } : i))
        )
    }

    const setQuantity = (productId: number, quantity: number) => {
        if (!Number.isFinite(quantity)) return

        const stock = getStock(productId)
        const next = round2(Math.min(Math.max(quantity, 0), stock))

        if (next === 0) {
            removeItem(productId)
            return
        }

        setItems((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity: next } : i))
        )
    }

    const removeItem = (productId: number) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId))
    }

    const clearItems = () => {
        setItems([])
        localStorage.removeItem(STORAGE_KEY)
    }

    // --- Flujo y Navegación ---
    const goNext = () => setStep((v) => Math.min(v + 1, 2))
    const goBack = () => setStep((v) => Math.max(v - 1, 0))

    const confirmPago = pagoMethods.handleSubmit((data) => {
        if (
            data.metodoPago === "efectivo" &&
            (data.pagoCon === undefined || data.pagoCon < totals.total)
        ) {
            toast.error("Ingresá un monto recibido mayor o igual al total")
            return
        }
        setStep(2)
    })

    const resetCart = () => {
        pagoMethods.reset()
        setItems([])
        setStep(0)
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        items,
        totals,
        step,
        pagoMethods,
        getPagoData: pagoMethods.getValues,
        getStock,
        addItem,
        incrementItem,
        decrementItem,
        setQuantity,
        removeItem,
        clearItems,
        goNext,
        goBack,
        confirmPago,
        resetCart,
    }
}