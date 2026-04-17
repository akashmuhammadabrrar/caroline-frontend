"use client";

import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  User,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useGetEventsQuery,
  useGetMyRegistrationsQuery,
  useGetPastRegistrationsQuery,
  useGetUpcomingRegistrationsQuery,
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
  const s = (status || event.status || "").toUpperCase();
  const isPending = s === "PENDING";
  const isCompleted = s === "COMPLETED";

  const handleRegister = () => {
    if (isRegistered) {
      toast.error("You are already registered for this event.");
      return;
    }
    onViewDetails(event.id);
  };

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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-black">Capacity</span>
              <span className="text-sm font-bold text-white">
                <span className="text-[#04B5A3]">
                  {Math.max(
                    event.registered_count || 0,
                    Array.isArray((event as any).participants)
                      ? (event as any).participants.length
                      : 0,
        
                  )}
                </span>
                <span className="text-gray-500 mx-1">/</span>
                {event.maximum_capacity || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-black">Fee</span>
              <span className="text-lg font-black text-white">€{parseFloat(event.registration_fee || "0").toFixed(0)}</span>
            </div>
          </div>
          
          <button
            onClick={() => onViewDetails(event.id)}
            disabled={isRegistered || (!isRegistered && (isFull || isPending || isCompleted))}
            className={`px-8 py-3 rounded-xl font-bold transition-all border flex items-center justify-center ${
              isRegistered
                ? "bg-[#0B0E1E] text-[#04B5A3] border-[#04B5A3] hover:bg-[#04B5A3]/5"
                : isPending
                ? "bg-[#0B0E1E] text-amber-500 border-amber-500/20 cursor-not-allowed"
                : isCompleted
                ? "bg-[#0B0E1E] text-blue-500 border-blue-500/20 cursor-not-allowed"
                : isFull
                ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                : "bg-[#04B5A3] text-white border-transparent hover:bg-[#039d8f] shadow-[0_4px_12px_rgba(4,181,163,0.3)]"
            }`}
          >
            {isRegistered 
              ? "Already Registered" 
              : isPending 
              ? "Pending Status" 
              : isCompleted
              ? "Completed"
              : isFull
              ? "Registration Full"
              : "Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const EventsDirectoryPage = () => {
  const router = useRouter();
  const currentUser = useAppSelector((state: any) => state.auth?.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [activeTab, setActiveTab] = useState<"BROWSE" | "UPCOMING" | "PAST">("BROWSE");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { data: eventsData, isLoading: isEventsLoading } = useGetEventsQuery();
  console.log('all events ',eventsData);
  const { data: upcomingData, isLoading: isUpcomingLoading } = useGetUpcomingRegistrationsQuery();
  const { data: pastData, isLoading: isPastLoading } = useGetPastRegistrationsQuery();
  const { data: myRegistrationsData } = useGetMyRegistrationsQuery();

  const isLoading = isEventsLoading || isUpcomingLoading || isPastLoading;

  const eventsArray: EventDataApi[] = useMemo(() => {
    if (!eventsData) return [];
    let data = [];
    if (Array.isArray(eventsData)) {
      data = eventsData;
    } else {
      data = (eventsData as any).results || (eventsData as any).data || [];
    }

    // Sort by created_at DESC (Newest first)
    return [...data].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [eventsData]);

  const upcomingArray: MyRegistration[] = useMemo(() => {
    if (!upcomingData) return [];
    if (Array.isArray(upcomingData)) return upcomingData;
    return (upcomingData as any).results || (upcomingData as any).data || [];
  }, [upcomingData]);

  const pastArray: MyRegistration[] = useMemo(() => {
    if (!pastData) return [];
    if (Array.isArray(pastData)) return pastData;
    return (pastData as any).results || (pastData as any).data || [];
  }, [pastData]);

  const myRegistrationsArray: MyRegistration[] = useMemo(() => {
    if (!myRegistrationsData) return [];
    if (Array.isArray(myRegistrationsData)) return myRegistrationsData;
    return (myRegistrationsData as any).results || (myRegistrationsData as any).data || [];
  }, [myRegistrationsData]);

  const filteredItems = useMemo(() => {
    if (activeTab === "BROWSE") {
      return eventsArray.filter(e => {
        const s = (e.status || "").toUpperCase();
        const matchesSearch = e.event_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "All Types" || e.event_type === typeFilter;
        
        // Show ACTIVE, PENDING, COMPLETED. Exclude CANCELLED.
        const isVisible = (s === "ACTIVE" || s === "PENDING" || s === "COMPLETED" || !s) && s !== "CANCELLED";
        
        return isVisible && matchesSearch && matchesType;
      });
    }
    
    const source = activeTab === "UPCOMING" ? upcomingArray : pastArray;
    return source.filter(r => {
      const event = typeof r.event === 'object' ? r.event : r.event_details;
      const name = (event as any)?.event_name || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [activeTab, eventsArray, upcomingArray, pastArray, searchTerm, typeFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, typeFilter, activeTab]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handleViewDetails = (id: number) => router.push(`/player/eventsDirectory/${id}`);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-8">
        Events Directory
      </h1>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-[#121433]/50 p-1.5 rounded-2xl border border-[#1E2550] w-fit">
        {[
          { id: "BROWSE", label: "Browse Events" },
          { id: "UPCOMING", label: "Upcoming" },
          { id: "PAST", label: "Past Events" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? "bg-cyan-400 text-[#0B0E1E] shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                : "text-gray-500 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#121433] border border-[#1E2550] rounded-2xl p-6 mb-8 grid md:grid-cols-3 gap-4">
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
            {paginatedItems.map((item: any) => {
              const isRegistration = 'event' in item || 'event_details' in item;
              const event = isRegistration ? (item.event_details || item.event) : item;
              
              const status = (isRegistration 
                ? (item.status || item.registration_status || "") 
                : (event.status || "")
              ).toUpperCase();

              const checkIsRegistered = (regArray: MyRegistration[]) => {
                return regArray.some(u => {
                  const regEventId = u.event_id || (typeof u.event === 'object' && u.event !== null ? (u.event as any).id : u.event) || u.event_details?.id;
                  return Number(regEventId) === Number(event.id);
                });
              };

              const isRegistered = isRegistration || checkIsRegistered(upcomingArray) || checkIsRegistered(pastArray) || checkIsRegistered(myRegistrationsArray);
              
              const totalReg = Math.max(
                event.registered_count || 0,
                Array.isArray((event as any).participants) ? (event as any).participants.length : 0
              );
              const isFull = event.is_full === true || ((event.maximum_capacity ?? 0) > 0 && totalReg >= (event.maximum_capacity ?? 0));
              
              return (
                <EventCard 
                  key={item.id} 
                  event={event} 
                  onViewDetails={handleViewDetails} 
                  isRegistered={isRegistered}
                  isFull={isFull}
                  status={status}
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
