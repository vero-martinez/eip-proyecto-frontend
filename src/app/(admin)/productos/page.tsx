"use client"

/**
 * Página de administración de productos (solo Admin).
 *
 * Junta los hooks de datos (useProducts, useCategories) con los
 * componentes armados en features/products: stats, tabla, y los
 * dos diálogos (crear/editar, eliminar).
 */

import { useState } from "react"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

import { DeleteDialog } from "@/components/common/delete-dialog"
import { useProducts } from "@/features/products/hooks/use-products"
import { useCategories } from "@/features/products/hooks/use-categories"
import { useDeleteProduct } from "@/features/products/hooks/use-delete-product"
import { ProductsStats } from "@/features/products/components/products-stats"
import { ProductsTable } from "@/features/products/components/products-table"
import { ProductForm } from "@/features/products/components/product-form"
import type { Product } from "@/types/products"

export default function ProductsPage() {
    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
    } = useProducts()
    const {
        data: categories,
        isLoading: isLoadingCategories,
        isError: isErrorCategories,
    } = useCategories()
    const deleteProduct = useDeleteProduct()

    const [formOpen, setFormOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState<Product | undefined>(
        undefined
    )
    const [productToDelete, setProductToDelete] = useState<Product | undefined>(
        undefined
    )

    const productList = products ?? []
    const categoryList = categories ?? []

    const handleCreate = () => {
        setProductToEdit(undefined) // sin producto = modo creación
        setFormOpen(true)
    }

    const handleEdit = (product: Product) => {
        setProductToEdit(product)
        setFormOpen(true)
    }

    const handleDelete = (product: Product) => {
        setProductToDelete(product)
        setDeleteOpen(true)
    }

    const handleFormOpenChange = (open: boolean) => {
        setFormOpen(open)
        if (!open) setProductToEdit(undefined)
    }

    const handleDeleteOpenChange = (open: boolean) => {
        setDeleteOpen(open)
        if (!open) setProductToDelete(undefined)
    }

    const handleConfirmDelete = () => {
        if (!productToDelete) return

        deleteProduct.mutate(productToDelete.id, {
            onSuccess: () => {
                toast.success("Producto eliminado correctamente")
                handleDeleteOpenChange(false)
            },
            onError: (error) => {
                toast.error(error.message)
            },
        })
    }

    if (isErrorProducts || isErrorCategories) {
        return (
            <div
                role="alert"
                className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
            >
                <AlertTriangle
                    className="size-8 text-destructive"
                    aria-hidden="true"
                />
                <p>No se pudieron cargar los productos. Intentá nuevamente.</p>
            </div>
        )
    }

    if (isLoadingProducts || isLoadingCategories) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
                Cargando productos...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <ProductsStats products={productList} />

            <div className="mt-6 sm:mt-10">
                <ProductsTable
                    products={productList}
                    categories={categoryList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                />
            </div>

            <ProductForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                product={productToEdit}
                categories={categoryList}
            />

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={handleDeleteOpenChange}
                title="¿Eliminar producto?"
                message={
                    <>
                        Esta acción no se puede deshacer. Se eliminará permanentemente{" "}
                        <span className="font-medium text-foreground">
                            {productToDelete?.name}
                        </span>{" "}
                        <span className="font-mono text-xs text-muted-foreground/80">
                            {productToDelete?.sku}
                        </span>{" "}
                        del catálogo.
                    </>
                }
                isLoading={deleteProduct.isPending}
                onConfirm={handleConfirmDelete}
            />
        </div>
    )
}