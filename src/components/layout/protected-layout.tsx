"use client"

/**
 * Layout de las rutas protegidas.
 *
 * Container: verifica la sesión y, si pasa, delega el armado visual en
 * AppShell. El control de rol de cada grupo de rutas lo aplica
 * RoleGuard; así el shell (sidebar + navbar) se monta una sola vez y
 * persiste al navegar entre grupos.
 */

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/providers/auth-provider"
import { NAV_BY_ROL, type NavSection } from "@/lib/constants"
import type { Rol } from "@/types/auth"

import { AppShell } from "./app-shell"

interface ProtectedLayoutProps {
  children: React.ReactNode
  /** Secciones de navegación; por defecto, las del rol. */
  sections?: NavSection[]
}

export function ProtectedLayout({ children, sections }: ProtectedLayoutProps) {
  const { usuario, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!usuario) {
      router.push("/login")
    }
  }, [usuario, isLoading, router])

  if (isLoading || !usuario) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Verificando acceso...
      </div>
    )
  }

  return (
    <AppShell
      usuario={usuario}
      sections={sections ?? NAV_BY_ROL[usuario.rol]}
      onLogout={logout}
    >
      {children}
    </AppShell>
  )
}

interface RoleGuardProps {
  children: React.ReactNode
  /** Roles admitidos para el grupo de rutas. */
  allowedRoles: Rol[]
}

/**
 * Guard de rol para los grupos de rutas anidados dentro de (protected).
 *
 * No arma el shell (lo aporta ProtectedLayout): sólo verifica que el
 * usuario tenga uno de los roles permitidos y, si no, redirige al
 * login.
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { usuario, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!usuario || !allowedRoles.includes(usuario.rol)) {
      router.push("/login")
    }
  }, [usuario, isLoading, allowedRoles, router])

  if (isLoading || !usuario || !allowedRoles.includes(usuario.rol)) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Verificando acceso...
      </div>
    )
  }

  return <>{children}</>
}
