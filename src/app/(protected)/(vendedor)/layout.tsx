import { RoleGuard } from "@/components/layout/protected-layout"

/**
 * Layout del grupo de rutas (vendedor). Aplica el control de rol; el
 * shell visual lo aporta el layout padre (protected).
 */
export default function VendedorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleGuard allowedRoles={["vendedor"]}>{children}</RoleGuard>
    )
}