import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UserUpdateRequest } from "../types"
import { updateUserService } from "../users.service"

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UserUpdateRequest }) =>
            updateUserService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}