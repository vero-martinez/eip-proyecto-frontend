/**
 * Servicio de Movimientos de Inventario.
 * Unifica e integra registros de entradas, mermas, ventas y ledger enriqueciéndolos con metadatos.
 */

import { getStockEntriesService } from "@/features/inventario/services/entradas.service";
import { getMovimientosLedgerService } from "@/features/inventario/services/ledger.service";
import { getProveedoresService } from "@/features/proveedores/services/proveedores.service";
import { getMermasService } from "@/features/mermas/services/mermas.service";
import { getProductsService } from "@/features/products/services/products.service";
import { getVentasService } from "@/features/ventas/services/ventas.service";
import { getTipoVentaLabel } from "@/features/ventas/utils";

import type { MovementRecord } from "@/features/inventario/types";
import type { Venta } from "@/features/ventas/types";
import type { Product } from "@/types/products";
import type { InventoryMovement } from "../types";

/** Simula latencia de red. */
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

let seedId = 0;
let seeded: MovementRecord[] | null = null;

/** Inicializa el historial de movimientos a partir de entradas, mermas y ventas. */
async function ensureSeeds(
    products: Product[],
    ventas: Venta[],
): Promise<MovementRecord[]> {
    if (seeded) return seeded;

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

    seeded = [
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
    ];

    return seeded;
}

/** Obtiene la lista unificada y consolidada de todos los movimientos de inventario. */
export async function getMovimientosService(): Promise<InventoryMovement[]> {
    await delay();

    const [products, ventas, runtime] = await Promise.all([
        getProductsService(),
        getVentasService(),
        getMovimientosLedgerService(),
    ]);
    const seeds = await ensureSeeds(products, ventas);

    const productById = new Map(products.map((product) => [product.id, product]));
    const ventaById = new Map(ventas.map((venta) => [venta.id, venta]));

    return [...runtime, ...seeds]
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
                folio: venta?.folio,
            };
        });
}