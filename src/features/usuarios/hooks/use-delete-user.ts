import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUserService } from "../users.service"

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteUserService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}