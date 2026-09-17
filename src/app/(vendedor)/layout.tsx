"use client"

/**
 * Layout del grupo de rutas (vendedor).
 * Misma lógica que (admin), pero verifica rol "vendedor".
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Navbar } from "@/components/layout/navbar"
import { NAV_VENDEDOR } from "@/lib/constants"

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading, logout } = useAuth()
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
    <SidebarProvider>
      <AppSidebar sections={NAV_VENDEDOR} onLogout={logout} />
      <SidebarInset>
        <Navbar usuario={usuario} sections={NAV_VENDEDOR} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}