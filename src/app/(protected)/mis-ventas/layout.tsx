import { RoleGuard } from "@/components/layout/protected-layout"

/**
 * Layout del grupo de rutas /mis-ventas. Solo accesible para el rol
 * vendedor; el shell visual lo aporta el layout padre (protected).
 */
export default function MisVentasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <RoleGuard allowedRoles={["vendedor"]}>{children}</RoleGuard>
}