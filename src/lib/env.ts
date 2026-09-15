// Variables de entorno validadas para usar en toda la app.
// Si falta NEXT_PUBLIC_API_URL, la app no arranca.
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
    throw new Error("Variable de entorno NEXT_PUBLIC_API_URL no definida");
}

export const env = {
    apiUrl,
} as const;