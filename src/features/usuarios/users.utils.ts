/**
 * Cálculo de métricas resumen del módulo Usuarios.
 * Mismo patrón que summarizeProducts.
 */

import type { User } from "../usuarios/types"

export function summarizeUsers(users: User[]) {
    const total = users.length
    const active = users.filter((u) => u.isActive).length
    const inactive = total - active
    const admins = users.filter((u) => u.role === "admin").length

    return { total, active, inactive, admins }
}