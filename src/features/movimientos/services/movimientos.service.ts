/**
 * Servicio de Movimientos de Inventario.
 * Concilia el ledger persistente y enriquece los registros con metadatos
 * de producto, venta y comercio exterior.
 */

import { getStockEntriesService } from "@/features/inventario/services/entradas.service"
import {
    getMovimientosLedgerService,
    seedMovimientosLedger,
} from "@/features/inventario/services/ledger.service"
import { getProveedoresService } from "@/features/proveedores/services/proveedores.service"
import { getMermasService } from "@/features/mermas/services/mermas.service"
import { getProductsService } from "@/features/products/services/products.service"
import { getVentasService } from "@/features/ventas/services/ventas.service"
import { getTipoVentaLabel } from "@/features/ventas/utils"
import { getOperacionesService } from "@/features/comercio-exterior/services/comercio-exterior.service"

import type { MovementRecord } from "@/features/inventario/types"
import type { Venta } from "@/features/ventas/types"
import type { OperacionComercioExterior } from "@/features/comercio-exterior/types"
import type { Product } from "@/types/products"
import type { InventoryMovement } from "../types"

/** Simula latencia de red. */
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

/** Reconstruye el historial inicial de movimientos a partir de entradas,
 * mermas, ventas y operaciones de comercio exterior. */
async function construirHistorialInicial(
    products: Product[],
    ventas: Venta[],
    operaciones: OperacionComercioExterior[],
): Promise<MovementRecord[]> {
    const [entries, mermas, proveedores] = await Promise.all([
        getStockEntriesService(),
        getMermasService(),
        getProveedoresService(),
    ]);

    const proveedorById = new Map(
        proveedores.map((proveedor) => [proveedor.id, proveedor.name]),
    );
    const costById = new Map(
        products.map((product) => [product.id, product.costPrice]),
    );
    const salePriceById = new Map(
        products.map((product) => [product.id, product.salePrice]),
    );

    let seedId = 0;

    return [
        ...entries.map((entry): MovementRecord => {
            seedId += 1;
            return {
                id: seedId,
                productId: entry.productId,
                responsable: entry.responsable ?? "Sin asignar",
                movementType: "entrada",
                quantity: entry.quantity,
                unitSoldPrice: salePriceById.get(entry.productId),
                unitCostPrice: costById.get(entry.productId),
                proveedor: entry.proveedorId
                    ? proveedorById.get(entry.proveedorId)
                    : undefined,
                createdAt: entry.createdAt,
            };
        }),
        ...mermas.map((merma): MovementRecord => {
            seedId += 1;
            return {
                id: seedId,
                productId: merma.productId,
                responsable: merma.responsable,
                movementType: "merma",
                quantity: -merma.quantity,
                reason: merma.detalle,
                unitSoldPrice: salePriceById.get(merma.productId),
                unitCostPrice: costById.get(merma.productId),
                wasteType: merma.motivo,
                createdAt: merma.createdAt,
            };
        }),
        ...ventas.flatMap((venta): MovementRecord[] =>
            venta.items.map((item) => {
                seedId += 1;
                return {
                    id: seedId,
                    productId: item.productId,
                    responsable: venta.responsable,
                    movementType: "venta",
                    quantity: -item.quantity,
                    unitSoldPrice: item.unitPrice,
                    unitCostPrice: costById.get(item.productId),
                    saleGroupId: venta.id,
                    createdAt: venta.createdAt,
                };
            }),
        ),
        ...operaciones.flatMap(
            (operacion): MovementRecord[] =>
                operacion.lineas.map((linea) => {
                    seedId += 1;
                    const esImportacion = operacion.tipo === "importacion";
                    const unitCostPEN = linea.precioUSD * operacion.tipoCambio;
                    return {
                        id: seedId,
                        productId: linea.producto.id,
                        responsable: operacion.responsable,
                        movementType: operacion.tipo,
                        quantity: esImportacion
                            ? linea.cantidad
                            : -linea.cantidad,
                        unitSoldPrice: esImportacion
                            ? salePriceById.get(linea.producto.id)
                            : Math.round(unitCostPEN * 100) / 100,
                        unitCostPrice: esImportacion
                            ? Math.round(unitCostPEN * 100) / 100
                            : costById.get(linea.producto.id),
                        proveedor: operacion.socioComercial.nombre,
                        reason: operacion.socioComercial.pais,
                        folio: operacion.folio,
                        unitPriceUSD: linea.precioUSD,
                        tipoCambio: operacion.tipoCambio,
                        createdAt: operacion.createdAt,
                    };
                }),
        ),
    ];
}

/** Asegura que el ledger persistente contenga el historial reconstruido. */
async function ensureLedger(
    products: Product[],
    ventas: Venta[],
    operaciones: OperacionComercioExterior[],
): Promise<MovementRecord[]> {
    const actual = await getMovimientosLedgerService();
    if (actual.length > 0) return actual;

    const historial = await construirHistorialInicial(
        products,
        ventas,
        operaciones,
    );
    await seedMovimientosLedger(historial);
    return getMovimientosLedgerService();
}

/** Obtiene la lista unificada y consolidada de todos los movimientos de inventario. */
export async function getMovimientosService(): Promise<InventoryMovement[]> {
    await delay();

    const [products, ventas, operaciones] = await Promise.all([
        getProductsService(),
        getVentasService(),
        getOperacionesService(),
    ]);
    const ledger = await ensureLedger(products, ventas, operaciones);

    const productById = new Map(products.map((product) => [product.id, product]));
    const ventaById = new Map(ventas.map((venta) => [venta.id, venta]));

    return ledger
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((record, index) => {
            const product = productById.get(record.productId);
            const venta = record.saleGroupId
                ? ventaById.get(record.saleGroupId)
                : undefined;
            return {
                ...record,
                id: index + 1,
                productName: product?.name ?? "Producto no disponible",
                sku: product?.sku ?? "—",
                unitType: product?.unitType ?? "UNIDAD",
                tipoVenta: venta ? getTipoVentaLabel(venta.tipoVenta) : undefined,
                folio: record.folio ?? venta?.folio,
            };
        });
}