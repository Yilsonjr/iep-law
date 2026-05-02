import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, Mail, Phone, Calendar,
  UserCheck, Shield, ChevronDown
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile, UserRole } from '../types';
import { cn } from '../utils';

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: 'bg-red-100', text: 'text-red-700' },
  pastor: { bg: 'bg-gold/20', text: 'text-gold' },
  leader: { bg: 'bg-primary/20', text: 'text-primary' },
  member: { bg: 'bg-stone-100', text: 'text-stone-600' },
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  pastor: 'Pastor',
  leader: 'Líder',
  member: 'Miembro',
};

const statusColors = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  inactive: { bg: 'bg-stone-100', text: 'text-stone-500' },
};

export function DashboardPage() {
  const { users, loading, updateUserRole, updateUserStatus } = useUsers();
  const { profile: currentProfile, canManageUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = users.filter(u => {
    const matchSearch = u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pastors: users.filter(u => u.role === 'pastor' || u.role === 'admin').length,
    leaders: users.filter(u => u.role === 'leader').length,
  };

  const handleRoleChange = async (user: UserProfile, role: UserRole) => {
    if (!canManageUsers) return;
    if (user.id === currentProfile?.id) return;
    await updateUserRole(user.id, role);
  };

  const handleStatusChange = async (user: UserProfile, status: 'active' | 'inactive') => {
    if (!canManageUsers) return;
    if (user.id === currentProfile?.id) return;
    await updateUserStatus(user.id, status);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
              <Shield size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold">Dashboard</h1>
              <p className="text-stone-300">
                Gestión de miembros · {currentProfile?.display_name} ({roleLabels[currentProfile?.role ?? 'member']})
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Miembros', value: stats.total, color: 'bg-primary' },
              { label: 'Activos', value: stats.active, color: 'bg-green-500' },
              { label: 'Pastores/Admin', value: stats.pastors, color: 'bg-gold' },
              { label: 'Líderes', value: stats.leaders, color: 'bg-blue-500' },
            ].map(({ label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-md p-5"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-800">{value}</p>
                    <p className="text-xs text-stone-500">{label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabla */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-stone-400" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Admin</option>
                  <option value="pastor">Pastor</option>
                  <option value="leader">Líder</option>
                  <option value="member">Miembro</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Usuario</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Contacto</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Rol</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Estado</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-stone-600">Ingreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => {
                      const isSelf = user.id === currentProfile?.id;
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {user.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-stone-800">
                                  {user.display_name}
                                  {isSelf && <span className="ml-2 text-xs text-stone-400">(tú)</span>}
                                </p>
                                {user.address && <p className="text-xs text-stone-400">{user.address}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <p className="flex items-center gap-2 text-sm text-stone-600">
                                <Mail size={13} className="text-stone-400" />
                                {user.email}
                              </p>
                              {user.phone && (
                                <p className="flex items-center gap-2 text-sm text-stone-600">
                                  <Phone size={13} className="text-stone-400" />
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {canManageUsers && !isSelf ? (
                              <div className="relative">
                                <select
                                  value={user.role}
                                  onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                                  className={cn(
                                    'pl-3 pr-7 py-1.5 rounded-full text-sm font-medium border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:outline-none',
                                    roleColors[user.role].bg,
                                    roleColors[user.role].text
                                  )}
                                >
                                  <option value="admin">Admin</option>
                                  <option value="pastor">Pastor</option>
                                  <option value="leader">Líder</option>
                                  <option value="member">Miembro</option>
                                </select>
                                <ChevronDown size={12} className={cn('absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none', roleColors[user.role].text)} />
                              </div>
                            ) : (
                              <span className={cn('px-3 py-1 rounded-full text-sm font-medium', roleColors[user.role].bg, roleColors[user.role].text)}>
                                {roleLabels[user.role]}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {canManageUsers && !isSelf ? (
                              <div className="relative">
                                <select
                                  value={user.status}
                                  onChange={e => handleStatusChange(user, e.target.value as 'active' | 'inactive')}
                                  className={cn(
                                    'pl-3 pr-7 py-1.5 rounded-full text-sm font-medium border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-gold focus:outline-none',
                                    statusColors[user.status].bg,
                                    statusColors[user.status].text
                                  )}
                                >
                                  <option value="active">Activo</option>
                                  <option value="inactive">Inactivo</option>
                                </select>
                                <ChevronDown size={12} className={cn('absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none', statusColors[user.status].text)} />
                              </div>
                            ) : (
                              <span className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit', statusColors[user.status].bg, statusColors[user.status].text)}>
                                <UserCheck size={13} />
                                {user.status === 'active' ? 'Activo' : 'Inactivo'}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                              <Calendar size={13} />
                              {new Date(user.join_date).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500">No se encontraron usuarios</p>
                  </div>
                )}
              </div>
            )}

            {!canManageUsers && (
              <p className="mt-4 text-sm text-stone-400 text-center">
                Solo pastores y administradores pueden cambiar roles y estados.
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
