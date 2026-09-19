"use client"

/**
 * Página del Punto de Venta (admin y vendedor).
 *
 * Container: junta los hooks de datos (useProducts, useCategories), los
 * filtros del catálogo (useCatalogFilters), el carrito (useVentaCart) y
 * el registro de venta (useRegisterVenta), y arma los componentes del
 * POS con el usuario logueado como responsable de la venta.
 *
 * Layout responsive: en desktop el carrito queda fijo a la derecha
 * (lg:grid de dos columnas). En mobile el catálogo ocupa toda la
 * pantalla y el carrito vive detrás de una barra inferior fija con el
 * resumen (cantidad de productos + total) que abre un panel con el
 * carrito completo — así se puede seguir agregando productos sin
 * scrollear de vuelta cada vez que se quiere revisar el carrito.
 */

import { useState } from "react"
import { AlertTriangle, Loader2, RefreshCw, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/features/products/hooks/use-products"
import { useCategories } from "@/features/products/hooks/use-categories"
import { useCatalogFilters } from "@/features/products/hooks/use-catalog-filters"
import { PosToolbar } from "@/features/ventas/components/pos-toolbar"
import { PosProductGrid } from "@/features/ventas/components/pos-product-grid"
import { VentaCart } from "@/features/ventas/components/venta-cart"
import { ScanDialog } from "@/features/ventas/components/scan-dialog"
import { useVentaCart } from "@/features/ventas/hooks/use-venta-cart"
import { useRegisterVenta } from "@/features/ventas/hooks/use-register-venta"
import { VentaBoletaDialog } from "@/features/ventas/components/boleta-dialog"
import type { Venta } from "@/features/ventas/types"

export default function VentasPage() {
    const { usuario } = useAuth()
    const responsable = usuario?.nombre ?? "Sin asignar"

    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        refetch: refetchProducts,
    } = useProducts()
    const {
        data: categories,
        isLoading: isLoadingCategories,
        isError: isErrorCategories,
        refetch: refetchCategories,
    } = useCategories()

    const productList = products ?? []
    const categoryList = categories ?? []

    // ===== Estado del POS (hooks incondicionales) =====
    const cart = useVentaCart(productList)
    const registerVenta = useRegisterVenta()
    const filters = useCatalogFilters(productList, categoryList)
    const [scanOpen, setScanOpen] = useState(false)
    const [cartSheetOpen, setCartSheetOpen] = useState(false)
    const [boletaVenta, setBoletaVenta] = useState<Venta | null>(null)

    const handleConfirmSale = () => {
        const pagoData = cart.getPagoData()
        if (cart.items.length === 0 || !pagoData.tipoVenta || !pagoData.metodoPago) {
            toast.error("Completa el pago antes de confirmar la venta")
            return
        }

        const pagoConRaw = pagoData.pagoCon
        const pagoCon =
            pagoData.metodoPago === "efectivo" &&
            pagoConRaw !== undefined &&
            pagoConRaw !== "" &&
            pagoConRaw !== null
                ? Number(pagoConRaw)
                : undefined
        const vuelto =
            pagoCon !== undefined && pagoCon >= cart.totals.total
                ? Math.round((pagoCon - cart.totals.total) * 100) / 100
                : undefined

        registerVenta.mutate(
            {
                items: cart.items,
                tipoVenta: pagoData.tipoVenta,
                metodoPago: pagoData.metodoPago,
                responsable,
                pagoCon,
                vuelto,
            },
            {
                onSuccess: (data) => {
                    toast.success("Venta registrada correctamente")
                    setBoletaVenta(data)
                    cart.resetCart()
                    setCartSheetOpen(false)
                },
                onError: (error) => {
                    toast.error(error.message)
                },
            }
        )
    }

    const handleScannedProduct = (product: Parameters<typeof cart.addItem>[0]) => {
        cart.addItem(product)
        toast.success(`${product.name} agregado al carrito`)
    }

    // ===== Estados de error/carga accesibles =====
    if (isErrorProducts || isErrorCategories) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                className="flex h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground"
            >
                <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">
                    No se pudieron cargar los productos.
                </p>
                <p className="text-xs text-muted-foreground">
                    Ocurrió un problema al conectar con el servidor.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        refetchProducts()
                        refetchCategories()
                    }}
                    className="mt-2 gap-2"
                >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Reintentar</span>
                </Button>
            </div>
        )
    }

    if (isLoadingProducts || isLoadingCategories) {
        return (
            <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground"
            >
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm">Cargando punto de venta...</span>
            </div>
        )
    }

    const cartProps = {
        items: cart.items,
        totals: cart.totals,
        step: cart.step,
        isSubmitting: registerVenta.isPending,
        pagoMethods: cart.pagoMethods,
        onIncrement: cart.incrementItem,
        onDecrement: cart.decrementItem,
        onSetQuantity: cart.setQuantity,
        onRemove: cart.removeItem,
        onClear: cart.clearItems,
        onGoNext: cart.goNext,
        onGoBack: cart.goBack,
        onConfirmPago: cart.confirmPago,
        onSubmitVenta: handleConfirmSale,
    }

    return (
        <main className="flex flex-col gap-6 pb-20 lg:pb-0">
            <h1 className="sr-only">Punto de Venta</h1>

            <PosToolbar
                categories={categoryList}
                search={filters.search}
                rootCategoryId={filters.rootCategoryId}
                subcategoryId={filters.subcategoryId}
                totalCount={filters.totalCount}
                hasActiveFilters={filters.hasActiveFilters}
                onSearchChange={filters.setSearch}
                onRootCategoryChange={filters.setRootCategoryId}
                onSubcategoryChange={filters.setSubcategoryId}
                onClearFilters={filters.clearFilters}
                onScan={() => setScanOpen(true)}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                {/* Cátalogo vendible: siempre visible, no compite con el carrito por espacio en mobile */}
                <PosProductGrid
                    products={filters.pageItems}
                    categories={categoryList}
                    totalCount={filters.totalCount}
                    page={filters.page}
                    pageCount={filters.pageCount}
                    rangeStart={filters.rangeStart}
                    rangeEnd={filters.rangeEnd}
                    onPageChange={filters.goToPage}
                    onAdd={cart.addItem}
                />

                {/* Carrito de venta: fijo a la derecha solo en desktop */}
                <div className="hidden lg:block">
                    <VentaCart {...cartProps} />
                </div>
            </div>

            {/* Barra de carrito en mobile: resumen fijo abajo que abre el carrito completo */}
            {cart.items.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setCartSheetOpen(true)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform active:scale-[0.99]"
                    >
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <ShoppingCart className="size-4" aria-hidden="true" />
                            {cart.totals.itemsCount} producto
                            {cart.totals.itemsCount !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-base font-bold tabular-nums">
                                {formatCurrency(cart.totals.total)}
                            </span>
                            <span className="text-xs font-medium opacity-80">Ver carrito</span>
                        </span>
                    </button>
                </div>
            )}

            <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
                <SheetContent
                    side="bottom"
                    className="max-h-[92vh] overflow-y-auto rounded-t-2xl p-0 lg:hidden"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Carrito de venta</SheetTitle>
                    </SheetHeader>
                    <VentaCart {...cartProps} />
                </SheetContent>
            </Sheet>

            <ScanDialog
                open={scanOpen}
                onOpenChange={setScanOpen}
                products={productList}
                onProductScanned={handleScannedProduct}
            />

            <VentaBoletaDialog
                venta={boletaVenta}
                onOpenChange={(open) => {
                    if (!open) setBoletaVenta(null)
                }}
            />
        </main>
    )
}