"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import type { NavItem } from "@/lib/constants"

interface NavItemLinkProps {
  item: NavItem
}

const NAV_BUTTON_CLASSES =
  "h-9 rounded-lg px-4 text-base gap-4 transition-colors duration-150"

const COLLAPSED_CENTERING =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"

export function NavItemLink({ item }: NavItemLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={
          <Link
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          />
        }
        tooltip={item.label}
        className={cn(
          NAV_BUTTON_CLASSES,
          COLLAPSED_CENTERING,
          isActive
            ? "data-active:bg-primary data-active:text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/80"
        )}
      >
        <Icon />
        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}