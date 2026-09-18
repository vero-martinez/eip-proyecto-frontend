import { RoleGuard } from "@/components/layout/protected-layout"

/**
 * Layout del grupo de rutas (taller). Aplica el control de rol; el
 * shell visual lo aporta el layout padre (protected).
 */
export default function TallerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["taller"]}>{children}</RoleGuard>
}
