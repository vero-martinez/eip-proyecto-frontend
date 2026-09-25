import { Usuario, Rol } from "@/types/auth"; // Ajusta la ruta relativa a tu proyecto si es necesario

// Lista de usuarios demo por defecto (fallback inicial)
const USUARIOS_DEMO: (Usuario & { email: string })[] = [
  { id: "1", nombre: "Admin General", email: "admin@empresa.com", rol: "admin" },
  { id: "2", nombre: "Edson Pasión", email: "edson.pasion@pasion.pe", rol: "admin" },
  { id: "3", nombre: "Carlos Vendedor", email: "vendedor@empresa.com", rol: "vendedor" },
  { id: "4", nombre: "Encargado Taller", email: "taller@empresa.com", rol: "taller" },
];

export const authService = {
  /**
   * Inicio de sesión local conectado a la lista de usuarios guardados en localStorage
   */
  login: async (email: string, password?: string): Promise<Usuario> => {
    // Simula una pequeña pausa de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    const emailLleno = email.trim().toLowerCase();

    // 1. Cargar usuarios registrados desde la clave 'app_usuarios' en localStorage
    let usuariosDisponibles = USUARIOS_DEMO;

    if (typeof window !== "undefined") {
      const guardados = localStorage.getItem("app_usuarios");
      if (guardados) {
        try {
          const parsed = JSON.parse(guardados);
          usuariosDisponibles = parsed.map((u: any) => ({
            id: String(u.id),
            nombre: u.full_name || u.nombre,
            email: u.email,
            rol: u.role || u.rol,
          }));
        } catch (e) {
          console.error("Error al leer usuarios de localStorage:", e);
        }
      }
    }

    // 2. Buscar si el correo ingresado en el login coincide con un usuario de la lista
    const usuarioEncontrado = usuariosDisponibles.find(
      (u) => u.email.toLowerCase() === emailLleno
    );

    // 3. Generar el objeto de sesión con los datos reales o asignación por defecto
    const usuarioSesion: Usuario = usuarioEncontrado
      ? {
          id: usuarioEncontrado.id,
          nombre: usuarioEncontrado.nombre,
          email: usuarioEncontrado.email,
          rol: usuarioEncontrado.rol as Rol,
        }
      : {
          id: Date.now().toString(),
          nombre: email.split("@")[0] || "Usuario",
          email: emailLleno,
          rol: "admin", // Asignación de respaldo si el correo no está registrado
        };

    // 4. Guardar la sesión y cookies de acceso en el navegador
    if (typeof window !== "undefined") {
      localStorage.setItem("user_session", JSON.stringify(usuarioSesion));
      document.cookie = `user_role=${usuarioSesion.rol}; path=/`;
      document.cookie = `auth_token=mock_token_active; path=/`;
    }

    return usuarioSesion;
  },

  /**
   * Obtiene los datos del usuario logueado actualmente
   */
  getCurrentUser: (): Usuario | null => {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem("user_session");
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  /**
   * Cierra la sesión activa
   */
  logout: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_session");
      document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },
};