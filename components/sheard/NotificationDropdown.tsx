"use client";

import React from "react";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2, X, MessageSquare, Calendar, CreditCard, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMarkAsReadMutation, useDeleteNotificationMutation } from "@/redux/features/notification/notificationApi";
import { toast } from "react-hot-toast";

const NotificationDropdown = ({ 
  onClose, 
  onOpenModal 
}: { 
  onClose: () => void; 
  onOpenModal: () => void;
}) => {
  const { notifications, unreadCount, loading } = useNotifications();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const user = useAppSelector((state) => state.auth.user);

  const filteredNotifications = React.useMemo(() => {
    if (user?.role === "ADMIN") {
      return notifications.filter(n => {
        const type = (n.notification_type || n.type || "").toLowerCase();
        // User specifically wants to exclude chat/messages and keep:
        // register, profile boost, and plan purchase
        return !type.includes("message") && !type.includes("chat");
      });
    }
    return notifications;
  }, [notifications, user?.role]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id as number);
    if (unreadIds.length === 0) return;
    try {
      await markAsRead({ notification_ids: unreadIds }).unwrap();
      toast.success("Marked all as read");
    } catch (err) {
      toast.error("Failed to mark read");
    }
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("message") || t.includes("chat")) return <MessageSquare className="h-4 w-4 text-teal-400" />;
    if (t.includes("event") || t.includes("register")) return <Calendar className="h-4 w-4 text-purple-400" />;
    if (t.includes("payment") || t.includes("plan") || t.includes("purchase")) return <CreditCard className="h-4 w-4 text-teal-400" />;
    if (t.includes("boost") || t.includes("profile")) return <Check className="h-4 w-4 text-cyan-400" />;
    return <Info className="h-4 w-4 text-teal-400" />;
  };

  return (
    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#161C39]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] overflow-hidden flex flex-col font-inter">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-[16px]">Notifications</h3>
          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mt-0.5">
            {unreadCount} Unread transmissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="p-1.5 rounded-lg bg-teal-400/10 text-teal-400 hover:bg-teal-400/20 transition-all shadow-sm"
              title="Mark all as read"
            >
              <Check size={14} />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center opacity-40">
            <div className="h-5 w-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Syncing...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center opacity-30 text-center px-8">
            <Bell size={32} className="mb-3" />
            <p className="text-sm font-bold text-white mb-1">Frequency Clear</p>
            <p className="text-[10px] font-medium leading-relaxed">No data transmissions logged in the current cycle.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              className={cn(
                "p-3 rounded-xl transition-all relative group flex gap-3 border border-transparent",
                !notif.is_read ? "bg-white/5 border-white/5" : "hover:bg-white/5 opacity-70"
              )}
            >
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                !notif.is_read ? "bg-teal-400/20" : "bg-white/5"
              )}>
                {getIcon(notif.notification_type || notif.type || "info")}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[13px] leading-tight mb-1",
                  !notif.is_read ? "text-white font-bold" : "text-white/60 font-medium"
                )}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30 font-medium">
                    {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : ''}
                  </span>
                  {!notif.is_read && <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />}
                </div>
              </div>
              
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    console.log("Deleting notification ID:", notif.id);
                    await deleteNotification(notif.id as number).unwrap();
                    toast.success("Notification deleted");
                  } catch (err) {
                    console.error("Delete notification error:", err);
                    toast.error("Failed to delete notification");
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 transition-all absolute top-2 right-2 z-10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 text-center bg-[#0E1129]/30">
        <button 
          onClick={onOpenModal}
          className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-400 hover:text-teal-300 transition-colors w-full py-1"
        >
          View All Logs
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 212, 191, 0.2);
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
