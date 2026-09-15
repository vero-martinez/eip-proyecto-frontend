/**
 * Loading state global — Next.js envuelve automáticamente cada
 * página en <Suspense>, mostrando esto mientras carga.
 *
 * Este es el fallback genérico. Más adelante, páginas específicas
 * (ej: dashboard, catálogo) pueden tener su propio loading.tsx
 * con un skeleton más específico a su contenido.
 */

import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    )
}