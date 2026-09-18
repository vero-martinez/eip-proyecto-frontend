import { ProtectedLayout } from "@/components/layout/protected-layout"

/**
 * Layout compartido por todas las rutas protegidas (todos los roles).
 *
 * Monta el AppShell (sidebar + navbar) una sola vez para que persista
 * al navegar entre grupos de rutas. El control de rol específico de
 * cada grupo lo aplica el layout del grupo con RoleGuard.
 */
export default function ProtectedRoutesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <ProtectedLayout>{children}</ProtectedLayout>
}
