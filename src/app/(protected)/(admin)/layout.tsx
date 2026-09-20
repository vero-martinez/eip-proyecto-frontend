import { RoleGuard } from "@/components/layout/protected-layout"

/**
 * Layout del grupo de rutas (admin). Aplica el control de rol; el
 * shell visual lo aporta el layout padre (protected).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["admin"]}>{children}</RoleGuard>
}
