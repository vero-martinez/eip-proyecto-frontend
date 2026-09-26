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
- [Autenticación](#-autenticación-versión-actual-mockeada)
- [Estructura del proyecto](#-estructura-del-proyecto)

---

## 🚧 Estado del proyecto

> **En desarrollo** — autenticación mockeada, layouts por rol y estructura base ya funcionando.

| ✅ Listo | ⏳ Pendiente |
|---|---|
| Autenticación mockeada | Integración con backend (FastAPI) |
| Layouts por rol | Features de negocio |
| Estructura base del proyecto | Conexión a datos reales |

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
- Punto de venta
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
- Punto de venta
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

2️⃣ **Cambia a la rama `dev`**
```powershell
git checkout dev
```

3️⃣ **Instala las dependencias**
```powershell
npm install
```

4️⃣ **Copia el archivo de variables de entorno**
```powershell
Copy-Item .env.example .env.local
```

5️⃣ **Corre el servidor de desarrollo**
```powershell
npm run dev
```

6️⃣ **Abre en el navegador** 🎉
```
http://localhost:3000
```

> ⚠️ **Importante:** el proyecto debe ejecutarse desde la rama `dev`. Las nuevas funcionalidades deben desarrollarse en ramas `feature/*` y luego integrarse a `dev`.

---

## 🔐 Autenticación (versión actual: mockeada)

El login todavía **no está conectado a un backend real** — valida contra una lista fija de usuarios de prueba en `features/auth/services/auth.service.ts`.

<div align="center">

| Rol | Email | Contraseña |
|:---|:---|:---|
| 👔 Admin | `admin@pasion.pe` | `admin123` |
| 🛍️ Vendedor | `vendedor@pasion.pe` | `vendedor123` |
| 🔨 Taller | `taller@pasion.pe` | `taller123` |

</div>

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
