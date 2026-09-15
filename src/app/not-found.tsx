/**
 * Página 404 global — se muestra cuando una ruta no existe.
 * Next.js la usa automáticamente, no hace falta importarla en ningún lado.
 */

import Link from "next/link"
import { PackageSearch } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
            <PackageSearch className="size-16 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Página no encontrada</h1>
            <p className="text-muted-foreground">
                La página que buscas no existe o fue movida.
            </p>
            <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>
                Volver al inicio
            </Link>
        </div>
    )
}