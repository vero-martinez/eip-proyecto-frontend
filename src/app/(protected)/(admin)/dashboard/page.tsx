// app/(admin)/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function FullAdminDashboardPage() {

  const router = useRouter();
  const [periodo, setPeriodo] = useState<"Dia" | "Semana" | "Mes">("Semana");

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* -------------------------------------------------------------
          1. BARRA SUPERIOR (Reemplaza al Sidebar con el usuario y Salir)
         ------------------------------------------------------------- */}
      <header className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Identidad del Sistema */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-base shadow-md">
            IP
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">
              Import & Export — Sistema de Inventario
            </h1>
            <p className="text-xs text-slate-400">Panel de Administración General</p>
          </div>
        </div>

        {/* Perfil del Usuario y Acciones */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200">
              E
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Edson Pasión</p>
              <p className="text-[11px] text-slate-400">Admin / Gerencia</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
            >
              ← Salir / Cambiar de rol
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
              Exportar PDF
            </button>
            <span className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-medium">
              🔔 4 alertas
            </span>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          2. DASHBOARD PARTE 1: ANALÍTICA DE VENTAS Y KPIs
         ------------------------------------------------------------- */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analítica de Ventas</h2>
          <p className="text-xs text-slate-500">Resumen de ventas e indicadores claves del negocio</p>
        </div>

        {/* Tarjetas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Ventas de sept</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">S/ 9,680.00</p>
            <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              ▲ 12% vs. agosto
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Promedio por venta</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">S/ 85.00</p>
            <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              ▲ 6% - meta S/ 80
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Piezas vendidas</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">114</p>
            <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              ▲ 8% vs. agosto
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Margen bruto del mes</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">S/ 4,160</p>
            <span className="inline-block mt-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              ≈ 43% del ingreso
            </span>
          </div>
        </div>

        {/* Gráfico y Productos Top */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Ventas por período</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
                {(["Dia", "Semana", "Mes"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setPeriodo(item)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      periodo === item
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
              {[
                { label: "S31", val: 531, height: "40%" },
                { label: "S32", val: 880, height: "65%" },
                { label: "S33", val: 955, height: "70%" },
                { label: "S34", val: 1100, height: "80%" },
                { label: "S35", val: 1200, height: "85%" },
                { label: "S36", val: 1180, height: "83%" },
                { label: "S37", val: 1440, height: "95%", isPeak: true },
                { label: "S38 proy", val: 1490, height: "100%", isProy: true },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">{bar.val}</span>
                  <div
                    style={{ height: bar.height }}
                    className={`w-full rounded-t-md transition-all ${
                      bar.isProy
                        ? "bg-purple-200 border-2 border-dashed border-purple-400"
                        : bar.isPeak
                        ? "bg-purple-700"
                        : "bg-purple-500"
                    }`}
                  />
                  <span className="text-[11px] text-slate-500 mt-1">{bar.label}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Promedio semanal S/ 1,302 — Semana pico: S37 — Proyección S38 ~ S/ 1,490
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Productos top</h3>
              <span className="text-xs text-slate-400 font-medium">Top 5 - mes</span>
            </div>

            <div className="space-y-3">
              {[
                { id: 1, name: "Pulsera citrino 8mm", total: "S/ 1,020", uds: "34 uds" },
                { id: 2, name: "Amatista pulida S", total: "S/ 1,680", uds: "28 uds" },
                { id: 3, name: "Pirita natural media", total: "S/ 945", uds: "21 uds" },
                { id: 4, name: "Anillo citrino plata", total: "S/ 1,190", uds: "17 uds" },
                { id: 5, name: "Amatista pulida M", total: "S/ 1,275", uds: "15 uds" },
              ].map((prod) => (
                <div key={prod.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-[10px]">
                      {prod.id}
                    </span>
                    <span className="font-medium text-slate-700">{prod.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{prod.total}</p>
                    <p className="text-[10px] text-slate-400">{prod.uds}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas e Inteligencia de Negocio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Alertas de anomalías en ventas</h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                IA · detección
              </span>
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
              <p className="font-bold text-xs text-rose-800">Pico inusual — 09 sep (Alta)</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Ventas de S/ 415 (+38% sobre promedio diario). Coincide con la Feria Larcomar.
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
              <p className="font-bold text-xs text-amber-800">Riesgo de agotamiento — Amatista pulida M</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Quedan 3 uds. Se agota en ~6 días al ritmo actual. Reponer antes del 17 sep.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-800">Predicción de tendencia</h3>
            <p className="text-2xl font-bold text-slate-800">≈ S/ 10,100</p>
            <p className="text-xs text-slate-500">Proyección del cierre de septiembre · +4.3% vs. agosto</p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. DASHBOARD PARTE 2: MIX DE VENTAS, FERIAS Y EXPORTACIONES
         ------------------------------------------------------------- */}
      <section className="space-y-6 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Distribución de Canales y Operaciones</h2>
          <p className="text-xs text-slate-500">Mix de ventas, eventos activos y comercio exterior</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mix de Ventas (Donut Chart Simulado) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Mix de ventas del mes</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-around">
              <div className="w-36 h-36 rounded-full border-8 border-purple-600 border-t-amber-400 border-r-emerald-400 flex items-center justify-center font-bold text-slate-800 text-sm">
                S/ 9.7k
              </div>
              <div className="space-y-1 text-xs">
                <p><span className="inline-block w-3 h-3 bg-purple-600 rounded-full mr-2"></span> Exportación: 46%</p>
                <p><span className="inline-block w-3 h-3 bg-amber-400 rounded-full mr-2"></span> Ferias: 28%</p>
                <p><span className="inline-block w-3 h-3 bg-emerald-400 rounded-full mr-2"></span> WhatsApp: 12%</p>
                <p><span className="inline-block w-3 h-3 bg-sky-400 rounded-full mr-2"></span> Instagram: 9%</p>
                <p><span className="inline-block w-3 h-3 bg-slate-300 rounded-full mr-2"></span> Tienda: 6%</p>
              </div>
            </div>
          </div>

          {/* Ventas por Feria */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-800">Ventas por feria</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-bold text-slate-800">Feria Larcomar <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-1">Activa</span></p>
                  <p className="text-[10px] text-slate-400">09 sep 2026 · Miraflores</p>
                </div>
                <p className="font-bold text-slate-800">S/ 2,140.00</p>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-bold text-slate-800">Feria Barranco <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded ml-1">Cerrada</span></p>
                  <p className="text-[10px] text-slate-400">02 sep 2026 · Bulevar Barranco</p>
                </div>
                <p className="font-bold text-slate-800">S/ 1,680.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comercio Exterior y Próxima Feria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-800">Comercio exterior — últimas operaciones</h3>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Cliente / Proveedor</th>
                  <th className="py-2">País</th>
                  <th className="py-2">Valor (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2">2026-09-09</td>
                  <td><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">Exportación</span></td>
                  <td>Mineralia MX</td>
                  <td>México</td>
                  <td className="font-semibold">\$1,320.00</td>
                </tr>
                <tr>
                  <td className="py-2">2026-09-05</td>
                  <td><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">Importación</span></td>
                  <td>Brilliant Gems</td>
                  <td>Colombia</td>
                  <td className="font-semibold">\$1,180.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-800">Próxima feria</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-purple-600">23</span>
              <div>
                <p className="font-bold text-xs text-slate-800">Feria San Isidro</p>
                <p className="text-[10px] text-slate-400">04 oct 2026 · Parque El Olivar</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              ⚠️ 4 productos con stock bajo para reponer antes del evento.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}