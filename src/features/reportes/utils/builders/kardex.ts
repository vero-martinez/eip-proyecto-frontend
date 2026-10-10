import { ArrowDownLeft, ArrowUpRight, ClipboardList, Trash2 } from "lucide-react"

import { formatDate } from "@/lib/utils"
import { round2 } from "@/features/inventario/utils"

import type { MovementType } from "@/features/movimientos/types"

import { col, formatNumero } from "../formato"
import { enRango, formatRango } from "../fechas"
import { piezasMovimiento, signoMovimiento } from "../movimientos"

import type {
    DatosReportes,
    RangoFechas,
    ReporteResuelto,
    StatReporte,
    TablaReporte,
} from "../../types"

export function construirKardex(datos: DatosReportes, rango: RangoFechas): ReporteResuelto {
    const enPeriodo = datos.movimientos.filter((mov) => enRango(mov.createdAt, rango))

    // El kardex se lee en orden cronológico.
    const filas = enPeriodo.sort(
        (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
            a.id - b.id
    )

    const piezasDe = (tipos: MovementType[]) =>
        filas
            .filter((mov) => tipos.includes(mov.movementType))
            .reduce((sum, mov) => sum + piezasMovimiento(mov.quantity), 0)

    const entradas = piezasDe(["entrada", "importacion"])
    const salidas = piezasDe(["venta", "exportacion"])
    const mermas = piezasDe(["merma"])

    const stats: StatReporte[] = [
        {
            label: "Movimientos",
            value: formatNumero(filas.length, 0),
            sublabel: `${formatRango(rango)}`,
            icon: ClipboardList,
            tone: "violet",
        },
        {
            label: "Piezas que entraron",
            value: formatNumero(entradas),
            sublabel: "entradas e importaciones",
            icon: ArrowDownLeft,
            tone: "slate",
        },
        {
            label: "Piezas que salieron",
            value: formatNumero(salidas),
            sublabel: "ventas y exportaciones",
            icon: ArrowUpRight,
            tone: "amber",
        },
        {
            label: "Piezas por merma",
            value: formatNumero(mermas),
            sublabel: "pérdida de inventario",
            icon: Trash2,
            tone: "rose",
        },
    ]

    const tabla: TablaReporte = {
        columnas: [
            col("fecha", "Fecha", "texto"),
            col("tipo", "Tipo", "texto"),
            col("sku", "SKU", "texto", 1.4),
            col("producto", "Producto", "texto", 3),
            col("responsable", "Responsable", "texto", 1.6),
            col("cantidad", "Cantidad", "numero"),
            col("costo", "Costo unit.", "moneda"),
            col("precio", "Precio unit.", "moneda"),
        ],
        filas: filas.map((mov) => {
            const signo = signoMovimiento(mov.movementType)

            return {
                fecha: formatDate(mov.createdAt),
                tipo: mov.movementType,
                sku: mov.sku,
                producto: mov.productName,
                responsable: mov.responsable,
                cantidad: round2(signo * piezasMovimiento(mov.quantity)),
                costo: mov.unitCostPrice ?? null,
                precio: mov.unitSoldPrice ?? null,
            }
        }),
    }

    return {
        id: "kardex",
        titulo: "Kardex de movimientos",
        descripcion: "Entradas, salidas y saldo acumulado por producto",
        snapshot: false,
        stats,
        tabla,
    }
}