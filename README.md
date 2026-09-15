# 💎 EIP - Frontend

Sistema web de gestión de inventario y dashboard de analítica para digitalizar los procesos de una empresa peruana dedicada a la comercialización de piedras semipreciosas.

Frontend desarrollado con Next.js, TypeScript, TanStack Query y shadcn/ui.

## 🚧 Estado

En desarrollo — autenticación mockeada, layouts por rol y estructura base ya funcionando. Pendiente: features de negocio (inventario, ventas, dashboard) e integración con backend (FastAPI).

## 🛠️ Stack técnico

| Tecnología | Uso |
|---|---|
| Next.js 16 (App Router) | Framework, routing, Server Components |
| React 19 + TypeScript | UI y tipado |
| Tailwind CSS v4 | Estilos |
| shadcn/ui | Componentes de UI |
| TanStack Query | Estado y cache de datos del servidor |
| TanStack Table | Tablas |
| Recharts | Gráficos |
| React Hook Form + Zod | Formularios y validación |
| Axios | Cliente HTTP |
| Sonner | Notificaciones toast |

## 👥 Roles del sistema

La app tiene 3 roles, cada uno con su propio layout, sidebar y rutas protegidas:

- 👔 **Admin / Gerencia** — dashboard, kardex, punto de venta, catálogo, usuarios, reportes
- 🛍️ **Vendedor** — escanear, registrar ventas, consultar catálogo
- 🔨 **Encargado de Taller** — registrar entradas, ajustes por merma, etiquetas QR, alertas

## 🚀 Cómo correr el proyecto

1. Clona el repositorio y entra a la carpeta
2. Instala las dependencias:
```bash
   npm install
```
3. Copia el archivo de variables de entorno de ejemplo y completalo:
```bash
   cp .env.example .env.local
```
4. Corre el servidor de desarrollo:
```bash
   npm run dev
```
5. Abrí [http://localhost:3000](http://localhost:3000) 🎉

## 🔐 Autenticación (versión actual: mockeada)

El login todavía no está conectado a un backend real — valida contra una lista fija de usuarios de prueba en `features/auth/services/auth.service.ts`. Credenciales de prueba:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@demo.com | admin123 |
| Vendedor | vendedor@demo.com | vendedor123 |
| Taller | taller@demo.com | taller123 |

## 📁 Estructura del proyecto

```
src/
├── app/                  # Rutas (App Router), agrupadas por rol
├── features/             # Lógica de negocio por módulo (components, hooks, services)
├── components/
│   ├── ui/                # Componentes de shadcn/ui
│   └── layout/             # Sidebar, Navbar
├── lib/                   # Configuración técnica (axios, query-client, utils, constants)
├── providers/              # Providers globales (Auth, Query)
└── types/                  # Tipos compartidos
```
