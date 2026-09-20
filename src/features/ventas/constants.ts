/**
 * Opciones del paso de pago del Punto de Venta: fuente única para los
 * selectores de tipo de venta y método de pago.
 */

export const TIPOS_VENTA: { value: string; label: string }[] = [
    { value: "tienda", label: "Tienda" },
    { value: "feria", label: "Feria" },
    { value: "digital", label: "Digital" },
    { value: "otro", label: "Otro" },
]

export const METODOS_PAGO: { value: string; label: string }[] = [
    { value: "efectivo", label: "Efectivo" },
    { value: "billetera-digital", label: "Billetera digital (Yape / Plin)" },
]

/**
 * Datos de la empresa que aparecen en el encabezado de la boleta.
 * Edítalos acá y se reflejan en la boleta (POS y Mis ventas).
 */
export const EMPRESA = {
    razonSocial: "IMPORT & EXPORT PASION S.A.C.",
    tagline: "Piedras semipreciosas",
    ruc: "20511652848",
    direccion: "Cal. las Azaleas Nro. 198 u.Pop el Ermitaño",
    ciudad: "Independencia - Lima",
    pais: "Perú",
}