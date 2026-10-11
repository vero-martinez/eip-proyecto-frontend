/**
 * Historial de descargas recientes.
 *
 * Vive en `localStorage` porque es historial de la sesión del navegador, no
 * dato del negocio: el backend no guarda las exportaciones y no vale la pena
 * agregarles un endpoint. Cada descarga queda registrada con el nombre real
 * del archivo, así la lista nunca inventa descargas que no ocurrieron.
 *
 * Se lee con `useSyncExternalStore` en lugar de `useState` + `useEffect` por
 * dos razones: el store existe durante el render del servidor (donde no hay
 * `window`), y el estado no depende del valor de `localStorage` al montar, así
 * que no hay salto de hidratación cuando el listado aparece.
 */

import { useCallback, useSyncExternalStore } from "react"

const CLAVE = "reportes.descargas"
const MAXIMO = 5
const EVENTO = "reportes:descargas"

export interface DescargaRegistrada {
    /** Nombre del archivo tal como se descargó. */
    nombre: string
    /** Fecha en ISO, para ordenar sin depender del formato local. */
    fecha: string
}

/** Referencia estable: `getServerSnapshot` debe devolver siempre lo mismo. */
const VACIO: DescargaRegistrada[] = []

// Caché del parseo: `getSnapshot` solo puede devolver una referencia nueva
// cuando la cadena subyacente cambió, si no React entra en bucle.
let cacheCrudo: string | null = null
let cacheParseado: DescargaRegistrada[] = VACIO

function parsear(crudo: string): DescargaRegistrada[] {
    try {
        const datos: unknown = JSON.parse(crudo)
        if (!Array.isArray(datos)) return VACIO

        const validos = datos.filter(
            (item): item is DescargaRegistrada =>
                !!item &&
                typeof item === "object" &&
                typeof (item as DescargaRegistrada).nombre === "string" &&
                typeof (item as DescargaRegistrada).fecha === "string"
        )

        return validos.length > 0 ? validos.slice(0, MAXIMO) : VACIO
    } catch {
        // Un JSON corrupto no debe romper la página: se muestra vacío.
        return VACIO
    }
}

function leerCrudo(): string | null {
    try {
        return window.localStorage.getItem(CLAVE)
    } catch {
        // Modo privado o almacenamiento bloqueado.
        return null
    }
}

function subscribe(alCambiar: () => void): () => void {
    window.addEventListener(EVENTO, alCambiar)
    // Cubre los casos en que el usuario tiene la app abierta en dos pestañas.
    window.addEventListener("storage", alCambiar)

    return () => {
        window.removeEventListener(EVENTO, alCambiar)
        window.removeEventListener("storage", alCambiar)
    }
}

function getSnapshot(): DescargaRegistrada[] {
    const crudo = leerCrudo()

    if (crudo === cacheCrudo) return cacheParseado

    cacheCrudo = crudo
    cacheParseado = crudo ? parsear(crudo) : VACIO
    return cacheParseado
}

function getServerSnapshot(): DescargaRegistrada[] {
    return VACIO
}

export function useDescargasRecientes() {
    const descargas = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    const registrar = useCallback((nombre: string) => {
        try {
            const previos = getSnapshot()

            window.localStorage.setItem(
                CLAVE,
                JSON.stringify(
                    [
                        { nombre, fecha: new Date().toISOString() },
                        // Si el mismo reporte se descarga dos veces, la anterior
                        // queda registrada igual: son dos descargas reales.
                        ...previos,
                    ].slice(0, MAXIMO)
                )
            )
        } catch {
            // Sin almacenamiento disponible el reporte igual se descargó.
            return
        }

        // El setItem de la misma pestaña no dispara "storage": hay que avisar.
        window.dispatchEvent(new Event(EVENTO))
    }, [])

    return { descargas, registrar }
}
