export { cn } from "cn"

export function getInitials(nombre: string | null | undefined): string {
  if (!nombre) return ""
  return nombre
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .join("")
    .slice(0, 2)
}