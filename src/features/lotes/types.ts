/** Tipos del módulo de Lotes (gestión de stock e inventario). */

export type OrigenLote =
  | "apertura"
  | "entrada"
  | "compra"
  | "importacion"
  | "ajuste"

export type LoteEstado = "activo" | "anulado"

export interface Proveedor {
  id: number
  name: string
  pais: string
}

/** Snapshot del proveedor guardado en el lote. */
export type LoteProveedor = Pick<Proveedor, "id" | "name">

export interface LotesFilters {
  productId?: number
  estado?: LoteEstado
  origen?: OrigenLote
}

/** Datos requeridos para registrar un nuevo lote. */
export interface LoteRequest {
  productId: number
  cantidad: number
  origen: OrigenLote
  responsable: string
  costoUnitarioSoles?: number
  proveedor?: LoteProveedor
  codigo?: string
  fechaIngreso?: string
  pais?: string
  contraparte?: string
  operacionId?: number
  costoUnitarioUSD?: number
  tipoCambio?: number
}

/** Representación de un lote guardado en el sistema. */
export interface LoteKardex {
  id: number
  productId: number
  codigo?: string
  origen: OrigenLote
  cantidadInicial: number
  cantidadDisponible: number
  costoUnitarioSoles: number
  costoUnitarioUSD?: number
  tipoCambio?: number
  proveedor?: LoteProveedor
  pais?: string
  contraparte?: string
  operacionId?: number
  responsable: string
  fechaIngreso: string
  estado: LoteEstado
  anuladoAt?: string
}

/** Detalle del descuento de inventario y costo por lote. */
export interface ConsumoDetalle {
  loteId: number
  cantidad: number
  costoUnitarioSoles: number
}