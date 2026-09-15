/**
 * Instancia centralizada de QueryClient para TanStack Query.
 * Define la configuración general de las queries del proyecto.
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Los datos se consideran frescos durante 1 minuto.
            staleTime: 60 * 1000,

            // Los datos sin uso se mantienen en caché durante 10 minutos.
            gcTime: 10 * 1000 * 60,

            // Reintenta una vez si la petición falla.
            retry: 1,

            // No vuelve a pedir los datos al regresar a la pestaña.
            refetchOnWindowFocus: false,
        },
    },
});