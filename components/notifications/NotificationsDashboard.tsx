"use client";

import React, { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  Trash2, 
  Check, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  Info, 
  ShieldAlert, 
  LogIn, 
  Rocket, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useDeleteNotificationMutation 
} from "@/redux/features/notification/notificationApi";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "react-hot-toast";

const NotificationsDashboard = () => {
  const { data: notificationData, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const user = useAppSelector((state) => state.auth.user);

  const notifications = useMemo(() => {
    let allNotifications: any[] = [];
    if (Array.isArray(notificationData)) allNotifications = notificationData;
    else if (notificationData?.notifications) allNotifications = notificationData.notifications;
    else if ((notificationData as any)?.results) allNotifications = (notificationData as any).results;
    
    // Admin filtering: Exclude chat messages if desired
    if (user?.role?.toUpperCase() === "ADMIN") {
      return allNotifications.filter((n: any) => {
        const type = n.type?.toUpperCase() || n.notification_type?.toUpperCase();
        return type !== "NEW_MESSAGE";
      });
    }

    return allNotifications;
  }, [notificationData, user]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await markAsRead({ notification_ids: unreadIds }).unwrap();
      toast.success("Marked all as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const getIcon = (type: string) => {
    const t = (type || "info").toUpperCase();
    if (t.includes("MESSAGE") || t.includes("CHAT")) return <MessageSquare className="h-5 w-5 text-teal-400" />;
    if (t.includes("EVENT_REGISTRATION") || t.includes("EVENT_CREATED")) return <Calendar className="h-5 w-5 text-purple-400" />;
    if (t.includes("USER_REGISTRATION")) return <Users className="h-5 w-5 text-cyan-400" />;
    if (t.includes("SUBSCRIPTION") || t.includes("PAYMENT") || t.includes("PURCHASE")) return <CreditCard className="h-5 w-5 text-yellow-400" />;
    if (t.includes("BOOST") || t.includes("PROFILE")) return <Rocket className="h-5 w-5 text-cyan-400" />;
    if (t.includes("LOGIN")) return <LogIn className="h-5 w-5 text-indigo-400" />;
    
    return <Info className="h-5 w-5 text-teal-400" />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header section matches dashboard UI feel */}
      <div className="bg-[#0B1221]/95 border border-white/10 rounded-3xl p-8 mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-5 z-10">
          <div className="h-16 w-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <Bell className="text-cyan-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
            <p className="text-sm text-cyan-400/80 font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
              <span>{unreadCount} Unread logs</span>
              {unreadCount > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="z-10">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="px-6 py-2.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-sm font-bold rounded-xl hover:bg-cyan-400 hover:text-black transition-all flex items-center gap-2"
            >
              <Check size={16} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-[#0B1221]/80 border border-white/5 rounded-3xl p-2 sm:p-4 shadow-2xl min-h-[50vh]">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="h-10 w-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Synchronizing logs...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center opacity-40 text-center px-4">
            <Bell size={64} className="mb-6 mx-auto opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">Clean Frequency</h3>
            <p className="text-sm font-medium">No archived or incoming data transmissions detected.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif: any) => (
              <div 
                key={notif.id}
                className={cn(
                  "p-5 sm:p-6 rounded-2xl transition-all relative group flex gap-4 sm:gap-6 border",
                  !notif.is_read 
                    ? "bg-white/5 border-white/10 shadow-lg" 
                    : "bg-transparent border-transparent hover:bg-white/[0.02] opacity-75 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  !notif.is_read ? "bg-cyan-400/20 border border-cyan-400/30" : "bg-white/5 border border-white/5"
                )}>
                  {getIcon(notif.notification_type || notif.type)}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md",
                      !notif.is_read ? "bg-cyan-400/20 text-cyan-400" : "bg-white/10 text-white/50"
                    )}>
                      {(notif.notification_type || notif.type || "System").replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-white/30 font-medium">
                      {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-[15px] leading-relaxed",
                    !notif.is_read ? "text-white font-bold" : "text-white/70 font-medium"
                  )}>
                    {typeof notif.message === 'string' ? notif.message : "New notification received."}
                  </p>
                  
                  {!notif.is_read && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">New Transmission</span>
                    </div>
                  )}
                </div>
                
                <div className="shrink-0 flex items-center justify-center">
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteNotification(notif.id).unwrap();
                        toast.success("Notification deleted");
                      } catch (err) {
                        toast.error("Failed to delete notification");
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-3 sm:p-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    title="Delete log"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsDashboard;
