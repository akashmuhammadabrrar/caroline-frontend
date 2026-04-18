"use client";

import {
  UpcomingEvent,
  useGetDashboardStatsQuery,
  useGetUpcomingEventsQuery,
} from "@/redux/features/player/playerDashboard/playerDashboardApi";
import { useGetMyProfileQuery } from "@/redux/features/player/playerProfileAndEdit/profileAndEditApi";
import { useGetConversationsQuery } from "@/redux/features/chat/chatApi";
import { useGetLatestNewsQuery } from "@/redux/features/home/homeApi";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { useMemo, useEffect } from "react";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import { formatRegistrationDate } from "@/lib/utils/dateFormatter";
import { Loader2 } from "lucide-react";

// ─── Fallback / Mock Data ─────────────────────────────────────────────────────

const FALLBACK_EVENTS: UpcomingEvent[] = [
  {
    id: 1,
    title: "Elite Youth Trial",
    location: "Madrid, Spain",
    date: "15/09/2025",
    time: "10:00 AM",
    club_logo: "/logos/real-madrid.png", // you can replace with real paths
  },
  {
    id: 2,
    title: "Football Academy Showcase",
    location: "Barcelona, Spain",
    date: "20/09/2025",
    time: "2:00 PM",
    club_logo: "/logos/barcelona.png",
  },
];

// ─── Reusable Components ──────────────────────────────────────────────────────

const Avatar = ({ name, logo }: { name: string; logo?: string }) => {
  const initials = (name || "Unknown")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border border-[#1E2554]"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#B026FF] to-[#00E5FF] flex items-center justify-center text-white font-bold text-sm border border-[#1E2554]">
      {initials}
    </div>
  );
};

const Check = () => (
  <svg
    className="w-4 h-4 text-[#00E5FF]"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const Cross = () => (
  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function PlayerDashboard() {
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: profile } = useGetMyProfileQuery();
  const { data: upcomingEventsData, isLoading: isEventsLoading } =
    useGetUpcomingEventsQuery();
  const { data: chatData, isLoading: isChatLoading } = useGetConversationsQuery();
  const { data: newsData, isLoading: isNewsLoading } = useGetLatestNewsQuery();

  const completeness = profile?.profile_completeness ?? 0;
  const upcomingEvents = upcomingEventsData ?? [];

  const newsItems = useMemo(() => {
    const items = [...(newsData?.articles || newsData?.data || [])];
    return items.sort((a: any, b: any) => {
      const dateA = a.date_published ? parseISO(a.date_published).getTime() : 0;
      const dateB = b.date_published ? parseISO(b.date_published).getTime() : 0;
      return dateB - dateA;
    });
  }, [newsData]);

  const conversations = chatData?.conversations || [];
  const recentMessages = conversations.slice(0, 3).map((conv) => ({
    id: conv.id,
    sender_name: conv.other_participant?.name || conv.name || "Unknown",
    preview: conv.last_message?.content || conv.last_message_text || "Started a conversation",
    time_ago: conv.updated_at ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }) : "recently",
    is_unread: conv.unread_count > 0,
    sender_logo: conv.other_participant?.profile_image || conv.other_participant?.avatar || conv.avatar,
  }));

  const profileViews =
    profile?.insights?.profile_views ?? stats?.profile_views ?? 0;
  const profileViewsWeekly = profile?.insights?.profile_views_this_week ?? 0;

  return (
    <div className="min-h-screen bg-[#080D28] text-white p-6 font-sans">
      <div className=" mx-auto space-y-6">
        {/* Welcome */}
        <h1 className="text-4xl font-bold mb-6 inline-block pb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
          Welcome Back, {profile?.first_name || "Athlete"}
        </h1>
        {/* Profile Completeness */}
        <div className="bg-[#11163C] rounded-xl p-6 border border-[#1E2554]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Profile Completeness</h2>
            <span className="text-[#00E5FF] font-bold text-xl">
              {completeness}%
            </span>
          </div>

          <div className="h-2 bg-[#1E2554] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#00E5FF] transition-all duration-1000"
              style={{ width: `${completeness}%` }}
            />
          </div>

          <p className="text-sm text-[#9BA3C8] mb-5">
            Complete your profile to increase visibility to clubs and scouts
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {[
              {
                label: "Basic Info",
                done: !!(
                  profile?.first_name &&
                  profile?.last_name &&
                  profile?.designation
                ),
              },
              { label: "Profile Photo", done: !!profile?.profile_image },
              {
                label: "Highlight Video",
                done:
                  (profile?.highlight_videos?.length ?? 0) > 0 ||
                  (profile?.videos?.length ?? 0) > 0,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? "bg-[#00E5FF]/20" : "bg-red-500/20"}`}
                >
                  {item.done ? <Check /> : <Cross />}
                </div>
                <span className={item.done ? "text-[#9BA3C8]" : "text-red-300"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* <div className="bg-[#11163C] rounded-xl p-5 border border-[#1E2554] flex items-center gap-4">
            <div className="space-y-3 py-5">
              <IoEyeOutline size={30} className="text-[#00E5FF]" />
              <p className="text-sm text-[#9BA3C8]">Profile Views</p>
              <p className="text-3xl font-bold">{profileViews}</p>
              <p className="text-xs text-[#00E564]">
                +{profileViewsWeekly} this week
              </p>
            </div>
          </div> */}

          <div className="bg-[#11163C] rounded-xl p-5 border border-[#1E2554] flex items-center gap-4">
            <div className="space-y-3 py-5">
              <FiMessageSquare size={30} className="text-[#00E5FF]" />
              <p className="text-sm text-[#9BA3C8]">Messages</p>
              <p className="text-3xl font-bold">
                {stats?.messages_count ?? 12}
              </p>
              <p className="text-xs text-[#00E5FF]">
                {stats?.messages_count ? "3 unread" : "No unread"}
              </p>
            </div>
          </div>

          <div className="bg-[#11163C] rounded-xl p-5 border border-[#1E2554] flex items-center gap-4">
            <div className="space-y-3 py-5">
              <SlCalender size={30} className="text-white" />
              <p className="text-sm text-[#9BA3C8]">Events Registered</p>
              <p className="text-3xl font-bold">
                {stats?.events_registered ?? 0}
              </p>
              <p className="text-xs text-[#00E5FF]">
                {upcomingEvents.length} upcoming
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-[#11163C] rounded-xl border border-[#1E2554] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E2554]">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
          </div>

          <div className="divide-y divide-[#1E2554]">
            {isEventsLoading ? (
              [...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-10 h-10 bg-[#1E2554] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/5 bg-[#1E2554] rounded" />
                    <div className="h-3 w-2/5 bg-[#1E2554] rounded" />
                  </div>
                </div>
              ))
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: UpcomingEvent) => (
                <div
                  key={event.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-[#0A0F2C] transition-colors"
                >
                  <Avatar
                    name={event.event_name || event.title || "Unknown Event"}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {event.event_name || event.title}
                    </p>
                    <p className="text-sm text-[#9BA3C8] flex items-center gap-1.5 mt-0.5">
                      <span>📍</span>{" "}
                      {event.location || event.city || "Online / TBD"}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium text-[#00E5FF]">
                      {event.date || event.event_date
                        ? formatRegistrationDate(
                            (event.date || event.event_date) as string,
                          )
                        : "TBD"}
                    </div>
                    {event.time && (
                      <div className="text-[#9BA3C8] mt-0.5">{event.time}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 flex flex-col items-center justify-center text-[#9BA3C8]">
                <SlCalender size={40} className="opacity-20 mb-4" />
                <p className="font-medium">No upcoming events found.</p>
                <p className="text-sm mt-1">
                  When you register for events, they will appear here.
                </p>
              </div>
            )}
          </div>

          <Link href={"/player/eventsDirectory"}>
            <div className="px-6 py-4 border-t border-[#1E2554] text-center border">
              <button className="text-[#00E5FF] border border-[#00E5FF] w-full p-2 rounded-lg  hover:text-[#B026FF] font-medium transition-colors">
                View All Events
              </button>
            </div>
          </Link>
        </div>

        {/* Latest Platform News */}
        <div className="bg-[#11163C] rounded-xl border border-[#1E2554] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E2554] flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest Platform News</h2>
            <Link href="/latest-news">
              <span className="text-sm text-[#00E5FF] hover:underline cursor-pointer font-medium">View All</span>
            </Link>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-4">
            {isNewsLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-20 h-20 bg-[#1E2554] rounded-lg" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-[#1E2554] rounded w-3/4" />
                    <div className="h-4 bg-[#1E2554] rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : newsItems.slice(0, 2).map((article: any) => (
              <Link key={article.unique_id || article.id} href={`/latest-news/${article.unique_id}`} className="flex gap-4 p-3 rounded-lg bg-[#0A0F2C] border border-[#1E2554] transition-colors h-full">
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-[10px] text-[#9BA3C8] mt-2">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {(!newsData?.data || newsData.data.length === 0) && !isNewsLoading && (
              <div className="col-span-full py-4 text-center text-[#9BA3C8] border border-dashed border-[#1E2554] rounded-lg">
                <p className="text-sm">No recent news found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-[#11163C] rounded-xl border border-[#1E2554] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E2554]">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
          </div>

          <div className="divide-y divide-[#1E2554]">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-[#0A0F2C] transition-colors cursor-pointer"
              >
                <div className="relative">
                  <Avatar name={msg.sender_name} logo={msg.sender_logo || undefined} />
                  {msg.is_unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#00E5FF] rounded-full border-2 border-[#11163C]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{msg.sender_name}</p>
                  <p className="text-sm text-[#9BA3C8] truncate mt-0.5">
                    {msg.preview}
                  </p>
                </div>

                <div className="text-right text-xs text-[#9BA3C8]">
                  {msg.time_ago}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-[#1E2554] text-center">
            <Link href={"/player/messaging"}>
              {" "}
              <button className="text-[#00E5FF] hover:text-[#B026FF]  border border-[#00E5FF] w-full p-2 rounded-lg   font-medium transition-colors">
                View All Messages
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
