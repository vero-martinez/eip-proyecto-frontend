/**
 * Panel de marca del login, renderizado junto al formulario.
 *
 * Componente servidor que muestra la identidad de la empresa, 
 * una propuesta de valor y los módulos principales del sistema. 
 */

import {
  BarChart3Icon,
  GemIcon,
  ShoppingCartIcon,
} from "lucide-react"

const features = [
  {
    icon: GemIcon,
    title: "Inventario de piedras",
    description: "Control de stock por pieza, calibre y lote en tiempo real.",
  },
  {
    icon: ShoppingCartIcon,
    title: "Ventas integradas",
    description: "Cobrá y registrá cada venta directo desde la plataforma.",
  },
  {
    icon: BarChart3Icon,
    title: "Dashboard analítico",
    description: "Métricas e indicadores para tomar decisiones con datos.",
  },
]

export function LoginBrandPanel() {
  return (
    <aside className="relative flex items-center justify-between gap-4 overflow-hidden bg-gradient-to-br from-primary via-[#6D4FC2] to-[#4A34A6] p-5 text-primary-foreground lg:flex-col lg:items-stretch lg:justify-between lg:p-10">
      {/* Textura y orbes decorativos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-12 size-72 rounded-full bg-black/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-1/4 size-40 rounded-full bg-white/5 blur-2xl"
      />

      {/* Encabezado / marca */}
      <div className="relative flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <GemIcon className="size-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">Import &amp; Export Pasión</p>
          <p className="text-xs text-white/70">Piedras semipreciosas</p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative hidden flex-1 flex-col justify-center space-y-8 lg:flex">
        <div>
          <h2 className="max-w-sm text-3xl leading-snug font-bold tracking-tight">
            Inventario, ventas y analítica en un solo sistema.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Digitalizá todo el ciclo de comercialización de tus piedras semipreciosas.
          </p>
        </div>

        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                <feature.icon className="size-4 text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="text-sm text-white/75">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}