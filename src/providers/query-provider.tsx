"use client"

/**
 * Provider de TanStack Query.
 *
 * Permite usar useQuery y useMutation en cualquier componente
 * de la aplicación.
 */

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"

export function QueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}