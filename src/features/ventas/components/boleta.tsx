"use client"

/**
 * Boleta de venta estilo ticket térmico (~80mm).
 *
 * Renderiza una boleta optimizada para impresión térmica directa en blanco y negro
 * (monocromático, alto contraste, fuentes monoespaciadas).
 * El contenedor id="boleta-print" permite que el CSS de impresión aísle solo este bloque.
 */

import { formatCurrency } from "@/lib/utils"
import { EMPRESA } from "../constants"
import type { Venta } from "../types"
import {
  formatSaleQuantity,
  formatVentaDateTime,
  getMetodoPagoLabel,
  getTipoVentaLabel,
} from "../utils"

interface FilaProps {
  label: string
  value: string
  bold?: boolean
}

function Fila({ label, value, bold }: FilaProps) {
  return (
    <p className={`flex items-baseline justify-between gap-2 ${bold ? "font-bold" : ""}`}>
      <span className="uppercase tracking-wide text-black">{label}</span>
      <span className="text-right tabular-nums text-black">{value}</span>
    </p>
  )
}

function Separador() {
  return <div aria-hidden="true" className="my-2 border-t border-dashed border-black" />
}

function Diente({ position }: { position: "top" | "bottom" }) {
  const center = position === "top" ? "0" : "100%"
  return (
    <div
      aria-hidden="true"
      className="-mx-4 h-1.5 w-[calc(100%+2rem)]"
      style={{
        backgroundImage: `repeating-radial-gradient(circle at 50% ${center}, #ffffff 0 3.5px, transparent 3.5px 7px)`,
      }}
    />
  )
}

export function VentaBoleta({ venta }: { venta: Venta }) {
  const tipoLabel = getTipoVentaLabel(venta.tipoVenta)
  const metodoLabel = getMetodoPagoLabel(venta.metodoPago)
  const esEfectivo = venta.metodoPago === "efectivo"
  const tieneVuelto = esEfectivo && venta.pagoCon !== undefined && venta.vuelto !== undefined

  return (
    <div
      id="boleta-print"
      className="relative mx-auto w-72 select-none border border-black bg-white px-4 py-2 font-mono text-[11px] leading-relaxed text-black"
    >
      <Diente position="top" />

      {/* Encabezado */}
      <div className="flex flex-col items-center gap-0.5 pt-1 text-center">
        <div className="flex size-9 items-center justify-center rounded-none border border-black bg-black text-[10px] font-bold tracking-widest text-white">
          EIP
        </div>
        <p className="mt-1.5 text-[11px] font-bold uppercase leading-tight text-black">
          {EMPRESA.razonSocial}
        </p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-black">
          {EMPRESA.tagline}
        </p>
        <p className="text-[10px] tabular-nums text-black">RUC: {EMPRESA.ruc}</p>
      </div>

      <Separador />

      <p className="text-center text-[12px] font-bold tracking-[0.3em] text-black">
        BOLETA DE VENTA
      </p>
      <p className="mt-1 text-center text-[9px] uppercase leading-snug text-black">
        {EMPRESA.direccion}
        <br />
        {EMPRESA.ciudad}
        <br />
        {EMPRESA.pais}
      </p>

      <Separador />

      {/* Datos de la venta */}
      <div className="space-y-0.5">
        <Fila label="N°" value={venta.folio} bold />
        <Fila label="Fecha" value={formatVentaDateTime(venta.createdAt)} />
        <Fila label="Vendedor" value={venta.responsable} />
        <Fila label="Venta" value={tipoLabel} />
        <Fila label="Pago" value={metodoLabel} />
      </div>

      <Separador />

      {/* Items */}
      <ul className="space-y-1.5">
        {venta.items.map((item) => (
          <li key={item.productId} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="min-w-0 font-bold text-black">{item.name}</p>
              <p className="shrink-0 font-bold tabular-nums text-black">
                {formatCurrency(item.unitPrice * item.quantity)}
              </p>
            </div>
            <p className="text-[9px] text-black">
              {formatSaleQuantity(item.quantity, item.unitType)} ×{" "}
              {formatCurrency(item.unitPrice)} · SKU {item.sku.toUpperCase()}
            </p>
          </li>
        ))}
      </ul>

      <Separador />

      {/* Totales */}
      <div className="space-y-0.5">
        <Fila label="Subtotal" value={formatCurrency(venta.subtotal)} />
        <div className="flex items-baseline justify-between gap-2 border-t border-dashed border-black pt-1">
          <span className="text-[13px] font-black tracking-widest text-black">
            TOTAL
          </span>
          <span className="text-[15px] font-black tabular-nums text-black">
            {formatCurrency(venta.total)}
          </span>
        </div>
      </div>

      {tieneVuelto && (
        <>
          <Separador />
          <div className="space-y-0.5">
            <Fila
              label="Recibido"
              value={formatCurrency(venta.pagoCon ?? 0)}
            />
            <Fila label="Vuelto" value={formatCurrency(venta.vuelto ?? 0)} />
          </div>
        </>
      )}

      <Separador />

      {/* Footer */}
      <div className="pt-0.5 text-center">
        <p className="text-[9px] uppercase tracking-[0.2em] text-black">
          ¡Gracias por su compra!
        </p>
        <div
          aria-hidden="true"
          className="mx-auto mt-1.5 flex h-7 w-44 items-center justify-between"
        >
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="bg-black"
              style={{
                width: i % 4 === 0 ? 3 : 1,
                height: i % 5 === 2 ? 14 : 22,
              }}
            />
          ))}
        </div>
        <p className="mt-1 text-[8px] uppercase tracking-widest text-black">
          EIP · Sistema de ventas
        </p>
      </div>

      <Diente position="bottom" />
    </div>
  )
}