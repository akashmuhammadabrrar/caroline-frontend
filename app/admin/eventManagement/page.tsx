"use client";

import React, { useState } from "react";
import { Search, Filter, Calendar, MapPin, Eye, Plus, Loader2, Trash2, Pencil, CheckCircle, CheckCircle2, X, Clock } from "lucide-react";
import Link from "next/link";
import { useGetEventsQuery, useDeleteEventMutation, useUpdateEventStatusMutation } from "@/redux/features/admin/adminEventApi";
import toast from "react-hot-toast";

const EventManagementPage = () => {
  const { data: response, isLoading } = useGetEventsQuery();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [updateStatus, { isLoading: isStatusUpdating }] = useUpdateEventStatusMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const events = response?.data || [];

  const handleStatusUpdate = async (id: number | string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(`Event marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to update status to ${newStatus}`);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await deleteEvent(id).unwrap();
        toast.success("Event deleted successfully");
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete event");
      }
    }
  };

  const filteredEvents = events.filter((event) =>
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 bg-transparent">
      {/* Header section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
            Event Management
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Create and oversee platform tournaments and scouting events.</p>
        </div>

        <Link
          href="/admin/eventManagement/create"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#04B5A3] text-white font-bold shadow-lg shadow-[#04B5A3]/20 hover:bg-[#039e8e] transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Add Event
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-end gap-3">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00E5FF] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search events..."
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
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162d45]">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-6 w-48 bg-white/5 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 bg-white/5 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-32 bg-white/5 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-white/5 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-white/5 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-10 w-10 bg-white/5 rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      {event.event_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-400" />
                        {event.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-red-400" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {event.fee}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                        event.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        event.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        event.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {event.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.is_featured ? (
                         <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Featured
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px] uppercase font-bold">Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <select 
                          value={event.status || 'PENDING'}
                          onChange={(e) => handleStatusUpdate(event.id, e.target.value)}
                          disabled={isStatusUpdating}
                          className="bg-[#0B0E1E] border border-[#1E2550] text-xs font-bold text-gray-400 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACTIVE">Active</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancel</option>
                        </select>

                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/admin/eventManagement/${event.id}`}
                            title="View Details"
                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all transform hover:scale-110 border border-white/10"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link 
                            href={`/admin/eventManagement/${event.id}/edit`}
                            title="Edit Event"
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-110 border border-emerald-500/20"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            title="Hard Delete Event"
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 border border-red-500/20"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="text-slate-500 text-lg">No events found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventManagementPage;
