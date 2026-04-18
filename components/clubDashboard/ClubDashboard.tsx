"use client";

// src/components/ClubDashboard.tsx
import React from "react";
import {
  Eye,
  CalendarDays,
  Users,
  Mail,
  Star,
  MoreVertical,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useGetConversationsQuery } from "@/redux/features/chat/chatApi";
import { useGetClubEventsQuery } from "@/redux/features/club/clubEventManagementApi";
import { useGetLatestNewsQuery } from "@/redux/features/home/homeApi";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { useMemo } from "react";

const ClubDashboard: React.FC = () => {
  const { data: chatData, isLoading: isChatLoading } = useGetConversationsQuery();
  const { data: eventsResponse, isLoading: isEventsLoading } = useGetClubEventsQuery(undefined);
  
  const { data: newsData, isLoading: isNewsLoading } = useGetLatestNewsQuery();

  const newsItems = useMemo(() => {
    const items = [...(newsData?.articles || newsData?.data || [])];
    return items.sort((a: any, b: any) => {
      const dateA = a.date_published ? parseISO(a.date_published).getTime() : 0;
      const dateB = b.date_published ? parseISO(b.date_published).getTime() : 0;
      return dateB - dateA;
    });
  }, [newsData]);

  const eventsData = Array.isArray(eventsResponse) 
    ? eventsResponse 
    : (eventsResponse?.results || eventsResponse?.data || eventsResponse?.events || []);
  
  // Sort by created_at (descending) so new events appear at the top
  const sortedEvents = [...eventsData].sort((a: any, b: any) => {
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const activeEvents = sortedEvents.slice(0, 3);

  const conversations = chatData?.conversations || [];
  const dynamicRecentMessages = conversations.slice(0, 3).map((conv) => ({
    id: conv.id,
    sender: conv.other_participant?.name || conv.name || "Unknown",
    message: conv.last_message?.content || conv.last_message_text || "Started a conversation",
    time: conv.updated_at ? formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }) : "recently",
    unread: conv.unread_count > 0,
  }));

  return (
    <div className="min-h-screen  text-white p-6 md:p-2">
      <div className="mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="inline-block text-2xl md:text-3xl font-bold bg-linear-to-r from-[#00e5ff] to-[#9C27B0] bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 ">
          <StatCard
            icon={<CalendarDays size={26} />}
            label="Total Events"
            value={eventsData.length.toString()}
            change="Active"
            changeColor="text-cyan-400"
          />
          <StatCard
            icon={<Users size={26} />}
            label="Player Applications"
            value={eventsData.reduce((acc: number, ev: any) => acc + (ev.registered_count || ev.registrations_count || 0), 0).toString()}
            change="Dynamic"
            changeColor="text-amber-400"
          />
          <StatCard
            icon={<Mail size={26} />}
            label="Unread Messages"
            value={conversations.reduce((acc: number, conv: any) => acc + (conv.unread_count || 0), 0).toString()}
            change={`${conversations.filter((c: any) => c.unread_count > 0).length} chats`}
            changeColor="text-rose-400"
          />
        </div>

        {/* Active Events */}
        <section className="space-y-5 bg-[#12143A] p-8 rounded-lg border border-[#04B5A3]/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Active Events</h2>
            <Link href="/club/eventManagement">
              <button className="bg-[#04B5A3] hover:bg-[#04B5A3]/80 px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
                + Create Event
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-5 ">
            {isEventsLoading ? (
               <div className="col-span-full flex justify-center py-8">
                 <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
               </div>
            ) : activeEvents.length > 0 ? (
              activeEvents.map((event: any, idx: number) => {
                const dateStr = event.date || event.event_date;
                let parsedDate = "TBD";
                if (dateStr) {
                  const d = new Date(dateStr);
                  parsedDate = !isNaN(d.getTime()) ? format(d, "dd/MM/yyyy") : dateStr;
                }
                return (
                  <EventCard
                    key={event.id || idx}
                    title={event.title || event.event_name || "Club Event"}
                    date={parsedDate}
                    location={event.location || event.city || event.venue_name || "TBD"}
                    registrations={event.registered_count || event.registrations_count || event.current_registrations || 0}
                    max={event.maximum_capacity || event.max_participants || event.capacity || 100}
                    isFeatured={event.featured || event.is_featured}
                    isHighlighted={event.is_highlighted}
                  />
                );
              })
            ) : (
               <div className="col-span-full py-12 text-center text-slate-400 border border-slate-700/50 rounded-xl border-dashed">
                 <p>No active events found. Create one to get started!</p>
               </div>
            )}
          </div>
        </section>

        {/* Latest Platform News */}
        <section className="space-y-5 bg-[#12143A] border border-[#04B5A3]/30 p-8 rounded-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Latest Platform News</h2>
            <Link href="/latest-news">
              <span className="text-sm text-cyan-400 hover:underline cursor-pointer font-medium">View All</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {isNewsLoading ? (
               <div className="col-span-full flex justify-center py-4">
                 <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
               </div>
            ) : newsItems.slice(0, 2).map((article: any) => (
              <Link key={article.unique_id || article.id} href={`/latest-news/${article.unique_id}`} className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/70 transition-colors h-full">
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {(!newsData?.data || newsData.data.length === 0) && !isNewsLoading && (
              <div className="col-span-full py-8 text-center text-slate-400 border border-slate-700/50 rounded-xl border-dashed">
                <p className="text-sm">No recent news found</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Messages */}
        <section className="space-y-5 bg-[#12143A] border border-[#04B5A3]/30 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold">Recent Messages</h2>

          <div className="space-y-3">
            {isChatLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : dynamicRecentMessages.length > 0 ? (
              dynamicRecentMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  sender={msg.sender}
                  message={msg.message}
                  time={msg.time}
                  unread={msg.unread}
                />
              ))
            ) : (
              <div className="text-center text-slate-400 py-4 border border-slate-700/50 rounded-xl border-dashed">
                <p className="text-sm">No recent messages</p>
              </div>
            )}
          </div>

          <Link href="/club/messaging">
            <button className="w-full py-3.5  border border-[#00E5FF]/30 text-[#00E5FF]  rounded-xl  font-medium transition-colors ">
              View All Messages
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────
   Reusable sub-components
───────────────────────────────────────────────── */

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  changeColor: string;
};

function StatCard({ icon, label, value, change, changeColor }: StatCardProps) {
  return (
    <div className="bg-[#12143A] border border-[#04B5A3]/30 rounded-xl p-5 shadow-lg backdrop-blur-sm hover:border-slate-700 transition-colors">
      <div className="mb-3 text-cyan-400">{icon}</div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-2xl font-bold mt-0.5">{value}</div>
      <div className={`text-sm mt-1 ${changeColor}`}>{change}</div>
    </div>
  );
}

type EventCardProps = {
  title: string;
  date: string;
  location: string;
  registrations: number;
  max: number;
  isFeatured?: boolean;
  isHighlighted?: boolean;
};

function EventCard({
  title,
  date,
  location,
  registrations,
  max,
  isFeatured = false,
  isHighlighted = false,
}: EventCardProps) {
  const percent = Math.min(100, Math.round((registrations / max) * 100));

  return (
    <div
      className={`
        bg-slate-900/70 border rounded-xl p-5 shadow-lg transition-all duration-200
        ${isHighlighted ? "border-cyan-700/60 hover:border-cyan-600" : "border-slate-800 hover:border-slate-600"}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {title}
          {isFeatured && (
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
          )}
        </h3>
        <button className="text-slate-400 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <p className="text-sm text-slate-400 mb-5">
        {date} • {location}
      </p>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Registrations</span>
          <span className="text-slate-400">
            {registrations}/{max}
          </span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-cyan-600 to-blue-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Link href="/club/eventManagement">
        <button className="mt-6 w-full py-2.5  border border-[#00E5FF]/30 text-[#00E5FF] rounded-lg text-sm font-medium transition-colors">
          View Details
        </button>
      </Link>
    </div>
  );
}

type MessageItemProps = {
  sender: string;
  message: string;
  time: string;
  unread?: boolean;
};

function MessageItem({
  sender,
  message,
  time,
  unread = false,
}: MessageItemProps) {
  return (
    <div
      className={`
        flex gap-4 p-4 rounded-xl border transition-colors
        ${
          unread
            ? "bg-indigo-950/30 border-indigo-900/50"
            : "bg-slate-900/50 border-slate-800"
        }
        hover:bg-slate-800/70
      `}
    >
      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
        {sender[0]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <p
            className={`font-medium truncate ${unread ? "text-white" : "text-slate-200"}`}
          >
            {sender}
          </p>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {time}
          </span>
        </div>
        <p
          className={`text-sm mt-0.5 truncate ${unread ? "text-slate-300" : "text-slate-400"}`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export default ClubDashboard;
