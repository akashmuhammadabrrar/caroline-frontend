"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, MessageSquare, ChevronDown, Mail, Info, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetAllScoutsQuery } from "@/redux/features/scout/scoutDirectoryApi";
import { useCreateConversationMutation } from "@/redux/features/chat/chatApi";

const COUNTRIES = [
  "All Countries",
  "Spain",
  "England",
  "Brazil",
  "Netherlands",
  "UAE",
  "Japan",
];

const SPECS = [
  "All Specializations",
  "Youth Scouting",
  "Technical Analysis",
  "International Scouting",
  "Talent ID",
  "Position-based",
  "Youth Development",
];

interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

const FilterSelect = ({ value, onChange, options }: FilterSelectProps) => (
  <div className="relative w-full">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-[#0B0D2C] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-colors cursor-pointer pr-10"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0B0D2C]">
          {o}
        </option>
      ))}
    </select>
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
      <ChevronDown size={16} />
    </span>
  </div>
);

export default function ScoutDirectoryPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const scoutsPerPage = 6;

  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [specFilter, setSpecFilter] = useState("All Specializations");
  const [searchTerm, setSearchTerm] = useState("");

  // Messaging Modal State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedScoutForMessage, setSelectedScoutForMessage] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: apiData, isLoading, isError } = useGetAllScoutsQuery();
  const [createConversation, { isLoading: isSendingMessage }] = useCreateConversationMutation();

  // Handle nested results depending on response structure
  const rawScouts = Array.isArray(apiData?.results) ? apiData.results : [];

  const handleOpenMessageModal = (scout: any) => {
    setSelectedScoutForMessage(scout);
    setIsMessageModalOpen(true);
    setMessageText("");
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedScoutForMessage) return;

    // Use user.id or id as receiver ID. It's usually the user_id for chat
    const receiverId =
      selectedScoutForMessage?.originalData?.user?.id ||
      (selectedScoutForMessage as any)?.user?.id ||
      selectedScoutForMessage.id;
    if (!receiverId) {
      toast.error("Cannot message this scout: missing ID");
      return;
    }

    try {
      await createConversation({
        receiver_id: receiverId,
        message: messageText.trim(),
      }).unwrap();

      toast.success(`Message sent to ${selectedScoutForMessage.name}`);
      setIsMessageModalOpen(false);
      setMessageText("");

      // Link to scout messaging with userId
      router.push(`/scout/messaging?userId=${receiverId}&role=SCOUT_AGENT`);
    } catch (error) {
      console.error("Message error:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleReset = () => {
    setCountryFilter("All Countries");
    setSpecFilter("All Specializations");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Process mapping API data to component state w/ Fallbacks
  const scouts = rawScouts.map((s: any) => {
    return {
      id: s.id,
      name: typeof s.scout_name === 'string' ? s.scout_name : (s.scout_name?.name || "Unknown Scout"),
      title: typeof s.position === 'string' ? s.position : (s.position?.name || "Scout"),
      location: typeof s.location === 'string' ? s.location : (s.location?.name || "Location not provided"),
      specializations: Array.isArray(s.specialization) && s.specialization.length > 0 
        ? s.specialization.map((spec: any) => typeof spec === 'string' ? spec : (spec?.name || 'Specialization')) 
        : ["General Scouting"],
      experience: typeof s.experience === 'number' || typeof s.experience === 'string' ? s.experience : 0,
      connections: typeof s.connections === 'number' || typeof s.connections === 'string' ? s.connections : 0,
      image: typeof s.scout_logo === 'string' ? s.scout_logo : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      originalData: s,
    };
  });

  const filteredScouts = useMemo(() => {
    return scouts.filter((scout: any) => {
      const matchSearch =
        scout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scout.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Basic Country matching logic in location if strict data unavailable
      const matchCountry =
        countryFilter === "All Countries" || 
        (scout.location && scout.location.toLowerCase().includes(countryFilter.toLowerCase()));
      
      const matchSpec =
        specFilter === "All Specializations" ||
        scout.specializations.includes(specFilter);
      return matchSearch && matchCountry && matchSpec;
    });
  }, [scouts, searchTerm, countryFilter, specFilter]);

  const indexOfLast = currentPage * scoutsPerPage;
  const indexOfFirst = indexOfLast - scoutsPerPage;
  const currentScouts = filteredScouts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredScouts.length / scoutsPerPage);

  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white font-sans ">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6 inline-block pb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
          Scout Directory
        </h1>
      </div>

      <div >
        {/* Search Filters */}
        <div className="bg-[#12143A] border border-[#04B5A3]/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Search Filters</h2>
            <button
              onClick={handleReset}
              className="text-sm font-medium text-[#00E5FF] border border-[#00E5FF]/40 rounded-lg px-4 py-2 hover:bg-[#00E5FF]/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <FilterSelect
              value={countryFilter}
              onChange={setCountryFilter}
              options={COUNTRIES}
            />
            <FilterSelect
              value={specFilter}
              onChange={setSpecFilter}
              options={SPECS}
            />

            {/* Search input */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ..."
                className="w-full bg-[#0B0D2C] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#00E5FF] transition-colors"
              />
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-[#00E5FF]">
             <Loader2 size={32} className="animate-spin" />
             <span className="ml-3 font-medium">Loading Scouts...</span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-20">
             <span className="text-red-400">Failed to load scouts. Please try again.</span>
          </div>
        ) : (
          /* Scouts Grid */
          <>
            {currentScouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[#12143A] border border-white/[0.08] rounded-xl">
                <p className="text-base font-semibold text-white mb-2">
                  No scouts found
                </p>
                <p className="text-sm text-white/50 mb-5">
                  Try adjusting your filters
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-[#00E5FF] border border-[#00E5FF]/40 rounded-lg px-5 py-2 hover:bg-[#00E5FF]/10 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentScouts.map((scout: any) => (
                  <div
                    key={scout.id}
                    className="bg-[#12143A] border border-[#04B5A3]/30 rounded-xl p-6 flex flex-col transition-all duration-200 hover:shadow-[0_10px_30px_rgba(4,181,163,0.1)] hover:-translate-y-1"
                  >
                    {/* Header Box (Avatar + Info) */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10">
                        <Image
                          src={(() => {
                            const url = scout.image;
                            if (!url || url === "null" || url === "") return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop";
                            if (url.startsWith("http") || url.startsWith("/")) return url;
                            return `/${url}`;
                          })()}
                          alt={scout.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-medium text-white truncate">
                          {typeof scout.name === 'string' ? scout.name : 'Unknown Scout'}
                        </h3>
                        <p className="text-xs text-white/60 mb-2 truncate">
                          {typeof scout.title === 'string' ? scout.title : 'Scout'}
                        </p>
                        <p className="text-xs text-[#00E5FF] flex items-center gap-1.5 font-medium truncate">
                          <MapPin size={12} className="flex-shrink-0" /> 
                          <span className="truncate">
                            {typeof scout.location === 'string' ? scout.location : 'Location not provided'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="mb-6">
                      <p className="text-xs text-white/50 mb-3">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {scout.specializations.slice(0, 3).map((spec: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium text-[#00E5FF] bg-white/[0.04] px-3 py-1.5 rounded-full"
                          >
                            {typeof spec === 'string' ? spec : (spec?.name || 'Specialization')}
                          </span>
                        ))}
                        {scout.specializations.length > 3 && (
                           <span className="text-[11px] font-medium text-[#00E5FF] bg-white/[0.04] px-3 py-1.5 rounded-full">
                           {`+${scout.specializations.length - 3} more`}
                         </span>
                        )}
                      </div>
                    </div>

                    {/* Experience and Connections Grid */}
                    <div className="flex items-center justify-between mt-auto mb-6">
                        <div className="flex items-center gap-1">
                          <span className="text-white/45 text-[10px] uppercase tracking-wider">Experience:</span>
                          <span className="text-[#00E5FF] text-[11px] font-bold">
                            {typeof scout.experience === 'number' || typeof scout.experience === 'string' ? scout.experience : '0'} years
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white/45 text-[10px] uppercase tracking-wider">Connections:</span>
                          <span className="text-[#9C27B0] text-[11px] font-bold">
                            {typeof scout.connections === 'number' || typeof scout.connections === 'string' ? scout.connections : '0'}
                          </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-auto">
                      <Link
                        href={`/scout/scoutDirectory/${scout.id}`}
                        className="flex-1 py-2.5 rounded-lg bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black text-sm font-semibold transition-all duration-200 text-center block"
                      >
                        View Profile
                      </Link>
                      <button 
                         onClick={() => handleOpenMessageModal(scout)}
                         className="w-[42px] h-[42px] rounded-lg border border-white/[0.08] flex items-center justify-center hover:bg-white/5 transition-colors flex-shrink-0"
                         title={`Message ${scout.name}`}
                      >
                        <MessageSquare size={18} className="text-[#00E5FF]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2 rounded-lg border border-[#00E5FF]/40 text-[#00E5FF] text-sm font-medium hover:bg-[#00E5FF]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/75">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2 rounded-lg border border-[#00E5FF]/40 text-[#00E5FF] text-sm font-medium hover:bg-[#00E5FF]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Messaging Modal */}
        {isMessageModalOpen && selectedScoutForMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[#12143A] border border-[#1E2550] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#1E2550]">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full border-2 border-[#04B5A3]/30 overflow-hidden">
                    <Image
                      src={(() => {
                        const url = selectedScoutForMessage.image;
                        if (!url || url === "null" || url === "") return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop";
                        if (url.startsWith("http") || url.startsWith("/")) return url;
                        return `/${url}`;
                      })()}
                      alt={selectedScoutForMessage.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Message {typeof selectedScoutForMessage.name === 'string' ? selectedScoutForMessage.name : 'Scout'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {typeof selectedScoutForMessage.title === 'string' ? selectedScoutForMessage.title : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMessageModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Your Message
                  </label>
                  <textarea
                    autoFocus
                    className="w-full h-40 p-4 rounded-2xl bg-[#0B0E1E] border border-[#1E2550] text-white focus:outline-none focus:border-[#04B5A3]/50 transition-all resize-none placeholder:text-gray-600"
                    placeholder={`Hi ${typeof selectedScoutForMessage.name === 'string' ? selectedScoutForMessage.name.split(" ")[0] : 'Scout'}, let's connect...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 text-amber-500/80 bg-amber-500/5 rounded-xl p-3 border border-amber-500/10">
                  <Info size={16} className="shrink-0" />
                  <p className="text-[10px] leading-tight">
                    Your message will be sent directly to the scout's inbox.
                    They will be notified immediately.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-2 flex gap-3">
                <button
                  onClick={() => setIsMessageModalOpen(false)}
                  className="flex-1 h-14 rounded-xl border border-[#1E2550] text-gray-400 font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSendingMessage}
                  className="flex-[2] h-14 rounded-xl bg-linear-to-r from-[#04B5A3] to-[#039d8f] text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_20px_-5px_rgba(4,181,163,0.3)] flex items-center justify-center gap-2"
                >
                  {isSendingMessage ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Mail size={18} />
                  )}
                  {isSendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
