/**
 * Constantes y catálogos para el módulo de Comercio Exterior.
 */

import type { TipoOperacion } from "./types"

// --- CONFIGURACIÓN GENERAL ---

// Tipo de cambio base de dólares (USD) a soles (PEN)
export const TIPO_CAMBIO_DEFAULT = 3.75

// --- TIPO DE OPERACIÓN Y ESTILOS ---

// Lista de tipos de operación para selectores y listas
export const TIPO_OPERACION_ITEMS: {
    value: TipoOperacion
    label: string
}[] = [
    { value: "importacion", label: "Importación" },
    { value: "exportacion", label: "Exportación" },
]

// Estilos de colores (Tailwind) para las etiquetas según el tipo de operación
export const TIPO_OPERACION_TINT: Record<TipoOperacion, string> = {
    importacion: "bg-info/10 text-info border-info/50!",
    exportacion: "bg-primary/10 text-primary border-primary/50!",
}

// --- CATÁLOGOS ---

// Lista de Incoterms disponibles para comercio internacional
export const INCOTERMS: { value: string; label: string }[] = [
    { value: "EXW", label: "EXW · En fábrica" },
    { value: "FOB", label: "FOB · Franco a bordo" },
    { value: "CIF", label: "CIF · Costo, seguro y flete" },
    { value: "DAP", label: "DAP · Entregado en destino" },
    { value: "DDP", label: "DDP · Con derechos pagados" },
]

// Vías de transporte internacional
export const MEDIOS_TRANSPORTE: { value: string; label: string }[] = [
    { value: "maritimo", label: "Marítimo" },
    { value: "aereo", label: "Aéreo" },
    { value: "terrestre", label: "Terrestre" },
]