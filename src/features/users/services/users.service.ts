import { createLocalStore } from "@/lib/persistence";
import { Rol } from "@/types/auth";

export interface UsuarioBD {
  id: number | string;
  full_name: string;
  email: string;
  hashed_password?: string;
  role: Rol;
  is_active: boolean;
  created_at?: string;
}

// Cuentas por defecto del equipo
const USUARIOS_INICIALES: UsuarioBD[] = [
  {
    id: 1,
    full_name: "Admin",
    email: "admin@eip.com",
    role: "admin",
    is_active: true,
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: 2,
    full_name: "Vendedor",
    email: "vendedor@eip.com",
    role: "vendedor",
    is_active: true,
    created_at: "2026-09-02T10:00:00Z",
  },
  {
    id: 3,
    full_name: "Taller",
    email: "taller@eip.com",
    role: "taller",
    is_active: true,
    created_at: "2026-09-03T10:00:00Z",
  },
];

// Instancia del store usando la utilidad de persistencia centralizada
const usersStore = createLocalStore<UsuarioBD[]>(
  "app_usuarios",
  () => USUARIOS_INICIALES
);

export const usersService = {
  /**
   * Obtiene la lista actual de usuarios
   */
  getAll: (): UsuarioBD[] => {
    return usersStore.get();
  },

  /**
   * Guarda o actualiza la lista completa de usuarios
   */
  saveAll: (users: UsuarioBD[]): void => {
    usersStore.set(users);
  },

  /**
   * Crea un nuevo usuario
   */
  create: (user: Omit<UsuarioBD, "id" | "created_at">): UsuarioBD => {
    const current = usersStore.get();
    const newUser: UsuarioBD = {
      ...user,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newUser, ...current];
    usersStore.set(updated);
    return newUser;
  },

  /**
   * Actualiza los datos de un usuario existente
   */
  update: (id: number | string, updatedData: Partial<UsuarioBD>): UsuarioBD[] => {
    const current = usersStore.get();
    const updated = current.map((u) =>
      u.id === id ? { ...u, ...updatedData } : u
    );
    usersStore.set(updated);
    return updated;
  },

  /**
   * Alternar estado activo / inactivo
   */
  toggleActive: (id: number | string): UsuarioBD[] => {
    const current = usersStore.get();
    const updated = current.map((u) =>
      u.id === id ? { ...u, is_active: !u.is_active } : u
    );
    usersStore.set(updated);
    return updated;
  },

  /**
   * Elimina un usuario por ID
   */
  delete: (id: number | string): UsuarioBD[] => {
    const current = usersStore.get();
    const updated = current.filter((u) => u.id !== id);
    usersStore.set(updated);
    return updated;
  },
};