"use client"

/**
 * Sidebar de la aplicación, usando los primitivos de shadcn/ui.
 *
 * Componente presentacional: recibe las secciones de navegación y el
 * callback de logout por props. Incluye la marca, la navegación por rol
 * y el logout en el footer.
 */

import { GemIcon, SquareArrowRightExit } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavItemLink } from "./nav-item"
import type { NavSection } from "@/lib/constants"

interface AppSidebarProps {
  sections: NavSection[]
  onLogout: () => void
}

export function AppSidebar({ sections, onLogout }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden border-r border-sidebar-border/50"
    >
      {/* Marca */}
      <SidebarHeader className="px-4 pt-5 pb-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary ring-1 ring-white/25 backdrop-blur">
            <GemIcon className="size-5 text-white" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[15px] leading-tight font-bold tracking-tight text-sidebar-foreground">
              Import &amp; Export Pasion
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              Sistema de Inventario
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border/50" />

      {/* Navegación */}
      <SidebarContent>
        {sections.map((section, index) => (
          <SidebarGroup
            key={section.title || `seccion-${index}`}
            className="px-4 pb-3 group-data-[collapsible=icon]:px-2 first:pt-4"
          >
            {section.title && (
              <SidebarGroupLabel className="px-2 pb-1.5 text-sm font-medium text-sidebar-foreground/60">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => (
                  <NavItemLink key={item.href} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border/50" />

      {/* Cerrar sesión */}
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              aria-label="Cerrar sesión"
              tooltip="Cerrar sesión"
              className="h-9 gap-4 rounded-lg px-4 text-base text-sidebar-foreground transition-colors duration-150 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent/80 hover:text-foreground"
            >
              <SquareArrowRightExit className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Cerrar sesión
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}