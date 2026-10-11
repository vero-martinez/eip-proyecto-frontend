<div align="center">

# 💎 EIP · Frontend

**Sistema web de gestión de inventario y dashboard de analítica**
para digitalizar los procesos de una empresa peruana dedicada a la comercialización de piedras semipreciosas.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000?style=flat-square)](https://ui.shadcn.com/)
[![Status](https://img.shields.io/badge/estado-en_desarrollo-yellow?style=flat-square)]()

</div>

---

## 📌 Tabla de contenidos

- [Estado del proyecto](#-estado-del-proyecto)
- [Stack técnico](#️-stack-técnico)
- [Roles del sistema](#-roles-del-sistema)
- [Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [Autenticación](#-autenticación)
- [Estructura del proyecto](#-estructura-del-proyecto)

---

## 🚧 Estado del proyecto

> **En desarrollo** — funcionalidades principales conectadas al backend (FastAPI).

| ✅ Listo | ⏳ Pendiente |
|---|---|
| Autenticación real (JWT) | Despliegue a producción (Postgres/Supabase) |
| Integración con backend (FastAPI) | CORS/variables de entorno de producción |
| Módulos de negocio con datos reales | Ajustes y pruebas finales |

---

## 🛠️ Stack técnico

<div align="center">

| Tecnología | Uso |
|:---|:---|
| ⚛️ **Next.js 16** (App Router) | Framework, routing y Server Components |
| 🔷 **React 19 + TypeScript** | Construcción de interfaces y tipado |
| 🎨 **Tailwind CSS v4** | Estilos y diseño responsive |
| 🧩 **shadcn/ui** | Componentes de UI reutilizables |
| 🔄 **TanStack Query** | Gestión y caché de datos del servidor |
| 📋 **React Hook Form + Zod** | Formularios y validación |
| 🌐 **Axios** | Cliente HTTP para comunicación con el backend |
| 📊 **Recharts** | Gráficos y visualización de datos |
| 🔔 **Sonner** | Notificaciones toast |
| ✨ **Lucide React** | Iconos de la interfaz |
| 📷 **html5-qrcode** | Lectura de códigos QR y de barras |
| 🔳 **qrcode** | Generación de códigos QR |
| 📄 **jsPDF + html2canvas-pro** | Generación y exportación de reportes en PDF |
| 📊 **exceljs** | Exportación de reportes en Excel (xlsx) |
| 🌗 **next-themes** | Gestión de temas (claro/oscuro) |
| 🧹 **ESLint** | Análisis y calidad del código |

</div>

---

## 👥 Roles del sistema

La app tiene **3 roles**, cada uno con su propio layout, sidebar y rutas protegidas:

<table>
<tr>
<td width="33%" valign="top">

### 👔 Admin
- Dashboard
- Catálogo de venta
- Productos
- Compras
- Movimientos
- Comercio exterior
- Ventas
- Usuarios
- Reportes

</td>
<td width="33%" valign="top">

### 🛍️ Vendedor
- Catálogo de venta
- Mis ventas

</td>
<td width="33%" valign="top">

### 🔨 Taller
- Entradas
- Mermas
- Etiquetas QR
- Catálogo
- Alertas

</td>
</tr>
</table>

---

## 🚀 Cómo correr el proyecto

1️⃣ **Clona el repositorio y entra a la carpeta**
```powershell
git clone <URL_DEL_REPOSITORIO>
cd eip-proyecto-frontend
```

2️⃣ **Instala las dependencias**
```powershell
npm install
```

3️⃣ **Copia el archivo de variables de entorno y define la URL del backend**
```powershell
Copy-Item .env.example .env.local
```
Luego editá `.env.local` y completá la URL del API (es obligatoria, la app no arranca sin ella):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

4️⃣ **Corre el servidor de desarrollo**
```powershell
npm run dev
```

5️⃣ **Abre en el navegador** 🎉
```
http://localhost:3000
```

> ⚠️ **Importante:** creá las nuevas funcionalidades en ramas `feature/*` a partir de `dev` e integralas mediante pull requests.

---

## 🔐 Autenticación

El login está conectado al backend (FastAPI): valida credenciales en
`POST /api/v1/auth/login`, guarda el token (JWT) y lo revalida al cargar la
app con `GET /api/v1/auth/me` (`src/features/auth/services/auth.service.ts`).

- El token se envía como `Bearer` en cada petición (`src/lib/axios.ts`).
- La sesión se guarda en `src/lib/session.ts` y se consume con `useAuth()`
  (`src/providers/auth-provider.tsx`).
- Un `401` limpia la sesión y redirige a `/login`.

---

## 📁 Estructura del proyecto

```
src/
├── app/                    # Rutas (App Router), agrupadas por rol
├── features/               # Lógica de negocio por módulo (components, hooks, services)
├── components/
│   ├── ui/                 # Componentes de shadcn/ui
│   └── layout/              # Sidebar, Navbar
├── lib/                    # Configuración técnica (axios, query-client, utils, constants)
├── providers/               # Providers globales (Auth, Query)
└── types/                   # Tipos compartidos
```

---

</div>
