/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Eye, Star, CalendarDays, MessageSquare, User } from "lucide-react";
import { 
  useGetProfileQuery, 
  useGetDashboardStatsQuery, 
  useGetShortlistedPlayersQuery 
} from "@/redux/features/scout/scoutProfileApi";
import { useGetConversationsQuery } from "@/redux/features/chat/chatApi";
import { useGetEventsQuery } from "@/redux/features/admin/adminEventApi";
import { useGetLatestNewsQuery } from "@/redux/features/home/homeApi";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { useMemo } from "react";
import Link from "next/link";

/* ─── Fake Data ─────────────────────────────────────────────── */
const shortlistedPlayers = [
  {
    name: "John Doe",
    position: "Midfielder",
    nationality: "Spain",
    flag: "🇪🇸",
    age: 19,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sarah Player",
    position: "Forward",
    nationality: "Portugal",
    flag: "🇵🇹",
    age: 18,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Mike Johnson",
    position: "Defender",
    nationality: "France",
    flag: "🇫🇷",
    age: 20,
    image: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];



/* ─── Stat Card ─────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  iconColor: string;
  subColor: string;
}

const StatCard = ({ icon, label, value, sub, iconColor, subColor }: StatCardProps) => (
  <div className="bg-[#12143A] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-1">
    <div className={`mb-1 ${iconColor}`}>{icon}</div>
    <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className={`text-xs font-medium ${subColor}`}>{sub}</p>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
const ScoutDashboard: React.FC = () => {
  const { data: profile } = useGetProfileQuery();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: shortlistData } = useGetShortlistedPlayersQuery();
  const { data: chatData } = useGetConversationsQuery();
  const { data: eventsData, isLoading: isEventsLoading } = useGetEventsQuery();
  const { data: newsData, isLoading: isNewsLoading } = useGetLatestNewsQuery();

  const newsItems = useMemo(() => {
    const items = [...(newsData?.articles || newsData?.data || [])];
    return items.sort((a: any, b: any) => {
      const dateA = a.date_published ? parseISO(a.date_published).getTime() : 0;
      const dateB = b.date_published ? parseISO(b.date_published).getTime() : 0;
      return dateB - dateA;
    });
  }, [newsData]);

  const scoutName = profile?.first_name || "Member";
  const shortlistedPlayers = shortlistData?.results || [];
  
  const conversations = chatData?.conversations || [];
  const dynamicRecentMessages = conversations.slice(0, 3).map((conv) => ({
    name: conv.other_participant?.name || conv.name || "Unknown",
    preview: conv.last_message?.content || conv.last_message_text || "Started a conversation",
    time: conv.updated_at ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }) : "recently",
    unread: conv.unread_count > 0,
    avatar: conv.other_participant?.profile_image || conv.other_participant?.avatar || conv.avatar || `https://ui-avatars.com/api/?name=${conv.other_participant?.name || "U"}`,
  }));

  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white font-sans pb-12">

      {/* Welcome Heading */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold">
          Welcome Back,{" "}
          <span className="bg-gradient-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
            {scoutName}!
          </span>
        </h1>
      </div>

      {/* ── Stats ── */}
      <section className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* <StatCard
          icon={<Eye size={24} />}
          label="Players Viewed"
          value={stats?.players_viewed ?? 0}
          sub={`+${stats?.players_viewed_this_week ?? 0} this week`}
          iconColor="text-[#00E5FF]"
          subColor="text-[#00E5FF]"
        /> */}
        <StatCard
          icon={<Star size={24} />}
          label="Shortlisted Players"
          value={stats?.shortlisted_players ?? 0}
          sub={`${stats?.active_shortlisted ?? 0} active`}
          iconColor="text-[#9C27B0]"
          subColor="text-[#9C27B0]"
        />
        <StatCard
          icon={<CalendarDays size={24} />}
          label="Upcoming Events"
          value={stats?.upcoming_events ?? 0}
          sub={stats?.next_event_date ? `Next: ${new Date(stats.next_event_date).toLocaleDateString()}` : "No events"}
          iconColor="text-[#00E5FF]"
          subColor="text-[#00E5FF]"
        />
        <StatCard
          icon={<MessageSquare size={24} />}
          label="Active Conversations"
          value={stats?.active_conversations ?? 0}
          sub={`${stats?.unread_messages ?? 0} unread`}
          iconColor="text-[#00E5FF]"
          subColor="text-[#00E5FF]"
        />
      </section>

      {/* ── Shortlisted Players ── */}
      <section className="px-6 mb-6">
        <div className="bg-[#12143A] border border-white/[0.07] rounded-xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-yellow-400" fill="currentColor" />
              <h2 className="text-base font-bold text-white">Shortlisted Players</h2>
            </div>
            <Link href="/scout/playerDiscovery">
              <button className="text-xs text-[#00E5FF] border border-[#00E5FF]/40 px-3 py-1 rounded-md hover:bg-[#00E5FF]/10 transition-colors">
                View All
              </button>
            </Link>
          </div>

          {/* Player Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {shortlistedPlayers.length > 0 ? (
              shortlistedPlayers.map((player: any) => (
                <div
                  key={player.id}
                  className="bg-[#0B0D2C] border border-white/[0.07] rounded-xl p-4"
                >
                  {/* Avatar + Star */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {player.player?.profile_image ? (
                        <img
                          src={player.player.profile_image}
                          alt={player.player.full_name || "Player"}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#1A1C3D] flex items-center justify-center border border-white/10">
                          <Eye size={20} className="text-white/20" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-white truncate max-w-[120px]">
                          {player.player?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-white/50">{player.player?.position || "—"}</p>
                      </div>
                    </div>
                    <Star size={14} className="text-yellow-400 mt-1 flex-shrink-0" fill="currentColor" />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/45">Nationality:</span>
                      <span className="text-white/75 truncate ml-2">
                        {player.player?.nationality || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/45">Age:</span>
                      <span className="text-white/75">{player.player?.age ?? "—"} years</span>
                    </div>
                  </div>

                  {/* Button */}
                  <Link href={`/scout/playerDiscovery?playerId=${player.player?.id}&userId=${player.player?.user?.id}`}>
                    <button className="w-full py-2 rounded-lg border border-[#00E5FF]/50 text-[#00E5FF] text-xs font-medium hover:bg-[#00E5FF]/10 transition-colors">
                      View Full Profile
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-white/30 border border-white/[0.05] border-dashed rounded-xl">
                <Star size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No shortlisted players found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="px-6 mb-6">
        <div className="bg-[#12143A] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Latest Platform News</h2>
            <Link href="/latest-news">
              <button className="text-xs text-[#00E5FF] border border-[#00E5FF]/40 px-3 py-1 rounded-md hover:bg-[#00E5FF]/10 transition-colors">
                View All
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newsItems.slice(0, 2).map((article: any) => (
              <Link href={`/latest-news/${article.unique_id}`} key={article.unique_id || article.id}>
                <div className="bg-[#0B0D2C] border border-white/[0.06] rounded-xl p-4 flex gap-4 hover:border-[#00E5FF1A] transition-colors h-full">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={article.image_url || "/images/event-banner.jpg"} 
                      alt={article.title} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col justify-between min-w-0">
                    <div>
                      <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                        {article.category || "News"}
                      </p>
                      <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                    </div>
                    <p className="text-[10px] text-white/40">
                      {article.date_published ? format(parseISO(article.date_published), "MMM d, yyyy") : "Recent"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {(!newsData?.data || newsData.data.length === 0) && !isNewsLoading && (
              <div className="col-span-full py-8 text-center text-white/30 border border-white/[0.05] border-dashed rounded-xl">
                <p className="text-sm">No recent news found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Upcoming Scouting Events ── */}
      <section className="px-6 mb-6">
        <div className="bg-[#12143A] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-base font-bold text-white mb-5">
            Upcoming Scouting Events
          </h2>

          <div className="space-y-3">
            {eventsData?.data?.filter(e => e.status?.toUpperCase() !== "CANCELLED").slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 bg-[#0B0D2C] border border-white/[0.06] rounded-xl p-4"
              >
                {/* Logo/Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#1A1C3D] flex items-center justify-center border border-white/10 flex-shrink-0">
                  <CalendarDays size={20} className="text-[#00E5FF]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{event.event_name}</p>
                  <p className="text-xs text-white/50 truncate">{event.location || "Location TBD"}</p>
                  <p className="text-[10px] text-cyan-400/60 mt-0.5 font-bold uppercase tracking-widest">
                    {event.fee === "0.00" || !event.fee ? "Free Entry" : `$${event.fee}`}
                  </p>
                </div>

                {/* Date */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#00E5FF] font-medium">
                    {event.date ? format(new Date(event.date), "dd MMM yyyy") : "TBD"}
                  </p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
                    {event.status}
                  </p>
                </div>
              </div>
            ))}
            {(!eventsData?.data || eventsData.data.length === 0) && !isEventsLoading && (
              <div className="py-8 text-center text-white/30 border border-white/[0.05] border-dashed rounded-xl">
                <p className="text-sm">No upcoming events found</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/latest-news">
              <button className="text-xs text-[#00E5FF] border border-[#00E5FF]/40 px-5 py-2 rounded-lg hover:bg-[#00E5FF]/10 transition-colors w-full">
                View All Events
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent Views + Messages ── */}
      <section className="px-6 grid md:grid-cols-2 gap-5">

        {/* Recent Player Views */}
        {/* <div className="bg-[#12143A] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-base font-bold text-white mb-4">Recent Player Views</h2>

          <div className="space-y-3">
            {recentViews.map((player, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-[#0B0D2C] border border-white/[0.06] rounded-xl p-3"
              >
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{player.name}</p>
                  <p className="text-xs text-white/45">
                    {player.position} • {player.nationality}
                  </p>
                </div>
                <span className="text-xs text-white/40 whitespace-nowrap">{player.time}</span>
              </div>
            ))}
          </div>
        </div> */}

        {/* Recent Messages */}
        <div className="bg-[#12143A] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-base font-bold text-white mb-4">Recent Messages</h2>

          <div className="space-y-3">
            {dynamicRecentMessages.length > 0 ? (
              dynamicRecentMessages.map((msg, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[#0B0D2C] border border-white/[0.06] rounded-xl p-3"
                >
                  <img
                    src={msg.avatar}
                    alt={msg.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{msg.name}</p>
                    <p className="text-xs text-white/45 truncate">{msg.preview}</p>
                    <p className="text-xs text-white/30 mt-0.5">{msg.time}</p>
                  </div>
                  {msg.unread && (
                    <span className="w-2 h-2 bg-[#9C27B0] rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center border border-white/[0.05] border-dashed rounded-xl">
                <p className="text-xs text-white/40">No recent messages</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/scout/messaging">
              <button className="text-xs text-[#00E5FF] border border-[#00E5FF]/40 px-5 py-2 rounded-lg hover:bg-[#00E5FF]/10 transition-colors w-full">
                View All Messages
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-white/25 text-xs">
        © 2025 NextGen Pros. All rights reserved.
      </footer>
    </div>
  );
};

export default ScoutDashboard;