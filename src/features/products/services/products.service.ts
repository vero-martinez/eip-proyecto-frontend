/**
 * Servicio de Productos contra la API de FastAPI.
 *
 * Stock y costo son calculados por el backend.
 */

import api from "@/lib/axios"
import type { Category, Product } from "@/types/products"

// ===== Tipos =====

/** Datos para crear un producto. */
export type ProductCreateData = Omit<
    Product,
    "id" | "createdAt" | "costPrice" | "currentStock"
>

/** Datos para actualizar un producto. */
export type ProductUpdateData = Partial<ProductCreateData>

// ===== Productos =====

/** Lista los productos. */
export async function getProductsService(): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/productos")
    return data
}

/** Obtiene un producto por ID. */
export async function getProductByIdService(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/productos/${id}`)
    return data
}

/** Crea un producto. */
export async function createProductService(
    data: ProductCreateData
): Promise<Product> {
    const { data: created } = await api.post<Product>("/productos", data)
    return created
}

/** Actualiza un producto. */
export async function updateProductService(
    id: number,
    data: ProductUpdateData
): Promise<Product> {
    const { data: updated } = await api.put<Product>(`/productos/${id}`, data)
    return updated
}

/** Elimina un producto. */
export async function deleteProductService(id: number): Promise<void> {
    await api.delete(`/productos/${id}`)
}

// ===== Categorías =====

/** Lista las categorías. */
export async function getCategoriesService(): Promise<Category[]> {
    const { data } = await api.get<Category[]>("/categorias")
    return data
}
