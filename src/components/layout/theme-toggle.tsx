"use client"

/**
 * Toggle de tema claro/oscuro para el navbar.
 *
 * Usa next-themes (montado en Providers). Los íconos se intercambian
 * vía CSS (clase .dark) en vez de estado, evitando desajustes de
 * hidratación y el lint de setState en efectos.
 */

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Cambiar tema claro/oscuro"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
            <Moon className="size-5 dark:hidden" />
            <Sun className="hidden size-5 dark:block" />
        </Button>
    )
}
