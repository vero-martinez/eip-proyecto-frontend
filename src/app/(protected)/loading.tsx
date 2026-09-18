/**
 * Loading state de las rutas protegidas.
 *
 * Renderiza dentro del AppShell (sidebar + navbar), así que sólo cubre
 * el área de contenido y evita el parpadeo de pantalla completa al
 * navegar entre rutas.
 */

import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
        </div>
    )
}
