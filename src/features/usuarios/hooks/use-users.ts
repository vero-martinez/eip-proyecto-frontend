/**
 * Hook de lectura de usuarios con TanStack Query.
 */

import { useQuery } from "@tanstack/react-query"
import { getUsersService } from "../users.service"

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: getUsersService,
    })
}