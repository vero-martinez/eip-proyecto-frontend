"use client";

import React, { useState, useEffect } from "react";
import { Rol } from "@/types/auth";
import { usersService, UsuarioBD } from "@/features/users/services/users.service";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioBD[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [rolFiltro, setRolFiltro] = useState<string>("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Todos");

  // Control del modal y formulario
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioBD | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "vendedor" as Rol,
    is_active: true,
  });

  // 1. Cargar usuarios mediante el servicio al montar la página
  useEffect(() => {
    setUsuarios(usersService.getAll());
  }, []);

  // Métricas de la parte superior
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.role === "admin").length;
  const totalVendedores = usuarios.filter((u) => u.role === "vendedor").length;
  const totalTaller = usuarios.filter((u) => u.role === "taller").length;

  // Filtro de búsqueda
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideTexto =
      u.full_name.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol =
      rolFiltro === "Todos" || u.role.toLowerCase() === rolFiltro.toLowerCase();
    const coincideEstado =
      estadoFiltro === "Todos" ||
      (estadoFiltro === "Activo" && u.is_active) ||
      (estadoFiltro === "Inactivo" && !u.is_active);

    return coincideTexto && coincideRol && coincideEstado;
  });

  // Abrir Modal
  const handleOpenModal = (user?: UsuarioBD) => {
    setErrorMsg("");
    if (user) {
      setSelectedUser(user);
      setForm({
        full_name: user.full_name,
        email: user.email,
        password: "",
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      setSelectedUser(null);
      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "vendedor",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  // Guardar (Crear / Editar usando usersService)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.full_name.trim() || !form.email.trim()) {
      setErrorMsg("El nombre completo y el correo son obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setErrorMsg("Por favor, ingresa un formato de correo electrónico válido.");
      return;
    }

    if (!selectedUser && (!form.password || form.password.length < 6)) {
      setErrorMsg("La contraseña inicial debe tener al menos 6 caracteres.");
      return;
    }

    if (selectedUser) {
      // Actualizar usuario existente
      const listaActualizada = usersService.update(selectedUser.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
        is_active: form.is_active,
        ...(form.password ? { hashed_password: `hashed_${form.password}` } : {}),
      });
      setUsuarios(listaActualizada);
    } else {
      // Crear nuevo usuario
      usersService.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        hashed_password: `hashed_${form.password}`,
        role: form.role,
        is_active: form.is_active,
      });
      setUsuarios(usersService.getAll());
    }

    setIsModalOpen(false);
  };

  // Cambiar estado activo / inactivo
  const handleToggleActive = (id: number | string) => {
    const listaActualizada = usersService.toggleActive(id);
    setUsuarios(listaActualizada);
  };

  // Eliminar usuario
  const handleDelete = (id: number | string, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?`)) {
      const listaActualizada = usersService.delete(id);
      setUsuarios(listaActualizada);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h1>
        <p className="text-xs text-slate-400">
          Administración de accesos y perfiles del sistema
        </p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Usuarios totales</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalUsuarios}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Admin / Gerencia</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalAdmins}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Vendedores</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalVendedores}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Taller / Almacén</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalTaller}</p>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="p-2.5 border border-slate-200 rounded-xl text-xs w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={rolFiltro}
              onChange={(e) => setRolFiltro(e.target.value)}
              className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
            >
              <option value="Todos">Todos los roles</option>
              <option value="admin">Admin / Gerencia</option>
              <option value="vendedor">Vendedor</option>
              <option value="taller">Taller / Almacén</option>
            </select>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            + Nuevo usuario
          </button>
        </div>

        {/* Tabla con etiquetas limpias */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">Nombre completo</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-800">{u.full_name}</td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 capitalize">
                      {u.role === "admin"
                        ? "Admin / Gerencia"
                        : u.role === "vendedor"
                        ? "Vendedor"
                        : "Taller / Almacén"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      title="Haz clic para cambiar el estado de acceso"
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-opacity hover:opacity-80 ${
                        u.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {u.is_active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(u)}
                      className="text-purple-600 hover:underline font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.full_name)}
                      className="text-rose-600 hover:underline font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej. Edson Pasión"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Contraseña
                  {selectedUser && (
                    <span className="text-slate-400 font-normal ml-1">
                      (Opcional)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Rol
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as Rol })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="admin">Admin / Gerencia</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="taller">Taller / Almacén</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Estado
                  </label>
                  <select
                    value={form.is_active ? "Activo" : "Inactivo"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_active: e.target.value === "Activo",
                      })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium shadow-sm hover:bg-purple-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
