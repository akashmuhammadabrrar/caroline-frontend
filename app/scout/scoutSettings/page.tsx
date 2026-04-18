'use client'

import React, { useState, useEffect } from "react";
import {
  Globe,
  Bell,
  Shield,
  Lock,
  Clock,
  Cog,
  Check
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/redux/features/notification/notificationApi";
import { NotificationSettings } from "@/types/notification/notificationType";

type Tab = "security" | "notifications" | "preferences";

const ScoutSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("security");

  const { data: notifData, isLoading: loadingNotifData } =
    useGetNotificationSettingsQuery();
  const [updateNotif, { isLoading: isUpdatingNotif }] =
    useUpdateNotificationSettingsMutation();

const [notif, setNotif] = React.useState<NotificationSettings>({
  email_notifications: true,
  push_notifications: true,
  realtime_notifications: true,
  notification_types: {
    NEW_MESSAGE: { email: true, push: true, realtime: true },
    EVENT_REGISTRATION: { email: true, push: true, realtime: true },
  },
});

  const [toggles, setToggles] = useState({
    profileVisibility: true,
    contactRequests: true,
    showOnlineStatus: false,
    activityHistory: true,

    // Preferences
    saveSearchHistory: true,
    searchSuggestions: true,
  });

  React.useEffect(() => {
    if (notifData) {
      setNotif({
        email_notifications: notifData.email_notifications ?? true,
        push_notifications: notifData.push_notifications ?? true,
        realtime_notifications: notifData.realtime_notifications ?? true,
        notification_types: notifData.notification_types || {
          NEW_MESSAGE: { email: true, push: true, realtime: true },
          EVENT_REGISTRATION: { email: true, push: true, realtime: true },
        },
      });
    }
  }, [notifData]);

  const handleSaveNotifications = async () => {
    try {
      await updateNotif(notif).unwrap();
      toast.success("Notification settings updated successfully");
    } catch (error) {
      toast.error("Failed to update notification settings");
    }
  };

  const toggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen  text-slate-100 pb-12 font-sans">
      <div className=" mx-auto px-5 sm:px-6 lg:px-2 py-8">
        {/* Top bar with title + Edit button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="inline-block text-2xl md:text-3xl font-bold bg-linear-to-r from-[#00e5ff] to-[#9C27B0] bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-400 mt-1">
              Manage your account and preferences
            </p>
          </div>
          <button className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
            Edit
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-2 border-b border-[#1A2160] mb-6 overflow-x-auto whitespace-nowrap pb-1 
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-4 px-1 relative flex gap-2 items-center ${
                activeTab === "security"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 bg-linear-to-r from-[#00e5ff57] to-[#9b27b06d] p-3 after:bg-teal-500"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Shield size={20} className="" /> Security & Privacy
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`pb-4 flex items-center gap-2 px-1 relative ${
                activeTab === "notifications"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 bg-linear-to-r from-[#00e5ff57] to-[#9b27b06d] p-3 after:bg-teal-500"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Bell size={20} /> Notifications
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`pb-4 flex items-center gap-2 px-1 relative ${
                activeTab === "preferences"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-500 bg-linear-to-r from-[#00e5ff57] to-[#9b27b06d] p-3"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Cog size={20} />
              Preferences
            </button>
          </div>
        </div>

        {/* SECURITY & PRIVACY TAB */}
        {activeTab === "security" && (
          <div className="space-y-10">
            {/* Change Password */}
            <div className="bg-[#12143A] border border-slate-800/70 rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Lock size={20} className="text-teal-400" />
                Change Password
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full bg-[#0B0D2C] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full bg-[#0B0D2C] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60"
                  />
                  <p className="text-slate-500 text-xs mt-2">
                    Must be 8+ characters with uppercase, lowercase, numbers,
                    and symbols
                  </p>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full bg-[#0B0D2C] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60"
                  />
                </div>

                <button className="w-full md:w-auto bg-teal-600 hover:bg-teal-500 text-white font-medium px-8 py-3 rounded-lg transition-colors mt-4">
                  Update Password
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-[#12143A] border border-slate-800/70 rounded-xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-800/70">
                <h2 className="text-xl font-semibold mb-1">Privacy Settings</h2>
              </div>

              <div className="divide-y divide-slate-800/70">
                {[
                  {
                    title: "Profile Visibility",
                    desc: "Allow other users to view your profile",
                    key: "profileVisibility",
                  },
                  {
                    title: "Contact Requests",
                    desc: "Allow users and clubs to message you",
                    key: "contactRequests",
                  },
                  {
                    title: "Show Online Status",
                    desc: "Let others see when you're active",
                    key: "showOnlineStatus",
                  },
                  {
                    title: "Activity History and player views",
                    desc: "Track platform activity and player views",
                    key: "activityHistory",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between px-6 md:px-8 py-5"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toggles[item.key as keyof typeof toggles]}
                        onChange={() =>
                          toggle(item.key as keyof typeof toggles)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-[#12143A] border border-slate-800/70 rounded-xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-800/70">
                <h2 className="text-xl font-semibold mb-1">Active Sessions</h2>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                {[
                  {
                    device: "MacBook Pro",
                    location: "London, UK • active now",
                    icon: "laptop",
                  },
                  {
                    device: "Chrome on Windows",
                    location: "Manchester, UK • 3 days ago",
                    icon: "monitor",
                  },
                ].map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[#0B0D2C] border border-slate-800 rounded-lg px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400">
                        {session.icon === "laptop" ? (
                          <Clock size={20} />
                        ) : (
                          <Clock size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-slate-400 text-sm">
                          {session.location}
                        </p>
                      </div>
                    </div>
                    {i === 1 && (
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  className="w-full mt-4 py-3 
                 text-red-600 rounded-lg transition-colors border border-red-600"
                >
                  Sign Out All Other Sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="space-y-10">
            {/* Global Settings */}
            <div className="bg-[#12143A] border border-slate-800/70 rounded-xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-800/70">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bell size={20} className="text-teal-400" />
                  Global Channels
                </h2>
              </div>
              <div className="divide-y divide-slate-800/70">
                {[
                  {
                    label: "Email Notifications",
                    key: "email_notifications",
                    desc: "Global master switch for all emails",
                  },
                  {
                    label: "Push Notifications",
                    key: "push_notifications",
                    desc: "Receive alerts on your mobile device",
                  },
                  {
                    label: "Real-time Notifications",
                    key: "realtime_notifications",
                    desc: "Instant in-app notification popups",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-6 md:px-8 py-5"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(notif as any)[item.key]}
                        onChange={() =>
                          setNotif((prev) => ({
                            ...prev,
                            [item.key]: !(prev as any)[item.key],
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Granular Type Control */}
            <div className="bg-[#12143A] border border-slate-800/70 rounded-xl overflow-hidden p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Notification Types</h2>

              <div className="space-y-6">
                {/* New Messages */}
                <div className="bg-[#0B0D2C] border border-slate-800 rounded-lg p-5">
                  <p className="font-medium mb-4">New Messages</p>
                  <div className="flex flex-wrap gap-8">
                    {["email", "push", "realtime"].map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            (notif.notification_types.NEW_MESSAGE as any)[type]
                          }
                          onChange={() =>
                            setNotif((n) => ({
                              ...n,
                              notification_types: {
                                ...n.notification_types,
                                NEW_MESSAGE: {
                                  ...n.notification_types.NEW_MESSAGE,
                                  [type]: !(
                                    n.notification_types.NEW_MESSAGE as any
                                  )[type],
                                },
                              },
                            }))
                          }
                          className="w-4 h-4 accent-teal-500"
                        />
                        <span className="text-sm text-slate-3100 capitalize">
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Registration */}
                <div className="bg-[#0B0D2C] border border-slate-800 rounded-lg p-5">
                  <p className="font-medium mb-4">Event Management</p>
                  <div className="flex flex-wrap gap-8">
                    {["email", "push", "realtime"].map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            (
                              notif.notification_types.EVENT_REGISTRATION as any
                            )[type]
                          }
                          onChange={() =>
                            setNotif((n) => ({
                              ...n,
                              notification_types: {
                                ...n.notification_types,
                                EVENT_REGISTRATION: {
                                  ...n.notification_types.EVENT_REGISTRATION,
                                  [type]: !(
                                    n.notification_types
                                      .EVENT_REGISTRATION as any
                                  )[type],
                                },
                              },
                            }))
                          }
                          className="w-4 h-4 accent-teal-500"
                        />
                        <span className="text-sm text-slate-300 capitalize">
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={isUpdatingNotif}
                className="w-full mt-8 bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isUpdatingNotif ? "Saving..." : "Save Notification Settings"}
              </button>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <div className="space-y-10">
            {/* Language & Region */}
            <div className="bg-[#12143A] border border-slate-800/70 rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Globe size={20} className="text-teal-400" />
                Language & Region
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Platform language
                  </label>
                  <select className="w-full bg-[#0B0D2C] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60">
                    <option>English (UK)</option>
                    <option>English (US)</option>
                    <option>Español</option>
                    <option>Português</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Time Zone
                  </label>
                  <select className="w-full bg-[#0B0D2C] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60">
                    <option>GMT+1 (Madrid, Barcelona)</option>
                    <option>GMT (London)</option>
                    <option>GMT-5 (New York)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Date Format
                  </label>
                  <select className="w-full bg-[#0B0D2C] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Currency
                  </label>
                  <select className="w-full bg-[#0B0D2C] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60">
                    <option>€ EUR</option>
                    <option>£ GBP</option>
                    <option>$ USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Preferences */}
            <div className="bg-[#12143A] border border-slate-800/70 rounded-xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-800/70">
                <h2 className="text-xl font-semibold">Search Preferences</h2>
              </div>
              <div className="divide-y divide-slate-800/70">
                <div className="flex items-center justify-between px-6 md:px-8 py-5">
                  <div>
                    <p className="font-medium">Save Search History</p>
                    <p className="text-slate-400 text-sm mt-0.5">
                      Remember your recent searches and filters
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toggles.saveSearchHistory}
                      onChange={() => toggle("saveSearchHistory")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between px-6 md:px-8 py-5">
                  <div>
                    <p className="font-medium">
                      Search Suggestions based on activity
                    </p>
                    <p className="text-slate-400 text-sm mt-0.5">
                      Show suggested players based on your activity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toggles.searchSuggestions}
                      onChange={() => toggle("searchSuggestions")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* <footer className="text-center text-slate-600 text-sm py-8 border-t border-slate-800/40 mt-12">
        © 2025 NextGen Pros. All rights reserved.
      </footer> */}
    </div>
  );
};

export default ScoutSettingsPage;
