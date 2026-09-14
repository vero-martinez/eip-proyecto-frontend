"use client"

/**
 * Layout del grupo de rutas (taller).
 * Misma lógica que (admin), pero verifica rol "taller".
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"

export default function TallerLayout({ children }: { children: React.ReactNode }) {
    const { usuario, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        if (!usuario) {
            router.push("/login")
            return
        }

        if (usuario.rol !== "taller") {
            router.push("/login")
        }
    }, [usuario, isLoading, router])

    if (isLoading || !usuario || usuario.rol !== "taller") {
        return (
            <div className="flex h-screen items-center justify-center text-muted-foreground">
                Verificando acceso...
            </div>
        )
    }

    return (
        <div className="flex min-h-screen">
            {/* Acá va el Sidebar del rol Taller */}
            <main className="flex-1">{children}</main>
        </div>
    )
}