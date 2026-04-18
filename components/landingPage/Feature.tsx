"use client";

import { useAppSelector } from "@/redux/hooks";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { useGetFeaturedPlayersQuery } from "@/redux/features/admin/adminSettingsApi";
import { getFlagEmoji } from "@/lib/utils/flagUtils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

const Feature = () => {
  const router = useRouter();
  const theme = useAppSelector((state) => state.theme);
  const user = useAppSelector((state) => state.auth.user);
  const { data: playersData, isLoading } = useGetFeaturedPlayersQuery();

  const players = Array.isArray(playersData?.data) 
    ? playersData.data 
    : [];

  return (
    <section id="players" className="py-20 px-4 bg-[var(--bg-dark,#07142b)] text-white">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 inline-block"
            style={{
              backgroundImage: `linear-gradient(90deg, ${theme.colors.primaryCyan}, ${theme.colors.primaryMagenta})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            FEATURED PLAYERS
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Browse top football talent and explore detailed player profiles.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center text-gray-400 h-32 flex flex-col justify-center border border-dashed border-gray-700 rounded-2xl">
            <p>No featured players available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {players.map((player: any, index: number) => (
              <div
                key={player.id || index}
                className="relative p-8 bg-[var(--bg-card,#12143A)] rounded-lg flex items-center justify-between transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-cyan-500/30"
              >
                {/* Player Info */}
                <div className="flex-1">
                  <h3
                    className="font-display text-lg font-semibold mb-2"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${theme.colors.primaryCyan}, ${theme.colors.primaryMagenta})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    <span>{player.player_name || player.first_name || player.firstName}</span>
                    {!player.player_name && (player.last_name || player.lastName) && <span> {player.last_name || player.lastName}</span>}
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    {player.flag_image ? (
                      <img src={player.flag_image} alt={player.country_name || "flag"} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                    ) : (
                      <span className="text-lg">
                        {getFlagEmoji(player.country_name || player.nationality || player.country || "")}
                      </span>
                    )}
                    <span className="text-muted-foreground text-sm">
                      {player.country_name || player.nationality || player.country || "Unknown"}
                    </span>
                  </div>
                  <p className="text-purple-400 text-sm">
                    Position: {player.position || player.designation || "N/A"}
                  </p>
                </div>

                {/* Player Image */}
                <div className="w-32 h-24 rounded-lg overflow-hidden bg-navy-700 border border-gray-800 shrink-0">
                  <img
                    src={player?.player_image || player?.image || player?.profile_picture || "/images/player-placeholder.jpg"}
                    alt={player.player_name || "Player"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => {
              if (!user) {
                router.push("/login");
                return;
              }
              const role = user.role?.toUpperCase();
              if (role === "CLUB" || role === "CLUB_ACADEMY") {
                router.push("/club/playerDiscovery");
              } else if (role === "SCOUT" || role === "SCOUT_AGENT") {
                router.push("/scout/playerDiscovery");
              } else if (role === "ADMIN") {
                router.push("/admin/contentManagement");
              } else {
                toast.error("You don't have access to explore players.", {
                  style: {
                    background: "#090C22",
                    color: "#fff",
                    border: "1px solid #06A295",
                  },
                  iconTheme: {
                    primary: "#06A295",
                    secondary: "#fff",
                  },
                });
              }
            }}
            className="px-10 py-3 bg-linear-to-r from-cyan-500 to-purple-600 rounded-full text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-3"
          >
            Explore All Players <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Feature;
