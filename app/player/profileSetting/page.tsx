"use client";

import { useState, useEffect } from "react";
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useDownloadDataMutation,
  useGetAllSettingsQuery,
  useUpdateAccountSettingsMutation,
  useUpdateNotificationSettingsMutation,
  useUpdatePrivacySettingsMutation,
} from "@/redux/features/player/setting/settingApi";
import {
  AccountSettings,
  NotificationSettings,
  PrivacySettings,
} from "@/types/setting";
import * as XLSX from "xlsx";
import { CiLock, CiUser } from "react-icons/ci";
import { FaRegBell, FaRegBellSlash } from "react-icons/fa";
import { IoNotificationsOutline, IoSettingsOutline } from "react-icons/io5";
import { GoShieldLock } from "react-icons/go";
import SectionTitel from "@/components/reuseable/SectionTitel";

// ─── Icons (emoji fallback — you can replace with lucide-react) ──────────────

const Lock = () => <span className="text-[#00E5FF] text-xl">🔒</span>;
const Mail = () => <span className="text-[#00E5FF] text-xl">✉️</span>;
const Star = () => <span className="text-[#00E5FF] text-xl">⭐</span>;
const Trash = () => <span className="text-red-400 text-xl">🗑️</span>;
const Globe = () => <span className="text-[#00E5FF] text-xl">🌐</span>;
const Clock = () => <span className="text-[#00E5FF] text-xl">🕒</span>;
const ChevronRight = () => (
  <span className="text-[#00E5FF] text-lg font-light">→</span>
);

// ─── Reusable Components ──────────────────────────────────────────────────────

// ✅ UPDATED TAB COMPONENT: Matches new Figma design (flat, side-by-side with distinct backgrounds)
const Tab = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`
flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-[15px] font-medium transition-all duration-300 whitespace-nowrap relative
${
  active
    ? "text-white bg-[#1A1B41]"
    : "text-[#8A9ABF] hover:text-white hover:bg-white/5"
}
`}
  >
    <span>{icon}</span>
    <span>{children}</span>
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#04B5A3] shadow-[0_-2px_10px_rgba(4,181,163,0.5)]" />
    )}
  </button>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-white text-[15px] font-bold mb-4 mt-6 first:mt-0">
    {children}
  </h3>
);

const Row = ({
  icon,
  title,
  description,
  control,
  onClick,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  control: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    className={`flex items-center justify-between bg-[#0B0D2C] p-4 sm:p-5 mb-3 transition-colors rounded-lg gap-2 sm:gap-4 ${onClick ? "cursor-pointer hover:bg-[#12153b]" : ""}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
      {icon && <div className="text-xl sm:text-2xl flex-shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-semibold break-words">{title}</p>
        {description && (
          <p className="text-xs text-[#8A9ABF] mt-1 leading-relaxed break-words">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="flex-shrink-0 pl-2 sm:pl-3">{control}</div>
  </div>
);

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? "bg-white" : "bg-[#1E2554]"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const SquareCheckbox = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
      checked
        ? "bg-[#00E5FF] border-[#00E5FF]"
        : "bg-transparent border-[#00E5FF]"
    }`}
  >
    {checked && (
      <svg
        className="w-3.5 h-3.5 text-black"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </button>
);

const SaveBtn = ({
  onClick,
  loading = false,
  label = "Save Settings",
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full mt-4 py-3.5 bg-[#04B5A3] hover:bg-[#039b8b] text-white font-bold text-sm rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? "Saving..." : label}
  </button>
);

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "Account" | "Privacy" | "Notifications" | "Preferences"
  >("Account");

  const { data, isLoading } = useGetAllSettingsQuery();

  const [updateNotifications, { isLoading: savingNotif }] =
    useUpdateNotificationSettingsMutation();
  const [updatePrivacy, { isLoading: savingPrivacy }] =
    useUpdatePrivacySettingsMutation();
  const [updateAccount, { isLoading: savingAccount }] =
    useUpdateAccountSettingsMutation();
  const [changePassword, { isLoading: changingPwd }] =
    useChangePasswordMutation();
  const [downloadData, { isLoading: downloading }] = useDownloadDataMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  // ── Your original form states ───────────────────────────────────────────────

  const [notif, setNotif] = useState({
    email_new_messages: true,
    email_event_reminders: true,
    email_profile_views: true,
    email_news_updates: true,
    push_enabled: true,
    push_sound: true,
  });

  const [privacy, setPrivacy] = useState<Omit<PrivacySettings, "id">>({
    visible_to_clubs: true,
    visible_to_scouts: true,
    show_age_publicly: true,
    show_contact_publicly: false,
    allow_direct_messages: true,
  });

  const [account, setAccount] = useState<Omit<AccountSettings, "id">>({
    language: "English",
    timezone: "GMT+1 (Madrid)",
    save_search_history: true,
    show_event_recommendations: true,
  });

  // Password modal
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(false);

  // Download feedback
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!data) return;
    const n = data.notification_settings;
    if (n) {
      setNotif({
        email_new_messages: n.email_new_messages ?? true,
        email_event_reminders: n.email_event_reminders ?? true,
        email_profile_views: n.email_profile_views ?? true,
        email_news_updates: n.email_news_updates ?? true,
        push_enabled: n.push_enabled ?? true,
        push_sound: n.push_sound ?? true,
      });
    }
    const p = data.privacy_settings;
    setPrivacy({
      visible_to_clubs: p.visible_to_clubs,
      visible_to_scouts: p.visible_to_scouts,
      show_age_publicly: p.show_age_publicly,
      show_contact_publicly: p.show_contact_publicly,
      allow_direct_messages: p.allow_direct_messages,
    });
    const a = data.account_settings;
    setAccount({
      language: a.language,
      timezone: a.timezone,
      save_search_history: a.save_search_history,
      show_event_recommendations: a.show_event_recommendations,
    });
  }, [data]);

  // ── Your original handlers (unchanged) ─────────────────────────────────────

  const handleSaveNotifications = async () => {
    await updateNotifications({ id: data?.notification_settings.id, ...notif });
  };

  const handleSavePrivacy = async () => {
    await updatePrivacy({ id: data?.privacy_settings.id, ...privacy });
  };

  const handleSaveAccount = async () => {
    await updateAccount({ id: data?.account_settings.id, ...account });
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdSuccess(false);
    if (
      !pwdForm.old_password ||
      !pwdForm.new_password ||
      !pwdForm.confirm_password
    ) {
      setPwdError("All fields are required.");
      return;
    }
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (pwdForm.new_password.length < 8) {
      setPwdError("Password must be at least 8 characters.");
      return;
    }
    try {
      await changePassword(pwdForm).unwrap();
      setPwdSuccess(true);
      setPwdForm({ old_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => {
        setPwdModal(false);
        setPwdSuccess(false);
      }, 1500);
    } catch {
      setPwdError("Incorrect current password. Please try again.");
    }
  };

  const handleDownloadData = async () => {
    try {
      const res = await downloadData().unwrap();
      const p = res.profile;

      const wb = XLSX.utils.book_new();

      const fileName = `player-data-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error("Excel export failed:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      setDeleteModal(false);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#00E5FF]/30 border-t-[#00E5FF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans p-4 sm:p-6 md:p-8">
  {/* Page Title */}
  <div className="mb-4 sm:mb-6 md:mb-8">
    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
      <SectionTitel title="Settings" />
    </h1>
  </div>

  {/* Main Container - Figma Desktop Layout */}
  <div className="max-w-7xl mx-auto bg-[#12143A] rounded-2xl border border-[#2A2B5A] overflow-hidden flex flex-col">
    {/* Tabs Header - Horizontal scroll */}
    <div className="w-full border-b border-[#2A2B5A]">
      <div
        className="flex overflow-x-auto overflow-y-hidden whitespace-nowrap 
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="flex flex-row w-full min-w-max sm:min-w-0 bg-[#12143A]">
          {[
            { key: "Account", icon: <CiUser size={18} />, label: "Account" },
            {
              key: "Privacy",
              icon: <GoShieldLock size={18} />,
              label: "Privacy",
            },
            {
              key: "Notifications",
              icon: <IoNotificationsOutline size={18} />,
              label: "Notifications",
            },
            {
              key: "Preferences",
              icon: <IoSettingsOutline size={18} />,
              label: "Preferences",
            },
          ].map((tab) => (
            <Tab
              key={tab.key}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              icon={tab.icon}
            >
              {tab.label}
            </Tab>
          ))}
        </div>
      </div>
    </div>

    {/* Content Area */}
    <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
        {activeTab === "Account" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div>
              <SectionHeader>Account Actions</SectionHeader>
              <div className="space-y-1">
                <Row
                  icon={<IoSettingsOutline className="text-[#00E5FF]" />}
                  title="Change Password"
                  description="Update your account password"
                  control={<ChevronRight />}
                  onClick={() => setPwdModal(true)}
                />
                <Row
                  icon={<Mail />}
                  title="Email Preferences"
                  description="Manage your email settings"
                  control={<ChevronRight />}
                />
              </div>
            </div>

            <div>
              <SectionHeader>Active Sessions</SectionHeader>
              <div className="space-y-1">
                <Row
                  title="Chrome on Windows"
                  description="Madrid, Spain • Current session"
                  control={
                    <span className="text-[#00E5FF] text-xs sm:text-sm">
                      Current session
                    </span>
                  }
                />
                <Row
                  title="Safari on iPhone"
                  description="Barcelona, Spain"
                  control={
                    <button className="text-red-400 hover:text-red-300 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
                      Revoke
                    </button>
                  }
                />
              </div>
            </div>

            <div>
              <Row
                icon={<Trash />}
                title="Delete Account"
                description="Permanently delete your account and data"
                control={<span className="text-gray-500">→</span>}
                onClick={() => setDeleteModal(true)}
              />
            </div>

            <div className="pt-4">
              <SaveBtn
                onClick={handleSaveAccount}
                loading={savingAccount}
                label="Save Account Settings"
              />
            </div>
          </div>
        )}

        {activeTab === "Privacy" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div>
              <SectionHeader>Profile Visibility</SectionHeader>
              <div className="space-y-1">
                <Row
                  title="Make my profile visible to clubs"
                  description="Allow clubs to view your complete profile"
                  control={
                    <SquareCheckbox
                      checked={privacy.visible_to_clubs}
                      onChange={() =>
                        setPrivacy((p) => ({
                          ...p,
                          visible_to_clubs: !p.visible_to_clubs,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="Make my profile visible to scouts"
                  description="Allow scouts to discover your profile"
                  control={
                    <SquareCheckbox
                      checked={privacy.visible_to_scouts}
                      onChange={() =>
                        setPrivacy((p) => ({
                          ...p,
                          visible_to_scouts: !p.visible_to_scouts,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="Show my age publicly"
                  description="Display your age on your profile"
                  control={
                    <SquareCheckbox
                      checked={privacy.show_age_publicly}
                      onChange={() =>
                        setPrivacy((p) => ({
                          ...p,
                          show_age_publicly: !p.show_age_publicly,
                        }))
                      }
                    />
                  }
                />
              </div>
            </div>

            <div>
              <SectionHeader>Contact Privacy</SectionHeader>
              <div className="space-y-1">
                <Row
                  title="Show contact details publicly"
                  description="Display email and phone on your profile"
                  control={
                    <SquareCheckbox
                      checked={privacy.show_contact_publicly}
                      onChange={() =>
                        setPrivacy((p) => ({
                          ...p,
                          show_contact_publicly: !p.show_contact_publicly,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="Allow direct messages"
                  description="Receive messages from clubs and scouts"
                  control={
                    <SquareCheckbox
                      checked={privacy.allow_direct_messages}
                      onChange={() =>
                        setPrivacy((p) => ({
                          ...p,
                          allow_direct_messages: !p.allow_direct_messages,
                        }))
                      }
                    />
                  }
                />
              </div>
            </div>

            <div>
              <SectionHeader>Data & Privacy</SectionHeader>
              <div className="space-y-1">
                <Row
                  icon={<GoShieldLock className="text-[#00E5FF]" />}
                  title="Download My Data"
                  description="Export all your personal data"
                  control={
                    <button
                      onClick={handleDownloadData}
                      className="text-[#00E5FF] hover:text-[#00c9e0] text-sm font-semibold transition-colors"
                    >
                      Download
                    </button>
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <SaveBtn
                onClick={handleSavePrivacy}
                loading={savingPrivacy}
                label="Save Privacy Settings"
              />
            </div>
          </div>
        )}

        {activeTab === "Notifications" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div>
              <SectionHeader>Email Notifications</SectionHeader>
              <div className="space-y-1">
                <Row
                  title="New message notifications"
                  description="Get notified when you receive new messages"
                  control={
                    <Toggle
                      checked={notif.email_new_messages}
                      onChange={() =>
                        setNotif((n) => ({
                          ...n,
                          email_new_messages: !n.email_new_messages,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="Event reminders"
                  description="Receive reminders for upcoming events"
                  control={
                    <Toggle
                      checked={notif.email_event_reminders}
                      onChange={() =>
                        setNotif((n) => ({
                          ...n,
                          email_event_reminders: !n.email_event_reminders,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="Profile views"
                  description="Know when clubs or scouts view your profile"
                  control={
                    <Toggle
                      checked={notif.email_profile_views}
                      onChange={() =>
                        setNotif((n) => ({
                          ...n,
                          email_profile_views: !n.email_profile_views,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="News & updates"
                  description="Receive platform news and training content"
                  control={
                    <Toggle
                      checked={notif.email_news_updates}
                      onChange={() =>
                        setNotif((n) => ({
                          ...n,
                          email_news_updates: !n.email_news_updates,
                        }))
                      }
                    />
                  }
                />
              </div>
            </div>

            <div>
              <SectionHeader>Push Notifications</SectionHeader>
              <div className="space-y-1">
                <Row
                  title="Enable push notifications"
                  description="Receive real-time notifications"
                  control={
                    <Toggle
                      checked={notif.push_enabled}
                      onChange={() =>
                        setNotif((n) => ({
                          ...n,
                          push_enabled: !n.push_enabled,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="Sound for notifications"
                  description="Play sound when notifications arrive"
                  control={
                    <Toggle
                      checked={notif.push_sound}
                      onChange={() =>
                        setNotif((n) => ({
                          ...n,
                          push_sound: !n.push_sound,
                        }))
                      }
                    />
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <SaveBtn
                onClick={handleSaveNotifications}
                loading={savingNotif}
                label="Save Notification Settings"
              />
            </div>
          </div>
        )}

        {activeTab === "Preferences" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div>
              <SectionHeader>Language & Region</SectionHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm text-[#8A9ABF]">Language</label>
                  <select
                    value={account.language}
                    onChange={(e) =>
                      setAccount((a) => ({ ...a, language: e.target.value }))
                    }
                    className="w-full bg-[#0F122B] border border-white/5 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm outline-none appearance-none hover:border-white/10"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm text-[#8A9ABF]">Timezone</label>
                  <select
                    value={account.timezone}
                    onChange={(e) =>
                      setAccount((a) => ({ ...a, timezone: e.target.value }))
                    }
                    className="w-full bg-[#0F122B] border border-white/5 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm outline-none appearance-none hover:border-white/10"
                  >
                    <option>GMT+1 (Madrid)</option>
                    <option>UTC</option>
                    <option>GMT+6 (Dhaka)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader>Search Preferences</SectionHeader>
              <div className="space-y-1">
                <Row
                  title="Save search history"
                  description="Remember your recent searches"
                  control={
                    <SquareCheckbox
                      checked={account.save_search_history}
                      onChange={() =>
                        setAccount((a) => ({
                          ...a,
                          save_search_history: !a.save_search_history,
                        }))
                      }
                    />
                  }
                />
                <Row
                  title="Show event recommendations"
                  description="Get personalized event suggestions"
                  control={
                    <SquareCheckbox
                      checked={account.show_event_recommendations}
                      onChange={() =>
                        setAccount((a) => ({
                          ...a,
                          show_event_recommendations:
                            !a.show_event_recommendations,
                        }))
                      }
                    />
                  }
                />
              </div>
            </div>

            <div className="pt-4">
              <SaveBtn
                onClick={handleSaveAccount}
                loading={savingAccount}
                label="Save Preferences"
              />
            </div>
          </div>
        )}
    </div>
  </div>

  {/* Modals remain the same but with responsive classes already applied */}
  {/* ... (password and delete modals) ... */}

    {/* ── Change Password Modal ────────────────────── */}
      {pwdModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F122B] border border-white/5 rounded-2xl p-5 sm:p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[17px] font-bold text-white">
                Change Password
              </h2>
              <button
                onClick={() => setPwdModal(false)}
                className="text-[#8A9ABF] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[#8A9ABF] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={pwdForm.old_password}
                  onChange={(e) =>
                    setPwdForm((f) => ({ ...f, old_password: e.target.value }))
                  }
                  className="w-full bg-[#1A1D36] border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:border-[#00E5FF] outline-none placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A9ABF] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={pwdForm.new_password}
                  onChange={(e) =>
                    setPwdForm((f) => ({ ...f, new_password: e.target.value }))
                  }
                  className="w-full bg-[#1A1D36] border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:border-[#00E5FF] outline-none placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A9ABF] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={pwdForm.confirm_password}
                  onChange={(e) =>
                    setPwdForm((f) => ({
                      ...f,
                      confirm_password: e.target.value,
                    }))
                  }
                  className="w-full bg-[#1A1D36] border border-white/5 rounded-lg px-4 py-3 text-white text-sm focus:border-[#00E5FF] outline-none placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>

              {pwdError && <p className="text-red-400 text-xs">{pwdError}</p>}
              {pwdSuccess && (
                <p className="text-[#00E5FF] text-xs">
                  Password updated successfully!
                </p>
              )}

              <button
                onClick={handleChangePassword}
                disabled={changingPwd}
                className="w-full mt-2 py-4 bg-[#00E5FF] hover:bg-[#00D4FF] text-black font-bold rounded-xl transition-all disabled:opacity-60 text-sm"
              >
                {changingPwd ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F122B] border border-white/5 rounded-2xl p-5 sm:p-7 w-full max-w-md">
            <h2 className="text-[17px] font-bold text-white mb-2">
              Delete Account
            </h2>
            <p className="text-xs text-[#8A9ABF] mb-6 leading-relaxed">
              This action cannot be undone. All your data will be permanently
              deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 py-4 bg-transparent border border-white/5 hover:bg-white/5 rounded-xl text-white text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 rounded-xl text-white text-sm font-bold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
