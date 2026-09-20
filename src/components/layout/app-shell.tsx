"use client"

/**
 * Shell visual de las rutas protegidas.
 *
 * Componente presentacional: recibe el usuario, las secciones de
 * navegación y el callback de logout por props, y arma el sidebar + la
 * barra superior alrededor del contenido. No lee sesión ni ruteo.
 */

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Navbar } from "./navbar"
import type { NavSection } from "@/lib/constants"
import type { Usuario } from "@/types/auth"

interface AppShellProps {
  usuario: Usuario
  sections: NavSection[]
  onLogout: () => void
  children: React.ReactNode
}

export function AppShell({
  usuario,
  sections,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar sections={sections} onLogout={onLogout} />
      <SidebarInset>
        <Navbar usuario={usuario} sections={sections} />
        <main className="flex-1 p-6 lg:p-14">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}