"use client"

/**
 * Página raíz ("/").
 *
 * No muestra contenido propio — decide a dónde redirigir según
 * el estado de la sesión:
 * - Si no hay usuario logueado → /login
 * - Si hay usuario logueado → a la página principal de su rol
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Rol } from "@/types/auth"

const RUTA_POR_ROL: Record<Rol, string> = {
  admin: "/dashboard",
  vendedor: "/ventas",
  taller: "/entradas",
}

export default function Home() {
  const { usuario, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!usuario) {
      router.push("/login")
      return
    }

    router.push(RUTA_POR_ROL[usuario.rol])
  }, [usuario, isLoading, router])

  return (
    <div className="flex h-screen items-center justify-center text-muted-foreground">
      Cargando...
    </div>
  )
}