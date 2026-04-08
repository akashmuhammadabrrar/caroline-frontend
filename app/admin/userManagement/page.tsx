"use client";

import React, { useState } from "react";
import { Eye, Search, Filter, Mail, Calendar, User as UserIcon, Shield, X, Loader2, Trash2, Power, UserPlus } from "lucide-react";
import AddUserModal from "./AddUserModal";
import { useGetAdminUsersQuery, useGetAdminUserDetailsQuery, AdminUserListItem, useToggleUserStatusMutation, useDeleteUserMutation } from "@/redux/features/admin/AdminUsersApi";
import toast from "react-hot-toast";

// ─── Helpers

const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
  try {
    return new Intl.DateTimeFormat('en-US', options || {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  } catch (e) {
    return dateString;
  }
};

// ─── User Detail Modal 

const UserDetailModal = ({ userId, onClose }: { userId: number; onClose: () => void }) => {
  const { data: response, isLoading } = useGetAdminUserDetailsQuery(userId);
  const [toggleStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const user = response?.data;

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      const res = await toggleStatus({ id: user.id, is_active: !user.is_active }).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const res = await deleteUser(user.id).unwrap();
        if (res.success) {
          toast.success(res.message);
          onClose();
        }
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete user");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0D1B2A] border border-[#162d45] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-[#162d45] flex items-center justify-between bg-linear-to-r from-blue-600/10 to-purple-600/10">
          <h3 className="text-xl font-bold text-white">User Details</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* content */}
        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-slate-400 text-sm">Loading user information...</p>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#00E5FF]/20 to-[#9C27B0]/20 flex items-center justify-center text-[#00E5FF] border border-[#00E5FF]/20 shadow-lg shadow-[#00E5FF]/10">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white tracking-tight">{user.email.split('@')[0]}</h4>
                  <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                    <Mail size={14} className="text-blue-400" /> {user.email}
                  </p>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Role</p>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-purple-400" />
                    <span className="text-white font-medium">{user.role}</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-red-500'}`} />
                    <span className="text-white font-medium">{user.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-blue-400" />
                    <span className="text-sm text-slate-300">Joined on</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {formatDate(user.date_joined)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Loader2 size={16} className="text-orange-400" />
                    <span className="text-sm text-slate-300">Last Login</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user.last_login ? formatDate(user.last_login, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${user.is_active
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                >
                  {isToggling ? <Loader2 className="animate-spin" size={18} /> : <Power size={18} />}
                  {user.is_active ? "Deactivate User" : "Activate User"}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">User not found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

const UserManagementPage = () => {
  const { data: response, isLoading } = useGetAdminUsersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const users = response?.data || [];

  const filteredUsers = users.filter((user: AdminUserListItem) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-transparent">
      {/* Header section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
          <div>
            <div className="flex items-center justify-between md:justify-start gap-4">
              <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
                User Management
              </h1>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex md:hidden items-center gap-2 px-4 py-2 rounded-xl bg-[#04B5A3] text-white font-bold text-sm shadow-lg shadow-[#04B5A3]/20 hover:bg-[#039e8e] transition-all"
              >
                <UserIcon size={18} />
                Add User
              </button>
            </div>
            <p className="text-slate-400 mt-2 text-lg">Manage platform users, roles, and account statuses.</p>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#04B5A3] text-white font-bold shadow-lg shadow-[#04B5A3]/20 hover:bg-[#039e8e] transition-all ml-auto transform hover:scale-105 active:scale-95"
          >
            <UserIcon size={20} />
            Add User
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-end gap-3">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00E5FF] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2.5 w-64 md:w-80 rounded-2xl bg-[#0D1B2A]/50 border border-[#162d45] text-white text-sm outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20 transition-all backdrop-blur-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 rounded-2xl bg-[#0D1B2A]/50 border border-[#162d45] text-slate-400 hover:text-white hover:border-[#00E5FF]/30 transition-all backdrop-blur-md">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 border-b border-[#162d45]">
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162d45]">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-6 w-32 bg-white/5 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-40 bg-white/5 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-10 bg-white/5 rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#00E5FF]/10 to-[#9C27B0]/10 border border-white/5 flex items-center justify-center text-[#00E5FF]">
                          <UserIcon size={16} />
                        </div>
                        <p className="text-white font-bold group-hover:text-[#00E5FF] transition-colors">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-red-500'}`} />
                        <span className="text-sm text-slate-300">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {user.joined}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-slate-500 text-lg">No users found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
      {/* Add User Modal */}
      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
