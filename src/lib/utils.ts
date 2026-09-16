export { cn } from "cn"

// Obtiene las iniciales de un nombre
export function getInitials(nombre: string | null | undefined): string {
    if (!nombre) return ""
    return nombre
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0]!.toUpperCase())
        .join("")
        .slice(0, 2)
}

// Formatea un número como moneda en soles peruanos
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(amount)
}

// Normaliza mayúsculas/minúsculas a Title Case
export function toTitleCase(text: string): string {
    return text
        .toLowerCase()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
}