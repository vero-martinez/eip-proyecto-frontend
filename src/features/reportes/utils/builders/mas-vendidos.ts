import { Boxes, ShoppingCart, TrendingUp, Wallet } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { round2 } from "@/features/inventario/utils"

import { col, formatNumero, formatPorcentaje, porcentaje } from "../formato"
import { enRango } from "../fechas"

import type {
    DatosReportes,
    RangoFechas,
    ReporteResuelto,
    StatReporte,
    TablaReporte,
} from "../../types"

export function construirMasVendidos(
    datos: DatosReportes,
    rango: RangoFechas
): ReporteResuelto {
    const ventas = datos.ventas.filter((venta) => enRango(venta.createdAt, rango))
    const productos = datos.productos

    const conteo = new Map<number, number>()

    for (const venta of ventas) {
        for (const item of venta.items) {
            conteo.set(item.productId, (conteo.get(item.productId) ?? 0) + item.quantity)
        }
    }

    const piezasVendidas = [...conteo.values()].reduce((sum, v) => sum + v, 0)

    const detalle = productos
        .filter((producto) => conteo.has(producto.id))
        .sort((a, b) => (conteo.get(b.id) ?? 0) - (conteo.get(a.id) ?? 0))

    const compras = detalle.reduce(
        (sum, det) => sum + det.costPrice * (conteo.get(det.id) ?? 0),
        0
    )
    const margenTotal = ventas.reduce((sum, v) => sum + v.total, 0) - compras
    const totalIngreso = ventas.reduce((sum, v) => sum + v.total, 0)

    const stats: StatReporte[] = [
        {
            label: "Productos vendidos",
            value: formatNumero(detalle.length, 0),
            sublabel: "con movimiento en el periodo",
            icon: Boxes,
            tone: "violet",
        },
        {
            label: "Piezas vendidas",
            value: formatNumero(piezasVendidas),
            sublabel: "sumando todas las ventas",
            icon: ShoppingCart,
            tone: "slate",
        },
        {
            label: "Margen estimado",
            value: formatCurrency(round2(margenTotal)),
            sublabel: `${formatPorcentaje(porcentaje(margenTotal, totalIngreso))} de margen`,
            icon: TrendingUp,
            tone: "amber",
        },
        {
            label: "Margen por unidad",
            value: formatCurrency(
                round2((detalle[0]?.salePrice ?? 0) - (detalle[0]?.costPrice ?? 0))
            ),
            sublabel: "del producto más vendido",
            icon: Wallet,
            tone: "rose",
        },
    ]

    const tabla: TablaReporte = {
        columnas: [
            col("producto", "Producto", "texto", 3),
            col("vendidos", "Piezas vendidas", "numero"),
            col("costo", "Costo unit.", "moneda"),
            col("precio", "Precio unit.", "moneda"),
            col("margen", "Margen unit.", "moneda"),
            col("ingreso", "Ingreso", "moneda"),
        ],
        filas: detalle.map((producto) => {
            const cantidad = conteo.get(producto.id) ?? 0
            const margen = producto.salePrice - producto.costPrice

            return {
                producto: producto.name,
                vendidos: round2(cantidad),
                costo: producto.costPrice,
                precio: producto.salePrice,
                margen: round2(margen),
                ingreso: round2(cantidad * producto.salePrice),
            }
        }),
        totales: {
            producto: "Total",
            vendidos: round2(piezasVendidas),
            ingreso: round2(totalIngreso),
        },
    }

    return {
        id: "mas-vendidos",
        titulo: "Productos más vendidos",
        descripcion: "Ranking por piezas vendidas, con margen estimado",
        snapshot: false,
        stats,
        tabla,
    }
}