/**
 * Servicio de Comercio Exterior para gestionar el historial y registrar
 * operaciones de importación y exportación con impacto directo en inventario.
 */

import { getProductsService } from "@/features/products/services/products.service"
import {
    consumirLotesService,
    ingresarLoteService,
} from "@/features/inventario/services/lotes.service"
import { costoConsumoTotal, round2 } from "@/features/inventario/utils"
import { appendMovimiento } from "@/features/inventario/services/ledger.service"
import { createLocalStore } from "@/lib/persistence"

import { TIPO_CAMBIO_DEFAULT } from "../constants"
import { calcularSubtotalLinea, calcularTotales, formatISODateLocal } from "../utils"
import type { OperacionCreateSchema } from "../schemas/operacionCreateSchema"

import type {
    LineaOperacion,
    OperacionComercioExterior,
    SocioComercial,
    TipoOperacion,
} from "../types"

// --- HELPERS Y MOCK DATA ---

// Simula la latencia de una red
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// Devuelve una fecha relativa en formato "YYYY-MM-DD"
function dateInput(days: number): string {
    return formatISODateLocal(new Date(Date.now() - days * 86400000))
}

// Catálogo de socios comerciales internacionales (clientes y proveedores del exterior)
const MOCK_SOCIOS_COMERCIALES: SocioComercial[] = [
    { id: 1, nombre: "Jade Trade LLC", pais: "Estados Unidos" },
    { id: 2, nombre: "Mineralia S.L.", pais: "España" },
    { id: 3, nombre: "Casa de Pedras Ltda.", pais: "Brasil" },
    { id: 4, nombre: "GemHouse Co., Ltd.", pais: "Japón" },
    { id: 5, nombre: "SIAM Gems Co.", pais: "Tailandia" },
    { id: 6, nombre: "RSA Minerals", pais: "Sudáfrica" },
]

interface SeedOperacion {
    id: number
    folio: string
    fecha: string
    tipo: TipoOperacion
    socioComercial: Pick<SocioComercial, "id" | "nombre" | "pais">
    incoterm?: string
    medioTransporte?: string
    notas?: string
    lineas: Omit<LineaOperacion, "subtotalUSD">[]
}

// Crea una estructura de operación inicial calculando sus totales de forma consistente
function buildSeed(data: SeedOperacion): OperacionComercioExterior {
    const lineas = data.lineas.map((linea) => ({
        ...linea,
        subtotalUSD: calcularSubtotalLinea(linea),
    }))
    const tipoCambio = TIPO_CAMBIO_DEFAULT
    const { subtotalUSD, totalUSD, totalPEN } = calcularTotales(
        lineas,
        tipoCambio
    )
    return {
        ...data,
        lineas,
        tipoCambio,
        subtotalUSD,
        totalUSD,
        totalPEN,
        responsable: "Admin Mock",
        createdAt: `${data.fecha}T12:00:00.000Z`,
    }
}

// Almacenamiento local persistente con operaciones iniciales de prueba
const operacionesStore = createLocalStore<OperacionComercioExterior[]>(
    "comercio_exterior",
    () => [
        buildSeed({
            id: 1,
            folio: "EXP-0001",
            fecha: dateInput(10),
            tipo: "exportacion",
            socioComercial: { id: 1, nombre: "Jade Trade LLC", pais: "Estados Unidos" },
            incoterm: "FOB",
            medioTransporte: "maritimo",
            notas: "Segundo embarque trimestral a Miami",
            lineas: [
                {
                    producto: { id: 3, name: "Lote Pirita Exportación", sku: "EXP-PIRITA-L", unitType: "KILOGRAMO" },
                    cantidad: 40,
                    precioUSD: 14.5,
                },
                {
                    producto: { id: 2, name: "Pirita Metálica en Bruto", sku: "PIR-BRUTO-KG", unitType: "KILOGRAMO" },
                    cantidad: 20,
                    precioUSD: 12,
                },
            ],
        }),
        buildSeed({
            id: 2,
            folio: "IMP-0001",
            fecha: dateInput(25),
            tipo: "importacion",
            socioComercial: { id: 2, nombre: "Mineralia S.L.", pais: "España" },
            incoterm: "CIF",
            medioTransporte: "maritimo",
            notas: "Cristales para la colección de otoño",
            lineas: [
                {
                    producto: { id: 4, name: "Amatista pulida S", sku: "EIP-0001", unitType: "UNIDAD" },
                    cantidad: 30,
                    precioUSD: 8.2,
                },
                {
                    producto: { id: 6, name: "Anillo citrino plata", sku: "EIP-0007", unitType: "UNIDAD" },
                    cantidad: 12,
                    precioUSD: 6.5,
                },
            ],
        }),
        buildSeed({
            id: 3,
            folio: "EXP-0002",
            fecha: dateInput(5),
            tipo: "exportacion",
            socioComercial: { id: 4, nombre: "GemHouse Co., Ltd.", pais: "Japón" },
            incoterm: "DAP",
            medioTransporte: "aereo",
            notas: "Piezas premium para Tokio",
            lineas: [
                {
                    producto: { id: 5, name: "Amatista pulida M", sku: "EIP-0002", unitType: "UNIDAD" },
                    cantidad: 3,
                    precioUSD: 16,
                },
                {
                    producto: { id: 1, name: "Pulsera Amatista 8mm", sku: "PUL-AMAT-8MM", unitType: "UNIDAD" },
                    cantidad: 24,
                    precioUSD: 5.5,
                },
            ],
        }),
        buildSeed({
            id: 4,
            folio: "IMP-0002",
            fecha: dateInput(40),
            tipo: "importacion",
            socioComercial: { id: 5, nombre: "SIAM Gems Co.", pais: "Tailandia" },
            incoterm: "FOB",
            medioTransporte: "maritimo",
            lineas: [
                {
                    producto: { id: 2, name: "Pirita Metálica en Bruto", sku: "PIR-BRUTO-KG", unitType: "KILOGRAMO" },
                    cantidad: 50,
                    precioUSD: 6.3,
                },
            ],
        }),
    ]
)

// Devuelve verdadero si la operación es una importación
const esImportacion = (tipo: TipoOperacion): boolean => tipo === "importacion"

// --- SERVICIOS Y CONSULTAS ---

// Obtiene todas las operaciones ordenadas por fecha reciente
export async function getOperacionesService(): Promise<OperacionComercioExterior[]> {
    await delay()
    return [...operacionesStore.get()].sort(
        (a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime() ||
            b.id - a.id
    )
}

// Registra una nueva operación actualizando el inventario y guardando en almacenamiento
export async function registrarOperacionService(
    data: OperacionCreateSchema
): Promise<OperacionComercioExterior> {
    await delay()

    const products = await getProductsService()
    const productById = new Map(products.map((product) => [product.id, product]))

    const socioComercial = MOCK_SOCIOS_COMERCIALES.find(
        (socio) => socio.id === data.socioComercialId
    )
    if (!socioComercial) throw new Error("Socio comercial no encontrado")

    const lineas: LineaOperacion[] = data.lineas.map((linea) => {
        const product = productById.get(linea.productoId)
        if (!product) throw new Error("Producto no encontrado")
        return {
            producto: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                unitType: product.unitType,
            },
            cantidad: linea.cantidad,
            precioUSD: linea.precioUSD,
            subtotalUSD: calcularSubtotalLinea(linea),
        }
    })

    const { subtotalUSD, totalUSD, totalPEN } = calcularTotales(
        lineas,
        data.tipoCambio
    )

    const current = operacionesStore.get()
    const nextId =
        (current.length > 0 ? Math.max(...current.map((item) => item.id)) : 0) +
        1
    const folio = `${esImportacion(data.tipo) ? "IMP" : "EXP"}-${String(
        nextId
    ).padStart(4, "0")}`

    if (esImportacion(data.tipo)) {
        for (const linea of lineas) {
            await ingresarLoteService({
                productId: linea.producto.id,
                cantidad: linea.cantidad,
                origen: "importacion",
                responsable: data.responsable,
                costoUnitarioSoles: round2(linea.precioUSD * data.tipoCambio),
                proveedor: {
                    id: socioComercial.id,
                    name: socioComercial.nombre,
                },
            })
            await appendMovimiento({
                productId: linea.producto.id,
                responsable: data.responsable,
                movementType: "importacion",
                quantity: linea.cantidad,
                unitSoldPrice: productById.get(linea.producto.id)?.salePrice,
                unitCostPrice: round2(linea.precioUSD * data.tipoCambio),
                proveedor: socioComercial.nombre,
                reason: socioComercial.pais,
                folio,
                unitPriceUSD: linea.precioUSD,
                tipoCambio: data.tipoCambio,
            })
        }
    } else {
        for (const linea of lineas) {
            const detalle = await consumirLotesService(
                linea.producto.id,
                linea.cantidad
            )
            await appendMovimiento({
                productId: linea.producto.id,
                responsable: data.responsable,
                movementType: "exportacion",
                quantity: -linea.cantidad,
                unitSoldPrice: round2(linea.precioUSD * data.tipoCambio),
                unitCostPrice: round2(
                    costoConsumoTotal(detalle) / linea.cantidad
                ),
                proveedor: socioComercial.nombre,
                reason: socioComercial.pais,
                folio,
                unitPriceUSD: linea.precioUSD,
                tipoCambio: data.tipoCambio,
            })
        }
    }

    const nuevaOperacion: OperacionComercioExterior = {
        id: nextId,
        folio,
        fecha: data.fecha,
        tipo: data.tipo,
        socioComercial: {
            id: socioComercial.id,
            nombre: socioComercial.nombre,
            pais: socioComercial.pais,
        },
        incoterm: data.incoterm,
        medioTransporte: data.medioTransporte,
        tipoCambio: data.tipoCambio,
        lineas,
        subtotalUSD,
        totalUSD,
        totalPEN,
        responsable: data.responsable,
        notas: data.notas || undefined,
        createdAt: new Date().toISOString(),
    }

    operacionesStore.set([nuevaOperacion, ...current])
    return nuevaOperacion
}

// --- CATÁLOGO DE SOCIOS COMERCIALES ---

// Lista los socios comerciales internacionales registrados
export async function getSociosComercialesService(): Promise<SocioComercial[]> {
    await delay()
    return [...MOCK_SOCIOS_COMERCIALES]
}