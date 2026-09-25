/**
 * Tipos e interfaces principales para el módulo de Comercio Exterior.
 */

import type { Product } from "@/types/products"

// --- CONSTANTES Y TIPOS BÁSICOS ---

// Opciones válidas para el tipo de operación ("importacion" o "exportacion")
export const TIPO_OPERACION_VALUES = ["importacion", "exportacion"] as const

// Tipo derivado para limitar los valores de operación
export type TipoOperacion = (typeof TIPO_OPERACION_VALUES)[number]

// --- INTERFACES DE ENTIDADES ---

// Datos del cliente (exportación) o proveedor (importación)
export interface SocioComercial {
    id: number
    nombre: string
    pais: string
}

// Detalle de un producto dentro de una operación
export interface LineaOperacion {
    producto: Pick<Product, "id" | "name" | "sku" | "unitType">
    cantidad: number
    precioUSD: number
    subtotalUSD: number
}

// Registro completo de una operación de importación o exportación
export interface OperacionComercioExterior {
    id: number
    folio: string
    fecha: string
    tipo: TipoOperacion
    socioComercial: Pick<SocioComercial, "id" | "nombre" | "pais">
    incoterm?: string
    medioTransporte?: string
    tipoCambio: number
    lineas: LineaOperacion[]
    subtotalUSD: number
    totalUSD: number
    totalPEN: number
    responsable: string
    notas?: string
    createdAt: string
}

// Estructura para los totales y métricas generales del historial
export interface ComercioExteriorResumen {
    total: number
    importaciones: number
    exportaciones: number
    totalUSD: number
    invertidoUSD: number
    exportadoUSD: number
}