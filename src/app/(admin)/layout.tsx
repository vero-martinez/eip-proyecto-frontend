"use client"

/**
 * Layout de las rutas de Admin.
 * Verifica que exista una sesión y que el usuario tenga rol "admin".
 * Si no cumple alguna condición, redirige a /login.
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Navbar } from "@/components/layout/navbar"
import { NAV_ADMIN } from "@/lib/constants"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
        // Espera a que AuthProvider termine de recuperar la sesión.
    if (isLoading) return

    if (!usuario) {
      router.push("/login")
      return
    }

    if (usuario.rol !== "admin") {
      router.push("/login")
    }
  }, [usuario, isLoading, router])

    // Evita mostrar el contenido mientras se verifica el acceso.
  if (isLoading || !usuario || usuario.rol !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Verificando acceso...
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar sections={NAV_ADMIN} />
      <SidebarInset>
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}