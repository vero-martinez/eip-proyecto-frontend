<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Convención de arquitectura de componentes

El proyecto sigue el patrón **container / presentacional**. La regla es una sola:

> Un componente presentacional **nunca** lee estado global (auth, router, react-query, mutaciones). Recibe todo por props. La lógica vive en hooks de feature, y las páginas/layouts son los únicos containers.

## Dónde va cada cosa

- `src/components/ui/**` — primitivos shadcn. Presentacional puro.
- `src/components/common/**` — componentes reutilizables entre módulos (stat-card, dialogs, badges...). Presentacional puro.
- `src/components/layout/**` — navbar/sidebar/nav-item. Presentacional: reciben usuario, secciones y callbacks por props desde el layout.
- `src/features/<feature>/components/**` — presentacional del feature. Puede consumir hooks de su propio feature, pero no llama servicios ni maneja mutations.
- `src/features/<feature>/hooks/use-*.ts` — toda la lógica: estado, validación, react-query, toasts, navegación.
- `src/app/**/page.tsx` y `layout.tsx` — containers: obtienen datos con hooks y hacen el wiring de props/callbacks.

## Reglas prácticas

- Si un componente de `components/` o `features/*/components/` necesita `useAuth()`, `useRouter()` o una mutation, esa lógica debe moverse a un `use-*.ts` del feature (o pasarse por props desde el container).
- El estado de UI efímero (ej. `open` de un popover) puede vivir en el componente presentacional; el estado de negocio/datos, no.
- `usePathname()` en componentes de navegación se permite: es contexto de routing, no estado global de la app.
