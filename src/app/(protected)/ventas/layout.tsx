import { RoleGuard } from "@/components/layout/protected-layout"

/**
 * Layout del grupo rutas /ventas (Punto de venta). Accesible para los
 * roles admin y vendedor; el shell visual lo aporta el layout padre
 * (protected).
 */
export default function VentasLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["admin", "vendedor"]}>{children}</RoleGuard>
}