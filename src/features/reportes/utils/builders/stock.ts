import { Boxes, TrendingUp, Trophy, Wallet } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { round2 } from "@/features/inventario/utils"

import type { Product } from "@/types/products"

import { col, formatNumero, formatPorcentaje, porcentaje } from "../formato"
import { getUnitSymbol } from "@/lib/units"

import type {
    DatosReportes,
    ReporteResuelto,
    StatReporte,
    TablaReporte,
} from "../../types"

export function construirStock(datos: DatosReportes): ReporteResuelto {
    const productos = datos.productos

    const enStock = (producto: Product) =>
        producto.isActive && producto.currentStock > producto.minStockAlert

    const valorizado = (producto: Product) => producto.currentStock * producto.costPrice

    const detalle = productos.filter(enStock).sort((a, b) => valorizado(b) - valorizado(a))
    const valorTotal = detalle.reduce((sum, p) => sum + valorizado(p), 0)

    const piezasTotales = detalle.reduce((sum, p) => sum + p.currentStock, 0)
    const potencial = detalle.reduce((sum, p) => {
        const vendidos = datos.ventas
            .filter((venta) => venta.items.some((item) => item.productId === p.id))
            .reduce((total, venta) => total + venta.total, 0)

        return sum + vendidos * p.currentStock
    }, 0)

    const masValioso = detalle[0]
    const totalVenta = datos.ventas.reduce((sum, venta) => sum + venta.total, 0)
    const margen = round2(masValioso ? masValioso.salePrice - masValioso.costPrice : 0)

    const stats: StatReporte[] = [
        {
            label: "Productos en stock",
            value: formatNumero(detalle.length, 0),
            sublabel: "de " + formatNumero(productos.length, 0) + " registrados",
            icon: Boxes,
            tone: "violet",
        },
        {
            label: "Valor de inventario",
            value: formatCurrency(round2(valorTotal)),
            sublabel: `${formatNumero(round2(piezasTotales))} piezas en total`,
            icon: Wallet,
            tone: "slate",
        },
        {
            label: "Potencial de venta",
            value: formatCurrency(round2(potencial)),
            sublabel: `${formatPorcentaje(porcentaje(potencial, totalVenta))} del total vendido`,
            icon: TrendingUp,
            tone: "amber",
        },
        {
            label: "Más valioso",
            value: masValioso?.name ?? "—",
            sublabel: `${formatCurrency(margen)} de margen por unidad`,
            icon: Trophy,
            tone: "rose",
        },
    ]

    const tabla: TablaReporte = {
        columnas: [
            col("categoria", "Categoría", "texto", 1.8),
            col("producto", "Producto", "texto", 2.6),
            col("sku", "SKU", "texto", 1.4),
            col("stock", `Stock (${getUnitSymbol("UNIDAD")})`, "numero"),
            col("minimo", "Mínimo", "numero"),
            col("ventas", "Piezas vendidas", "numero"),
            col("velocidad", "Salidas por día", "numero"),
            col("estado", "Estado", "texto"),
            col("valor", "Valor de stock", "moneda"),
        ],
        filas: detalle.map((producto) => {
            const vendidas = datos.ventas
                .filter((venta) => venta.items.some((item) => item.productId === producto.id))
                .reduce(
                    (total, venta) =>
                        total +
                        venta.items
                            .filter((item) => item.productId === producto.id)
                            .reduce((sum, item) => sum + item.quantity, 0),
                    0
                )

            const dias = 30
            const velocidad = vendidas > 0 ? round2(vendidas / dias) : 0

            const categoria = datos.categorias.find((c) => c.id === producto.categoryId)

            return {
                categoria: categoria?.name ?? "—",
                producto: producto.name,
                sku: producto.sku,
                stock: round2(producto.currentStock),
                minimo: round2(producto.minStockAlert),
                ventas: round2(vendidas),
                velocidad,
                estado: producto.currentStock > producto.minStockAlert ? "óptimo" : "bajo",
                valor: round2(valorizado(producto)),
            }
        }),
        totales: {
            producto: "Total",
            valor: round2(valorTotal),
        },
    }

    return {
        id: "stock",
        titulo: "Inventario en stock",
        descripcion: "Productos con existencia actual y su valorización",
        snapshot: true,
        stats,
        tabla,
    }
}