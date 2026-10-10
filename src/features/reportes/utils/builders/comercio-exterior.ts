import { DollarSign, Globe, TrendingUp, Wallet } from "lucide-react"

import { formatCurrency, formatDate } from "@/lib/utils"
import { round2 } from "@/features/inventario/utils"

import { col, formatNumero, formatUSD } from "../formato"
import { enRango } from "../fechas"

import type {
    DatosReportes,
    RangoFechas,
    ReporteResuelto,
    StatReporte,
    TablaReporte,
} from "../../types"

export function construirComercioExterior(
    datos: DatosReportes,
    rango: RangoFechas
): ReporteResuelto {
    const operaciones = datos.operaciones.filter((op) => enRango(op.fecha, rango))
    const totalUSD = round2(operaciones.reduce((sum, op) => sum + op.totalUSD, 0))
    const totalPEN = round2(operaciones.reduce((sum, op) => sum + op.totalPEN, 0))
    const importaciones = operaciones.filter((op) => op.tipo === "importacion")
    const exportaciones = operaciones.filter((op) => op.tipo === "exportacion")
    const tcPromedio = operaciones.length
        ? operaciones.reduce((sum, op) => sum + op.tipoCambio, 0) / operaciones.length
        : null

    const stats: StatReporte[] = [
        {
            label: "Operaciones",
            value: formatNumero(operaciones.length, 0),
            sublabel: `${importaciones.length} import. · ${exportaciones.length} export.`,
            icon: Globe,
            tone: "violet",
        },
        {
            label: "Monto en dólares",
            value: formatUSD(totalUSD),
            sublabel: "importaciones y exportaciones",
            icon: DollarSign,
            tone: "slate",
        },
        {
            label: "Monto en soles",
            value: formatCurrency(totalPEN),
            sublabel: "convertido al tipo de cambio de cada operación",
            icon: Wallet,
            tone: "amber",
        },
        {
            label: "Tipo de cambio promedio",
            value: tcPromedio === null ? "—" : `S/ ${tcPromedio.toFixed(2)}`,
            sublabel: "por dólar",
            icon: TrendingUp,
            tone: "rose",
        },
    ]

    const porSocio = new Map<
        string,
        { nombre: string; pais: string; totalUSD: number; operaciones: number }
    >()

    for (const op of operaciones) {
        const clave = `${op.socioComercial.nombre}|${op.socioComercial.pais}`

        const actual = porSocio.get(clave) ?? {
            nombre: op.socioComercial.nombre,
            pais: op.socioComercial.pais,
            totalUSD: 0,
            operaciones: 0,
        }

        actual.totalUSD = round2(actual.totalUSD + op.totalUSD)
        actual.operaciones += 1
        porSocio.set(clave, actual)
    }

    const tabla: TablaReporte = {
        columnas: [
            col("folio", "Folio", "texto", 1.4),
            col("fecha", "Fecha", "texto"),
            col("tipo", "Tipo", "texto"),
            col("socio", "Socio comercial", "texto", 2.4),
            col("pais", "País", "texto", 1.4),
            col("responsable", "Responsable", "texto", 1.6),
            col("usd", "Total USD", "usd"),
            col("pen", "Total PEN", "moneda"),
        ],
        filas: [...operaciones]
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .map((op) => ({
                folio: op.folio,
                fecha: formatDate(op.fecha),
                tipo: op.tipo,
                socio: op.socioComercial.nombre,
                pais: op.socioComercial.pais,
                responsable: op.responsable,
                usd: op.totalUSD,
                pen: op.totalPEN,
            })),
        totales: {
            folio: "Total",
            usd: totalUSD,
            pen: totalPEN,
        },
    }

    return {
        id: "comercio-exterior",
        titulo: "Comercio exterior",
        descripcion: "Importaciones y exportaciones en USD y soles",
        snapshot: false,
        stats,
        tabla,
    }
}