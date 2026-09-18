/**
 * Servicio de Productos con datos mock.
 * Simula las operaciones CRUD y categorías hasta tener el backend real.
 * Luego las funciones se reemplazarán por llamadas a la API con Axios.
 */

import { Product, Category } from "@/types/products"

// ===== Mock data =====

const MOCK_CATEGORIES: Category[] = [
    { id: 1, parentId: null, name: "MINERALES NATURALES", description: null },
    { id: 2, parentId: null, name: "CUARZOS Y CRISTALES", description: null },
    { id: 3, parentId: null, name: "PIEDRAS SEMIPRECIOSAS", description: null },
    { id: 4, parentId: null, name: "JOYERÍA", description: null },
    { id: 5, parentId: null, name: "DECORACIÓN", description: null },
    { id: 6, parentId: null, name: "PRODUCTOS PARA EXPORTACIÓN", description: null },

    { id: 9, parentId: 1, name: "Minerales metálicos", description: null },
    { id: 11, parentId: 2, name: "Amatistas", description: null },
    { id: 12, parentId: 2, name: "Citrinos", description: null },
    { id: 24, parentId: 4, name: "Anillos", description: null },
    { id: 27, parentId: 4, name: "Pulseras", description: null },
]

let MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        categoryId: 27,
        sku: "PUL-AMAT-8MM",
        name: "Pulsera Amatista 8mm",
        unitType: "UNIDAD",
        salePrice: 25.0,
        costPrice: 8.0,
        currentStock: 40,
        minStockAlert: 10,
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
    {
        id: 2,
        categoryId: 9,
        sku: "PIR-BRUTO-KG",
        name: "Pirita Metálica en Bruto",
        unitType: "KILOGRAMO",
        salePrice: 45.0,
        costPrice: 18.0,
        currentStock: 85.5,
        minStockAlert: 15,
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
    {
        id: 3,
        categoryId: 6,
        sku: "EXP-PIRITA-L",
        name: "Lote Pirita Exportación",
        unitType: "KILOGRAMO",
        salePrice: 60.0,
        costPrice: 22.0,
        currentStock: 250,
        minStockAlert: 40,
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
    {
        id: 4,
        categoryId: 11,
        sku: "EIP-0001",
        name: "Amatista pulida S",
        unitType: "UNIDAD",
        salePrice: 60.0,
        costPrice: 20.0,
        currentStock: 12,
        minStockAlert: 5,
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
    {
        id: 5,
        categoryId: 11,
        sku: "EIP-0002",
        name: "Amatista pulida M",
        unitType: "UNIDAD",
        salePrice: 85.0,
        costPrice: 30.0,
        currentStock: 3,
        minStockAlert: 5,
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
    {
        id: 6,
        categoryId: 24,
        sku: "EIP-0007",
        name: "Anillo citrino plata",
        unitType: "UNIDAD",
        salePrice: 70.0,
        costPrice: 25.0,
        currentStock: 9,
        minStockAlert: 3,
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
    {
        id: 7,
        categoryId: 12,
        sku: "EIP-0008",
        name: "Pulsera citrino 8mm",
        unitType: "UNIDAD",
        salePrice: 30.0,
        costPrice: 10.0,
        currentStock: 2,
        minStockAlert: 5,
        isActive: true,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
    {
        id: 8,
        categoryId: 9,
        sku: "EIP-0005",
        name: "Pirita natural bruta",
        unitType: "UNIDAD",
        salePrice: 75.0,
        costPrice: 28.0,
        currentStock: 0,
        minStockAlert: 5,
        isActive: false,
        createdAt: "2026-09-12T04:21:22.600Z",
    },
]

// Simula la latencia (demora) de una llamada real a la API.
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Service =====

/**
 * Lista todos los productos.
 */
export async function getProductsService(): Promise<Product[]> {
    await delay()
    return [...MOCK_PRODUCTS]
}

/**
 * Obtiene un producto por id. Lanza error si no existe
 * (simulando un 404 del backend).
 */
export async function getProductByIdService(id: number): Promise<Product> {
    await delay()
    const product = MOCK_PRODUCTS.find((p) => p.id === id)
    if (!product) throw new Error("Producto no encontrado")
    return product
}

/**
 * Crea un producto nuevo. Genera un id incremental y una fecha
 * de creación, simulando lo que haría la base de datos.
 */
export async function createProductService(
    data: Omit<Product, "id" | "createdAt">
): Promise<Product> {
    await delay()
    const newProduct: Product = {
        ...data,
        id: Math.max(...MOCK_PRODUCTS.map((p) => p.id)) + 1,
        createdAt: new Date().toISOString(),
    }
    MOCK_PRODUCTS = [...MOCK_PRODUCTS, newProduct]
    return newProduct
}

/**
 * Actualiza un producto existente.
 */
export async function updateProductService(
    id: number,
    data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product> {
    await delay()
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Producto no encontrado")

    MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...data }
    return MOCK_PRODUCTS[index]
}

/**
 * Elimina un producto por id.
 */
export async function deleteProductService(id: number): Promise<void> {
    await delay()
    const exists = MOCK_PRODUCTS.some((p) => p.id === id)
    if (!exists) throw new Error("Producto no encontrado")

    MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== id)
}

/**
 * Lista todas las categorías (para el selector del formulario
 * y para resolver nombres en la tabla).
 */
export async function getCategoriesService(): Promise<Category[]> {
    await delay()
    return [...MOCK_CATEGORIES]
}

/**
 * Ajusta el stock actual de un producto por un delta (positivo o
 * negativo), sin dejarlo por debajo de 0. En el backend real lo
 * resolverá el endpoint de entradas de forma atómica; acá se mantiene
 * desacoplado para que los módulos compartan el mismo stock en memoria.
 */
export async function adjustProductStockService(
    id: number,
    delta: number
): Promise<Product> {
    await delay(200)
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Producto no encontrado")

    const current = MOCK_PRODUCTS[index]
    MOCK_PRODUCTS[index] = {
        ...current,
        currentStock: Math.max(0, current.currentStock + delta),
    }
    return MOCK_PRODUCTS[index]
}