"use client"

/**
 * Agrupa todos los providers globales de la app en un solo componente.
 *
 * En vez de anidar cada Provider directamente en app/layout.tsx,
 * se centralizan acá — así el layout raíz queda limpio, y agregar
 * un provider nuevo en el futuro (ej: ThemeProvider) es un cambio
 * aislado en este archivo, sin tocar layout.tsx.
 *
 * El orden de anidación importa poco en este caso (Auth y Query no
 * dependen entre sí), pero se mantiene consistente.
 */

import { AuthProvider } from "./auth-provider"
import { QueryProvider } from "./query-provider"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <QueryProvider>
                {children}
            </QueryProvider>
        </AuthProvider>
    )
}