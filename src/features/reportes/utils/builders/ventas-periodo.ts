import { Boxes, TrendingUp, Trophy, Wallet } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { round2 } from "@/features/inventario/utils"

import { col, formatNumero, porcentaje } from "../formato"
import { enRango } from "../fechas"
import { clavePeriodo, etiquetaPeriodo } from "../periodos"

import type {
    DatosReportes,
    Granularidad,
    RangoFechas,
    ReporteResuelto,
    StatReporte,
    TablaReporte,
} from "../../types"

export function construirVentasPeriodo(
    datos: DatosReportes,
    rango: RangoFechas,
    granularidad: Granularidad
): ReporteResuelto {
    const ventas = datos.ventas.filter((venta) => enRango(venta.createdAt, rango))

    const porPeriodo = new Map<string, { ventas: number; piezas: number; operaciones: number }>()

    for (const venta of ventas) {
        const clave = clavePeriodo(venta.createdAt, granularidad)

        const actual = porPeriodo.get(clave) ?? { ventas: 0, piezas: 0, operaciones: 0 }

        actual.ventas += venta.total
        actual.piezas += venta.items.reduce((sum, item) => sum + item.quantity, 0)
        actual.operaciones += 1
        porPeriodo.set(clave, actual)
    }

    const detalle = [...porPeriodo.entries()].sort(
        (a, b) => b[0].localeCompare(a[0])
    )

    const totalVentas = detalle.reduce((sum, [, p]) => sum + p.ventas, 0)
    const mejorPeriodo =
        detalle.find(([, p]) => p.ventas === Math.max(...detalle.map(([, p]) => p.ventas))) ??
        null

    const stats: StatReporte[] = [
        {
            label: "Periodos",
            value: formatNumero(detalle.length, 0),
            sublabel: `en ${granularidad === "dia" ? "días" : granularidad === "semana" ? "semanas" : "meses"}`,
            icon: Boxes,
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
            label: "Ticket promedio",
            value: formatCurrency(
                round2(
                    detalle.reduce((sum, [, p]) => sum + p.ventas, 0) /
                        detalle.reduce((sum, [, p]) => sum + p.operaciones, 0)
                )
            ),
            sublabel: "por operación",
            icon: TrendingUp,
            tone: "amber",
        },
        {
            label: "Mejor periodo",
            value: mejorPeriodo ? etiquetaPeriodo(mejorPeriodo[0], granularidad) : "—",
            sublabel: mejorPeriodo
                ? `${formatCurrency(round2(mejorPeriodo[1].ventas))} · ${Math.round(
                      porcentaje(mejorPeriodo[1].ventas, totalVentas) ?? 0
                  )}% del total`
                : "sin ventas",
            icon: Trophy,
            tone: "rose",
        },
    ]

    const tabla: TablaReporte = {
        columnas: [
            col("periodo", "Periodo", "texto"),
            col("operaciones", "Operaciones", "numero"),
            col("piezas", "Piezas vendidas", "numero"),
            col("ventas", "Total ventas", "moneda"),
            col("peso", "Peso de venta", "porcentaje"),
        ],
        filas: detalle.map(([clave, periodo]) => ({
            periodo: etiquetaPeriodo(clave, granularidad),
            operaciones: periodo.operaciones,
            piezas: round2(periodo.piezas),
            ventas: round2(periodo.ventas),
            peso: Math.round(porcentaje(periodo.ventas, totalVentas) ?? 0),
        })),
        totales: {
            periodo: "Total",
            operaciones: detalle.reduce((sum, [, p]) => sum + p.operaciones, 0),
            piezas: round2(detalle.reduce((sum, [, p]) => sum + p.piezas, 0)),
            ventas: round2(totalVentas),
            peso: 100,
        },
    }

    return {
        id: "ventas-periodo",
        titulo: "Ventas por periodo",
        descripcion: "Evolución de ventas por día, semana o mes",
        snapshot: false,
        stats,
        tabla,
    }
}