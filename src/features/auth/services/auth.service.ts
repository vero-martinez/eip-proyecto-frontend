/**
 * Servicio de autenticación mockeado.
 * Simula el login usando usuarios de prueba hasta tener el backend real.
 */

import { Usuario } from "@/types/auth";

// Usuarios de prueba que simulan los datos del backend.
const USUARIOS_MOCK: (Usuario & { email: string; password: string })[] = [
    {
        id: "1",
        nombre: "Admin Mock",
        rol: "admin",
        email: "admin@eip.com",
        password: "admin123",
    },
    {
        id: "2",
        nombre: "Vendedor Mock",
        rol: "vendedor",
        email: "vendedor@eip.com",
        password: "vendedor123",
    },
    {
        id: "3",
        nombre: "Taller Mock",
        rol: "taller",
        email: "taller@eip.com",
        password: "taller123",
    },
];

export const authService = {
    // Simula un login validando las credenciales.
    login: async (email: string, password: string): Promise<Usuario> => {
        // Simula el tiempo de respuesta de una API.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const encontrado = USUARIOS_MOCK.find(
            (u) => u.email === email && u.password === password
        );

        if (!encontrado) {
            throw new Error("Email o contraseña incorrectos");
        }

        // Devuelve los datos del usuario sin la contraseña.
        const { email: _email, password: _password, ...usuario } = encontrado;
        return usuario;
    },
};