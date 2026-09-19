/**
 * Estructura de navegación del sidebar por rol.
 * Cada rol tiene sus propias secciones e items (label, ruta e ícono).
 * El Sidebar recibe estas listas y las renderiza de forma reutilizable.
 */

import {
    LayoutDashboard,
    ClipboardList,
    ShoppingCart,
    Package,
    Boxes,
    Store,
    Users,
    FileBarChart,
    PackagePlus,
    PackageMinus,
    QrCode,
    Bell,
    type LucideIcon,
} from "lucide-react"

import type { Rol } from "@/types/auth"

export interface NavItem {
    label: string
    href: string
    icon: LucideIcon
    description?: string
}

export interface NavSection {
    title: string
    items: NavItem[]
}

export const NAV_ADMIN: NavSection[] = [
    {
        title: "Principal",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Analítica de Ventas del negocio" },
            { label: "Punto de venta", href: "/ventas", icon: ShoppingCart, description: "Ventas minoristas: ferias, tienda y canales digitales" },
        ],
    },
    {
        title: "Inventario",
        items: [
            { label: "Productos", href: "/productos", icon: Boxes, description: "Crear, editar y eliminar productos del catálogo" },
            { label: "Catálogo", href: "/catalogo", icon: Package, description: "Ver el catálogo de productos" },
            { label: "Movimientos", href: "/movimientos", icon: ClipboardList, description: "Historial demovimientos de inventario" },

        ],
    },
    {
        title: "Negocio",
        items: [
            { label: "Ferias", href: "/ferias", icon: Store, description: "Administrar ferias y puntos de venta" },
            { label: "Comercio Exterior", href: "/comercio-exterior", icon: Store, description: "Gestionar operaciones de comercio exterior" },
        ],
    },
    {
        title: "Sistema",
        items: [
            { label: "Usuarios", href: "/usuarios", icon: Users, description: "Gestionar usuarios del sistema" },
            { label: "Reportes", href: "/reportes", icon: FileBarChart, description: "Generar y visualizar reportes" },
        ],
    },
]

export const NAV_VENDEDOR: NavSection[] = [
    {
        title: "",
        items: [
            { label: "Punto de venta", href: "/ventas", icon: ShoppingCart, description: "Registrar ventas: ferias, tienda y canales digitales" },
            { label: "Mis ventas", href: "/mis-ventas", icon: ClipboardList, description: "Visualizar el historial de mis ventas" },
            { label: "Catálogo", href: "/catalogo", icon: Package, description: "Ver el catálogo de productos" },
        ],
    },
]

export const NAV_TALLER: NavSection[] = [
    {
        title: "",
        items: [
            { label: "Entradas", href: "/entradas", icon: PackagePlus, description: "Registrar entradas de productos al inventario" },
            { label: "Mermas", href: "/mermas", icon: PackageMinus, description: "Registrar mermas de productos" },
            { label: "Etiquetas QR", href: "/etiquetas", icon: QrCode, description: "Generar y gestionar etiquetas QR" },
            { label: "Catálogo", href: "/catalogo", icon: Package, description: "Ver el catálogo de productos" },
            { label: "Alertas", href: "/alertas", icon: Bell, description: "Visualizar y gestionar alertas" },
        ],
    },
]

/**
 * Secciones de navegación por rol. Permite que un layout compartido
 * (ej. el de Catálogo) renderice el sidebar correcto según el usuario
 * sin duplicar la selección en cada layout.
 */
export const NAV_BY_ROL: Record<Rol, NavSection[]> = {
    admin: NAV_ADMIN,
    vendedor: NAV_VENDEDOR,
    taller: NAV_TALLER,
}