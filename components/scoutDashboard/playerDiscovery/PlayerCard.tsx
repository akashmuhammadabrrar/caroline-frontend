/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFlagEmoji as getFlag } from "@/lib/utils/flagUtils";
import { useCreateConversationMutation } from "@/redux/features/chat/chatApi";
import {
  useAddToShortlistMutation,
  useRemoveFromShortlistMutation,
} from "@/redux/features/scout/playerDiscoverApi";
import { DiscoveryPlayer } from "@/types/scout/playerDicoverType";
import { MessageCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Avatar } from "./Avatar";

interface PlayerCardProps {
  player: DiscoveryPlayer;
  onViewProfile: () => void;
}

export const PlayerCard = ({ player, onViewProfile }: PlayerCardProps) => {
  // Local UI state
  const [starred, setStarred] = useState(player.is_shortlisted ?? false);
  const [shortlistId, setShortlistId] = useState<number | undefined>(
    player.shortlist_id,
  );

  const [addToShortlist] = useAddToShortlistMutation();
  const [removeFromShortlist] = useRemoveFromShortlistMutation();
  const [createConversation, { isLoading: isCreatingChat }] =
    useCreateConversationMutation();
  const router = useRouter();

  const handleStarClick = async () => {
    const wasStarred = starred;
    setStarred(!wasStarred);
// console.log({ wasStarred });

    try {
      if (wasStarred && shortlistId) {
        await removeFromShortlist(shortlistId).unwrap();
        setShortlistId(undefined);
        toast.success("Removed from shortlist!");
      } else if (!wasStarred) {
        const res = await addToShortlist({ player: player.id }).unwrap();
        setShortlistId(res.id);
        toast.success("Added to shortlist!");
      }
    } catch (err: any) {
      console.error("Shortlist error:", err);
      const errorDetail =
        err?.data?.detail || err?.error || "Something went wrong!";
      toast.error(errorDetail);
      setStarred(wasStarred);
    }
  };

  const handleMessageClick = () => {
    // If we have user.id, use it. If not, pass player.id and the messaging page will resolve the correct user.id from the detail fetch.
    const userId = player.user?.id;
    const playerId = player.id;

    if (!userId && !playerId) {
      toast.error("Cannot identify this player for messaging.");
      return;
    }

    const query = new URLSearchParams();
    if (playerId) query.set("playerId", String(playerId));
    if (userId) query.set("userId", String(userId));
    query.set("role", "PLAYER");

    router.push(`/scout/messaging?${query.toString()}`);
  };

  if (!player) return <h1>No player found!</h1>;

// console.log();
// console.log();

  return (
    <div className="bg-[#12143A] border border-[#2DD4BF]/30 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_0_20px_rgba(45,212,191,0.06)] flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar player={player} size={48} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {player.first_name ? player.first_name : "Empty"}{" "}
              {player.last_name ? player.last_name : "Empty"}
            </p>
            <p className="text-[11px] text-[#4A6480] mt-0.5">
              {player.designation ? player.designation : "No designation"}
            </p>
          </div>
        </div>
        <button
          onClick={handleStarClick}
          className={`flex-shrink-0 transition-transform p-1 rounded ${
            starred ? "bg-[#2DD4BF]/20" : "bg-transparent"
          } hover:scale-110`}
        >
          <Star
            size={15}
            fill={starred ? "#2DD4BF" : "none"}
            stroke={starred ? "#2DD4BF" : "#4A6480"}
          />
        </button>
      </div>

      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#4A6480]">Nationality:</span>
          <span className="text-[11px] text-[#C8D8E8] flex items-center gap-1">
            {getFlag(player.nationality)} {player.nationality}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#4A6480]">Age:</span>
          <span className="text-[11px] text-[#C8D8E8]">{player.age} years</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#4A6480]">Highlight Video:</span>
          <span
            className={`text-[11px] font-medium ${
              player.highlight_video_available
                ? "text-[#2DD4BF]"
                : "text-[#4A6480]"
            }`}
          >
            {player.highlight_video_available ? "Available" : "Not available"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#4A6480]">Current Club:</span>
          <span className="text-[11px] font-medium text-[#2DD4BF] truncate max-w-[120px]">
            {player.current_club || "—"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onViewProfile}
          className="flex-1 py-2 rounded-lg bg-[#2DD4BF] text-white text-xs font-semibold transition-all duration-200"
        >
          View Profile
        </button>
        <button
          onClick={handleMessageClick}
          disabled={isCreatingChat}
          className="w-9 h-9 rounded-lg bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center justify-center hover:bg-[#2DD4BF] hover:text-[#0a1218] transition-all duration-200 disabled:opacity-50"
        >
          <MessageCircle size={15} />
        </button>
      </div>
    </div>
  );
};
