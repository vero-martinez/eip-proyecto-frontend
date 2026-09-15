/**
 * Hook de login con TanStack Query.
 * Usa useMutation para manejar automáticamente los estados del login.
 * Actualmente utiliza el servicio de autenticación mockeado.
 */

import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export function useLogin() {
    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authService.login(email, password),
    });
}