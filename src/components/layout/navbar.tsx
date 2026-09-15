"use client"

/**
 * Barra superior de cada layout protegido.
 *
 * Muestra el trigger del sidebar, el título/descripción del módulo
 * activo (según la ruta actual) y el usuario logueado con avatar.
 * El logout vive en el footer del sidebar, no acá.
 */

import { usePathname } from "next/navigation"

import { useAuth } from "@/providers/auth-provider"
import { NAV_ADMIN, NAV_VENDEDOR, NAV_TALLER } from "@/lib/constants"
import { getInitials } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Navbar() {
  const { usuario } = useAuth()
  const pathname = usePathname()

  const todasLasSecciones = [...NAV_ADMIN, ...NAV_VENDEDOR, ...NAV_TALLER]
  const currentItem = todasLasSecciones
    .flatMap((section) => section.items)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )

  const initials = getInitials(usuario?.nombre)

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="size-8 text-sidebar" />
        <Separator orientation="vertical" className="h-8" />

        {currentItem && (
          <div>
            <h1 className="text-base font-bold leading-none">
              {currentItem.label}
            </h1>
            {currentItem.description && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {currentItem.description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 py-2 px-4">
        <Avatar className="size-9 border border-border">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-none">{usuario?.nombre}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{usuario?.rol}</p>
        </div>
      </div>
    </header>
  )
}