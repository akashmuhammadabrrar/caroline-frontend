"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Calendar, 
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { 
  useGetEventsQuery,
  useGetMyRegistrationsQuery,
  type EventDataApi,
  type MyRegistration,
} from "../../../redux/features/player/eventsDirectoryApi";

// ── Single event card. Fetches its own status if a registrationId exists ──────
const EventCard = ({ 
  event, 
  onViewDetails, 
  isRegistered, 
  isFull,
  status 
}: { 
  event: EventDataApi; 
  onViewDetails: (id: number) => void;
  isRegistered: boolean;
  isFull: boolean;
  status?: string;
}) => {
  const isPending = status === "PENDING";

  return (
    <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] overflow-hidden hover:border-cyan-400/30 transition-all group">
      <div className="p-7">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 mr-4">
            <h3 className="text-xl font-bold text-white mb-2">{event.event_name}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar size={14} className="text-[#04B5A3]" />
                {event.event_date}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} className="text-[#04B5A3]" />
                {event.venue_name}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <User size={14} className="text-[#04B5A3]" />
                Elite Academy
              </div>
            </div>
          </div>

          {/* Status badge */}
          {isRegistered && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-black border shrink-0 ${
              isPending
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}>
              {isPending ? <Clock size={10} /> : <CheckCircle size={10} />}
              {isPending ? "Pending" : "Registered"}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-[#1E2550]">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-black mb-1">Registration Fee</span>
            <span className="text-2xl font-bold text-white">€{parseFloat(event.registration_fee || "0").toFixed(0)}</span>
          </div>
          <button
            onClick={() => onViewDetails(event.id)}
            disabled={isFull && !isRegistered}
            className={`px-8 py-3 rounded-xl font-bold transition-all border ${
              isRegistered
                ? "bg-[#0B0E1E] text-[#04B5A3] border-[#04B5A3] hover:bg-[#04B5A3]/5"
                : isFull
                ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                : "bg-[#04B5A3] text-white border-transparent hover:bg-[#039d8f] shadow-[0_4px_12px_rgba(4,181,163,0.3)]"
            }`}
          >
            {isRegistered ? "View Details" : isFull ? "Event Full" : "Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const EventsDirectoryPage = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: eventsData, isLoading } = useGetEventsQuery();
  console.log('player events ', eventsData);
  const eventsDataArr = Array.isArray(eventsData) ? eventsData : [];
  const events = (eventsData && 'results' in eventsData ? eventsData.results : undefined) || 
                 (eventsData && 'data' in eventsData ? eventsData.data : undefined) || 
                 eventsDataArr;

  const { data: registrationsData } = useGetMyRegistrationsQuery();
  const registrationsArray: MyRegistration[] = useMemo(() => {
    if (!registrationsData) return [];
    if (Array.isArray(registrationsData)) return registrationsData;
    if ('results' in registrationsData && Array.isArray(registrationsData.results)) return registrationsData.results;
    if ('data' in registrationsData && Array.isArray(registrationsData.data)) return registrationsData.data;
    return [];
  }, [registrationsData]);

  const filteredEvents = useMemo(() => {
    let result = [...events].filter((event: EventDataApi) => {
      const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "All Types" || event.event_type === typeFilter;
      const matchesLocation = locationFilter === "All Locations" || event.venue_name?.includes(locationFilter);
      return matchesSearch && matchesType && matchesLocation;
    });

    try {
      const map = JSON.parse(localStorage.getItem("playerRegistrations") || "{}") as Record<string, string>;
      result.sort((a: EventDataApi, b: EventDataApi) => {
        const aReg = !!map[String(a.id)];
        const bReg = !!map[String(b.id)];
        if (aReg !== bReg) return aReg ? 1 : -1; // Unregistered first

        // Sort by created date (newest first)
        const timeA = new Date(a.created_at || a.event_date || 0).getTime();
        const timeB = new Date(b.created_at || b.event_date || 0).getTime();
        if (timeA === timeB) return b.id - a.id;
        return timeB - timeA;
      });
    } catch {
      // safe fallback
    }

    return result;
  }, [events, searchTerm, typeFilter, locationFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, typeFilter, locationFilter]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const handleViewDetails = (id: number) => router.push(`/player/eventsDirectory/${id}`);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-8">
        Events Directory
      </h1>

      {/* Filters */}
      <div className="bg-[#121433] border border-[#1E2550] rounded-2xl p-6 mb-8 grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">Event Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-all">
            <option>All Types</option>
            <option>TOURNAMENT</option>
            <option>TRIAL</option>
            <option>SHOWCASE</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-all">
            <option>All Locations</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">Date Range</label>
          <input type="date" className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">Search</label>
          <div className="relative">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search.."
              className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-all" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#04B5A3]" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {paginatedEvents.map((event: EventDataApi) => {
              const reg = registrationsArray.find((r) => {
                const regEventId = r.event_id || (typeof r.event === 'object' && r.event !== null && 'id' in r.event ? r.event.id : r.event);
                return Number(regEventId) === Number(event.id);
              });
              const status = (reg?.status || "").toUpperCase();
              const isRegistered = !!reg && ["PENDING", "CONFIRMED", "PAID", "CONFIRM", "SUCCESS"].includes(status);
              const isFull = event.is_full || ((event.maximum_capacity ?? 0) > 0 && (event.registered_count ?? 0) >= (event.maximum_capacity ?? 0));
              
              return (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onViewDetails={handleViewDetails} 
                  isRegistered={isRegistered}
                  isFull={isFull}
                  status={reg?.status}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-10">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-xl bg-[#121433] border border-[#1E2550] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-cyan-400 text-[#0B0E1E] shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                        : "bg-[#121433] border border-[#1E2550] text-gray-400 hover:text-white"
                    }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl bg-[#121433] border border-[#1E2550] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsDirectoryPage;
