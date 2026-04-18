"use client";

import { useState, useMemo } from "react";
import { useGetDiscoveryPlayersQuery } from "@/redux/features/scout/playerDiscoverApi";
import { PlayerDiscoveryFilters } from "@/types/scout/playerDicoverType";

import { Search, RotateCw } from "lucide-react";
import { FilterSelect } from "@/components/scoutDashboard/playerDiscovery/FilterSelect";
import { PlayerCard } from "@/components/scoutDashboard/playerDiscovery/PlayerCard";
import SkeletonCard from "@/components/scoutDashboard/playerDiscovery/SkeletonCard";
import { PlayerDetailModal } from "@/components/scoutDashboard/playerDiscovery/PlayerDetailModal";

import { getFlagEmoji as getFlag } from "@/lib/utils/flagUtils";

// Filter options (unchanged)
const POSITIONS = [
  { label: "All Positions", value: "" },
  { label: "Forward", value: "Forward" },
  { label: "Midfielder", value: "Midfielder" },
  { label: "Defender", value: "Defender" },
  { label: "Goalkeeper", value: "Goalkeeper" },
];
const NATIONALITIES = [
  { label: "All Countries", value: "" },
  { label: "Spain", value: "Spain" },
  { label: "Portugal", value: "Portugal" },
  { label: "France", value: "France" },
  { label: "Germany", value: "Germany" },
  { label: "England", value: "England" },
  { label: "Brazil", value: "Brazil" },
  { label: "Italy", value: "Italy" },
];
const AGE_RANGES = [
  { label: "All Ages", value: "" },
  { label: "16–18", value: "16-18" },
  { label: "18–21", value: "18-21" },
  { label: "21–25", value: "21-25" },
  { label: "25–30", value: "25-30" },
  { label: "30+", value: "30-99" },
];

export default function PlayerDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [nationality, setNationality] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const activeFilters = useMemo<PlayerDiscoveryFilters>(() => {
    const f: PlayerDiscoveryFilters = { page };
    if (position) f.position = position;
    if (nationality) f.nationality = nationality;
    if (ageRange) {
      const [min, max] = ageRange.split("-").map(Number);
      f.age_min = min;
      f.age_max = max;
    }
    if (search) f.search = search;
    return f;
  }, [position, nationality, ageRange, search, page]);

  const { data, isLoading, isFetching } =
    useGetDiscoveryPlayersQuery(activeFilters);

  console.log("player discover data", data);

  const players = data?.results ?? [];
  const hasMore = !!data?.next;
  const loading = isLoading || isFetching;

  const handleReset = () => {
    setPosition("");
    setNationality("");
    setAgeRange("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="text-white min-h-screen">
      {/* Title */}
      <div className="mb-6">
        {" "}
        <h1 className="text-4xl font-bold mb-6 inline-block pb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
          {" "}
          Player Discovery{" "}
        </h1>{" "}
      </div>
      {/* Filters */}
      <div className="bg-[#12143A] border border-[#2DD4BF]/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Search Filters</p>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-[#2DD4BF] border border-[#2DD4BF]/40 rounded-lg px-3 py-1.5 hover:bg-[#2DD4BF]/10 transition-colors"
          >
            <RotateCw size={14} /> Reset Filters
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FilterSelect
            label="Position"
            value={position}
            onChange={(v) => {
              setPosition(v);
              setPage(1);
            }}
            options={POSITIONS}
          />
          <FilterSelect
            label="Nationality"
            value={nationality}
            onChange={(v) => {
              setNationality(v);
              setPage(1);
            }}
            options={NATIONALITIES}
          />
          <FilterSelect
            label="Age Range"
            value={ageRange}
            onChange={(v) => {
              setAgeRange(v);
              setPage(1);
            }}
            options={AGE_RANGES}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#4A6480] font-medium uppercase tracking-wider">
              Search Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6480] pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name..."
                className="w-full bg-[#0a1622] border border-[#1d3a55] rounded-lg px-3 py-2 pl-8 text-sm text-[#C8D8E8] placeholder-[#2a4060] focus:outline-none focus:border-[#2DD4BF] transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm font-semibold text-white mb-1">
            No players found
          </p>
          <p className="text-xs text-[#4A6480] mb-4">
            Try adjusting your filters
          </p>
          <button
            onClick={handleReset}
            className="text-xs text-[#2DD4BF] border border-[#2DD4BF]/40 rounded-lg px-4 py-2 hover:bg-[#2DD4BF]/10 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onViewProfile={() => {
                setSelectedPlayerId(player.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {players.length >= 6 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || !hasMore}
            className="px-8 py-2.5 rounded-lg border border-[#2DD4BF]/40 text-[#2DD4BF] text-sm font-semibold hover:bg-[#2DD4BF]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load More Players"}
          </button>
        </div>
      )}

      {/* Player Detail Modal */}
      {selectedPlayerId !== null && (
        <PlayerDetailModal
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}
    </div>
  );
}
