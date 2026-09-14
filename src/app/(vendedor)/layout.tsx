"use client"

/**
 * Layout del grupo de rutas (vendedor).
 * Misma lógica que (admin), pero verifica rol "vendedor".
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
    const { usuario, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        if (!usuario) {
            router.push("/login")
            return
        }

        if (usuario.rol !== "vendedor") {
            router.push("/login")
        }
    }, [usuario, isLoading, router])

    if (isLoading || !usuario || usuario.rol !== "vendedor") {
        return (
            <div className="flex h-screen items-center justify-center text-muted-foreground">
                Verificando acceso...
            </div>
        )
    }

    return (
        <div className="flex min-h-screen">
            {/* Acá va el Sidebar del rol Vendedor */}
            <main className="flex-1">{children}</main>
        </div>
    )
}