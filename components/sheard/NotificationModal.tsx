"use client";

import React from "react";
import { X, Bell, Trash2, Check, MessageSquare, Calendar, CreditCard, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { useMarkAsReadMutation, useDeleteNotificationMutation } from "@/redux/features/notification/notificationApi";
import { toast } from "react-hot-toast";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const { notifications, unreadCount, loading } = useNotifications();
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  if (!isOpen) return null;

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
    const t = (type || "info").toLowerCase();
    if (t.includes("message") || t.includes("chat")) return <MessageSquare className="h-5 w-5 text-teal-400" />;
    if (t.includes("event") || t.includes("register")) return <Calendar className="h-5 w-5 text-purple-400" />;
    if (t.includes("payment") || t.includes("plan") || t.includes("purchase")) return <CreditCard className="h-5 w-5 text-teal-400" />;
    if (t.includes("boost") || t.includes("profile")) return <Check className="h-5 w-5 text-cyan-400" />;
    return <Info className="h-5 w-5 text-teal-400" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#0B1221]/95 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Bell className="text-cyan-400" size={28} />
              Notifications
            </h2>
            <p className="text-sm text-cyan-400/60 font-medium mt-1 uppercase tracking-widest">
              {unreadCount} Unread transmissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="px-4 py-2 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-xs font-bold rounded-full hover:bg-cyan-400 hover:text-black transition-all"
              >
                Mark All Read
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
               <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Synchronizing...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-12">
              <Bell size={64} className="mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Clean Frequency</h3>
              <p className="text-sm font-medium">No archived or incoming data transmissions detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1 p-2">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={cn(
                    "p-6 rounded-3xl transition-all relative group flex gap-5 border border-transparent",
                    !notif.is_read ? "bg-white/5 border-white/5" : "hover:bg-white/5 opacity-60"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    !notif.is_read ? "bg-cyan-400/20" : "bg-white/5"
                  )}>
                    {getIcon(notif.notification_type || notif.type || "info")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                        !notif.is_read ? "bg-cyan-400/20 text-cyan-400" : "bg-white/10 text-white/40"
                      )}>
                        {notif.notification_type || notif.type || "System"}
                      </span>
                      <span className="text-[10px] text-white/20 font-medium">
                        {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[15px] leading-relaxed",
                      !notif.is_read ? "text-white font-bold" : "text-white/60 font-medium"
                    )}>
                      {notif.message}
                    </p>
                    {!notif.is_read && (
                      <div className="mt-3 flex items-center gap-2">
                         <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                         <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">New Transmission</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteNotification(notif.id as number).unwrap();
                        toast.success("Archived notification");
                      } catch (err) {
                        toast.error("Failed to archive");
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0E1129]/30 shrink-0 text-center">
          <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.3em]">
            End of encrypted log sequence
          </p>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
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
    </div>
  );
};

export default NotificationModal;
