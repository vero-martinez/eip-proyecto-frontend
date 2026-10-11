import { Boxes, ShoppingCart, Trophy, Wallet } from "lucide-react"

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

export interface DatosVentasCanal {
    canal: string
    operaciones: number
    piezas: number
    ventas: number
}

export function construirVentasCanal(
    datos: DatosReportes,
    rango: RangoFechas
): ReporteResuelto {
    const ventas = datos.ventas.filter((venta) => enRango(venta.createdAt, rango))

    const porCanal = new Map<string, DatosVentasCanal>()

    for (const venta of ventas) {
        const actual = porCanal.get(venta.tipoVenta) ?? {
            canal: venta.tipoVenta,
            operaciones: 0,
            piezas: 0,
            ventas: 0,
        }

        actual.operaciones += 1
        actual.piezas += venta.items.reduce((sum, item) => sum + item.quantity, 0)
        actual.ventas += venta.total
        porCanal.set(venta.tipoVenta, actual)
    }

    const detalle = [...porCanal.values()].sort((a, b) => b.ventas - a.ventas)
    const totalVentas = detalle.reduce((sum, c) => sum + c.ventas, 0)
    const totalPiezas = detalle.reduce((sum, c) => sum + c.piezas, 0)
    const lider = detalle[0]

    const stats: StatReporte[] = [
        {
            label: "Canales",
            value: formatNumero(detalle.length, 0),
            sublabel: "tienda, delivery y otros",
            icon: ShoppingCart,
            tone: "violet",
        },
        {
            label: "Ventas totales",
            value: formatCurrency(round2(totalVentas)),
            sublabel: "en el periodo",
            icon: Wallet,
            tone: "slate",
        },
        {
            label: "Piezas vendidas",
            value: formatNumero(round2(totalPiezas)),
            sublabel: "sumando todos los canales",
            icon: Boxes,
            tone: "amber",
        },
        {
            label: "Canal líder",
            value: lider?.canal ?? "—",
            sublabel: lider ? `${formatPorcentaje(porcentaje(lider.ventas, totalVentas))} de las ventas` : "sin ventas",
            icon: Trophy,
            tone: "rose",
        },
    ]

    const tabla: TablaReporte = {
        columnas: [
            col("canal", "Canal de venta", "texto"),
            col("operaciones", "Operaciones", "numero"),
            col("piezas", "Piezas vendidas", "numero"),
            col("peso", "Peso de venta", "porcentaje"),
            col("ventas", "Total ventas", "moneda"),
        ],
        filas: detalle.map((canal) => ({
            canal: canal.canal,
            operaciones: canal.operaciones,
            piezas: round2(canal.piezas),
            peso: Math.round(porcentaje(canal.ventas, totalVentas) ?? 0),
            ventas: round2(canal.ventas),
        })),
        totales: {
            canal: "Total",
            operaciones: detalle.reduce((sum, c) => sum + c.operaciones, 0),
            piezas: round2(totalPiezas),
            peso: 100,
            ventas: round2(totalVentas),
        },
    }

    return {
        id: "ventas-canal",
        titulo: "Ventas por canal",
        descripcion: "Distribución de ventas entre tienda, delivery y otros",
        snapshot: false,
        stats,
        tabla,
    }
}