/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCreateConversationMutation } from "@/redux/features/chat/chatApi";
import { useGetDiscoveryPlayersQuery } from "@/redux/features/club/playerDiscoveryApi";
import {
  ChevronRight,
  Info,
  LayoutGrid,
  Mail,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

// Types
interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  height: string;
  weight: string;
  preferredFoot: string;
  cleanSheets?: number;
  saves?: number;
}

interface Player {
  id: number;
  name: string;
  position: string;
  nationality: string;
  nationalityCode: string;
  age: number;
  rating: number;
  image: string;
  stats: PlayerStats;
}

const PlayerDiscoveryPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("All Positions");
  const [nationalityFilter, setNationalityFilter] =
    useState<string>("All Countries");
  const [ageFilter, setAgeFilter] = useState<string>("All Ages");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedPlayerForMessage, setSelectedPlayerForMessage] = useState<
    any | null
  >(null);
  const [messageText, setMessageText] = useState("");

  const { data: apiData, isLoading, isError } = useGetDiscoveryPlayersQuery({});
  const [createConversation, { isLoading: isSendingMessage }] =
    useCreateConversationMutation();

  // Safely map API response allowing for {success, data} envelope, paginated {results}, or direct array
  const rawPlayers = Array.isArray(apiData?.data?.results)
    ? apiData.data.results
    : Array.isArray(apiData?.results)
      ? apiData.results
      : Array.isArray(apiData?.data)
        ? apiData.data
        : Array.isArray(apiData)
          ? apiData
          : [];

  const handleOpenMessageModal = (player: Player) => {
    setSelectedPlayerForMessage(player);
    setIsMessageModalOpen(true);
    setMessageText("");
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedPlayerForMessage) return;

    // Extract receiver ID: prefer user.id, fallback to player id
    const receiverId =
      selectedPlayerForMessage.originalData?.user?.id ||
      selectedPlayerForMessage.originalData?.id;
    if (!receiverId) {
      toast.error("Cannot message this player: missing user ID");
      return;
    }

    try {
      await createConversation({
        receiver_id: receiverId,
        message: messageText.trim(),
      }).unwrap();

      toast.success(`Message sent to ${selectedPlayerForMessage.name}`);
      setIsMessageModalOpen(false);
      setMessageText("");

      // Navigate to messaging page with both user ID and player ID
      router.push(`/club/messaging?userId=${receiverId}&playerId=${selectedPlayerForMessage.id}`);
    } catch (error) {
      console.error("Message error:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Process data with Fallbacks so UI never breaks
  const players: Player[] = rawPlayers.map((p: any) => {
    const firstName = p?.user?.first_name || p?.first_name || "Unknown";
    const lastName = p?.user?.last_name || p?.last_name || "Player";
    const pos =
      typeof p?.primary_position === "string"
        ? p.primary_position.replace(/_/g, " ")
        : p?.position || "Position N/A";

    return {
      id: p?.id || Math.random(),
      name: `${firstName} ${lastName}`,
      position: pos,
      nationality: p?.nationality || "Unknown",
      nationalityCode: p?.nationality ? "🏳️" : "🌍", // Fallback flag
      age: p?.age || 20, // Default age
      rating: p?.rating || 80, // Default rating
      image:
        p?.profile_image ||
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      stats: {
        matches: p?.matches_played || 0,
        goals: p?.goals_scored || 0,
        assists: p?.assists || 0,
        height: p?.height ? `${p.height} cm` : "N/A",
        weight: p?.weight ? `${p.weight} kg` : "N/A",
        preferredFoot: p?.preferred_foot || "Right",
      },
      originalData: p, // Keep original data for IDs
    };
  });

  const filteredPlayers = useMemo(() => {
    return players.filter((player: Player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPosition =
        positionFilter === "All Positions" ||
        player.position === positionFilter;
      const matchesNationality =
        nationalityFilter === "All Countries" ||
        player.nationality === nationalityFilter;

      let matchesAge = true;
      if (ageFilter === "Under 18") matchesAge = player.age < 18;
      else if (ageFilter === "18-21")
        matchesAge = player.age >= 18 && player.age <= 21;
      else if (ageFilter === "22-25")
        matchesAge = player.age >= 22 && player.age <= 25;
      else if (ageFilter === "25+") matchesAge = player.age > 25;

      return (
        matchesSearch && matchesPosition && matchesNationality && matchesAge
      );
    });
  }, [players, searchTerm, positionFilter, nationalityFilter, ageFilter]);

  return (
    <div className="min-h-screen bg-[#0A0C20] text-gray-100 p-4 md:p-8 font-sans">
      <div className="   mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent tracking-tight">
            Player Discovery
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-[#12143A] p-2 rounded-lg border border-[#1E2550] text-[#04B5A3]">
              <LayoutGrid size={20} />
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-[#12143A]/60 backdrop-blur-md rounded-2xl p-6 border border-[#1E2550] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Position Filter */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Position
              </label>
              <div className="relative group">
                <select
                  className="w-full h-14 pl-5 pr-12 rounded-xl bg-[#0B0E1E] border border-[#1E2550] text-white focus:outline-none focus:border-[#04B5A3]/50 transition-all appearance-none cursor-pointer hover:bg-[#0B0E1E]/80"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option className="bg-[#12143A]">All Positions</option>
                  <option className="bg-[#12143A]">Goalkeeper</option>
                  <option className="bg-[#12143A]">Defender</option>
                  <option className="bg-[#12143A]">Midfielder</option>
                  <option className="bg-[#12143A]">Forward</option>
                </select>
                <ChevronRight
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#04B5A3] pointer-events-none group-hover:scale-110 transition-transform"
                />
              </div>
            </div>

            {/* Nationality Filter */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Nationality
              </label>
              <div className="relative group">
                <select
                  className="w-full h-14 pl-5 pr-12 rounded-xl bg-[#0B0E1E] border border-[#1E2550] text-white focus:outline-none focus:border-[#04B5A3]/50 transition-all appearance-none cursor-pointer hover:bg-[#0B0E1E]/80"
                  value={nationalityFilter}
                  onChange={(e) => setNationalityFilter(e.target.value)}
                >
                  <option className="bg-[#12143A]">All Countries</option>
                  <option className="bg-[#12143A]">Spain</option>
                  <option className="bg-[#12143A]">Portugal</option>
                  <option className="bg-[#12143A]">France</option>
                  <option className="bg-[#12143A]">Italy</option>
                  <option className="bg-[#12143A]">Japan</option>
                  <option className="bg-[#12143A]">Argentina</option>
                </select>
                <ChevronRight
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#04B5A3] pointer-events-none group-hover:scale-110 transition-transform"
                />
              </div>
            </div>

            {/* Age Range Filter */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Age Range
              </label>
              <div className="relative group">
                <select
                  className="w-full h-14 pl-5 pr-12 rounded-xl bg-[#0B0E1E] border border-[#1E2550] text-white focus:outline-none focus:border-[#04B5A3]/50 transition-all appearance-none cursor-pointer hover:bg-[#0B0E1E]/80"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                >
                  <option className="bg-[#12143A]">All Ages</option>
                  <option className="bg-[#12143A]">Under 18</option>
                  <option className="bg-[#12143A]">18-21</option>
                  <option className="bg-[#12143A]">22-25</option>
                  <option className="bg-[#12143A]">25+</option>
                </select>
                <ChevronRight
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#04B5A3] pointer-events-none group-hover:scale-110 transition-transform"
                />
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Search
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full h-14 pl-12 pr-5 rounded-xl bg-[#0B0E1E] border border-[#1E2550] text-white placeholder-gray-600 focus:outline-none focus:border-[#04B5A3]/50 transition-all hover:bg-[#0B0E1E]/80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#04B5A3] group-focus-within:scale-110 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlayers.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#12143A]/20 rounded-2xl border border-dashed border-[#1E2550]">
              <p className="text-gray-500 text-xl font-medium tracking-wide">
                No players found matching your criteria
              </p>
            </div>
          ) : (
            filteredPlayers.map((player: Player) => (
              <div
                key={player.id}
                className="group bg-[#12143A]/40 backdrop-blur-sm p-6 rounded-[28px] border border-[#1E2550] hover:border-[#04B5A3]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(4,181,163,0.1)] hover:-translate-y-2"
              >
                {/* Player Card Header */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative w-20 h-20 shrink-0">
                    <div className="absolute inset-0 bg-linear-to-br from-[#04B5A3] to-[#9C27B0] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative w-full h-full rounded-full border-2 border-[#1E2550] overflow-hidden group-hover:border-[#04B5A3]/50 transition-colors">
                      <Image
                        src={player.image}
                        alt={player.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-white truncate leading-tight group-hover:text-[#00E5FF] transition-colors">
                      {player.name}
                    </h3>
                    <p className="text-gray-500 font-medium tracking-wide">
                      {player.position}
                    </p>
                  </div>
                </div>

                {/* Player Details Stats */}
                <div className="space-y-6 mb-8 mt-4">
                  <div className="flex items-center justify-between group/line">
                    <span className="text-gray-400 text-sm font-medium">
                      Nationality:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none scale-125">
                        {player.nationalityCode}
                      </span>
                      <span className="text-gray-200 font-semibold group-hover/line:text-white transition-colors">
                        {player.nationality}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group/line">
                    <span className="text-gray-400 text-sm font-medium">
                      Age:
                    </span>
                    <span className="text-gray-200 font-semibold group-hover/line:text-white transition-colors">
                      {player.age} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between group/line">
                    <span className="text-gray-400 text-sm font-medium">
                      Rating:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#04B5A3] text-lg font-bold group-hover/line:scale-110 transition-transform">
                        {player.rating}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      router.push(`/club/playerDiscovery/${player.id}`)
                    }
                    className="flex-1 h-14 rounded-xl bg-[#04B5A3] text-white font-bold hover:bg-[#039d8f] active:scale-[0.97] transition-all shadow-[0_8px_20px_-5px_rgba(4,181,163,0.3)] shadow-cyan-950/20"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleOpenMessageModal(player)}
                    className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl bg-[#0B0E1E] border border-[#1E2550] text-gray-400 hover:text-[#04B5A3] hover:border-[#04B5A3]/50 active:scale-[0.9] transition-all"
                    aria-label={`Message ${player.name}`}
                  >
                    <MessageSquare size={22} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messaging Modal */}
        {isMessageModalOpen && selectedPlayerForMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[#12143A] border border-[#1E2550] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#1E2550]">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full border-2 border-[#04B5A3]/30 overflow-hidden">
                    <Image
                      src={selectedPlayerForMessage.image}
                      alt={selectedPlayerForMessage.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Message {selectedPlayerForMessage.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {selectedPlayerForMessage.position}
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
                    placeholder={`Hi ${selectedPlayerForMessage.name.split(" ")[0]}, I'm interested in your profile...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 text-amber-500/80 bg-amber-500/5 rounded-xl p-3 border border-amber-500/10">
                  <Info size={16} className="shrink-0" />
                  <p className="text-[10px] leading-tight">
                    Your message will be sent directly to the player's inbox.
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

      {/* Custom Scrollbar Styling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(18, 20, 58, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e2550;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #04b5a3;
        }
      `}</style>
    </div>
  );
};

export default PlayerDiscoveryPage;
