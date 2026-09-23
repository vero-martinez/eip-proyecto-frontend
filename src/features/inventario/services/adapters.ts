/**
 * Adaptador de Productos para Inventario.
 * Evita importaciones circulares (bucles A -> B -> A) entre ambos módulos.
 * Inventario pide datos mediante este contrato sin importar Productos directamente.
 */

import type { Product } from "@/types/products"

/** Define qué funciones necesita Inventario del módulo de Productos. */
export interface ProductsAdapter {
    obtenerProductos: () => Promise<Product[]>
    obtenerProducto: (productId: number) => Promise<Product>
    actualizarStock: (
        productId: number,
        patch: Partial<Pick<Product, "currentStock" | "costPrice">>
    ) => Promise<void>
    crearProducto: (
        producto: Omit<Product, "id" | "createdAt">
    ) => Promise<Product>
}

let adapter: ProductsAdapter | null = null

/** Recibe y guarda las funciones reales que le envía el módulo de Productos. */
export function configurarAdapters(productsAdapter: ProductsAdapter): void {
    adapter = productsAdapter
}

/** Retorna el adaptador listo para usar o lo carga de fondo si aún no se registró. */
async function resolverAdapter(): Promise<ProductsAdapter> {
    if (adapter) return adapter
    await import("@/features/products/services/products.service")
    if (!adapter) {
        throw new Error("El módulo de productos no registró sus adapters")
    }
    return adapter
}

/** Obtiene la lista completa de productos. */
export async function obtenerProductosService(): Promise<Product[]> {
    return (await resolverAdapter()).obtenerProductos()
}

/** Obtiene los datos de un solo producto por su ID. */
export async function obtenerProductoService(
    productId: number
): Promise<Product> {
    return (await resolverAdapter()).obtenerProducto(productId)
}

/** Modifica el stock o costo de un producto. */
export async function actualizarStockService(
    productId: number,
    patch: Partial<Pick<Product, "currentStock" | "costPrice">>
): Promise<void> {
    await (await resolverAdapter()).actualizarStock(productId, patch)
}

/** Registra un nuevo producto en el sistema. */
export async function crearProductoService(
    producto: Omit<Product, "id" | "createdAt">
): Promise<Product> {
    return (await resolverAdapter()).crearProducto(producto)
}