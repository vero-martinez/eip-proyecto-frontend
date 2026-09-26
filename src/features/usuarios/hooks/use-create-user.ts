import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UserCreateRequest } from "../types"
import { createUserService } from "../users.service"

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UserCreateRequest) => createUserService(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}