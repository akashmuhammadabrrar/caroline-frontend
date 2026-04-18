"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  DollarSign,
  Bell,
  Database,
  Loader2,
  X,
} from "lucide-react";
import {
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useGetUserManagementSettingsQuery,
  useUpdateUserManagementSettingsMutation,
  useGetMonetizationSettingsQuery,
  useUpdateMonetizationSettingsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/redux/features/admin/adminSettingsApi";
import { toast } from "react-hot-toast";

// ─── Shared Components ───────────────────────────────────────────────────────

const Toggler = ({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0a0c16]/50 border border-gray-800/50 hover:border-gray-700 transition-all group">
      <div className="flex-1 pr-4">
        <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? "bg-[#00E5FF]" : "bg-gray-800"
          }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-5" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
};

const TABS = [
  { id: "General", icon: <Settings size={18} />, label: "General" },
  { id: "User Management", icon: <Users size={18} />, label: "User Management" },
  { id: "Monetization", icon: <DollarSign size={18} />, label: "Monetization" },
  { id: "Notifications", icon: <Bell size={18} />, label: "Notifications" },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

const GeneralSettingsForm = ({
  settingsData,
  updateSettings,
  isUpdating,
}: any) => {
  const [formData, setFormData] = useState({
    platformName: "",
    tagline: "",
    platformLogo: "",
    favicon: "",
    brandColors: {
      primaryCyan: "#00E5FF",
      primaryMagenta: "#9C2780",
      backgroundDark: "#080D2C",
      backgroundCard: "#12143A",
    },
  });

  useEffect(() => {
    if (settingsData) {
      setFormData(settingsData);
    }
  }, [settingsData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      brandColors: {
        ...prev.brandColors,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData).unwrap();
      toast.success("Platform settings updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update settings");
    }
  };

  const inputClass =
    "w-full bg-[#0a0c16] border border-gray-800 rounded-xl px-4 py-4 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600";
  const labelClass = "text-sm font-medium text-gray-400 mb-2.5 block ml-1";
  const sectionTitleClass = "text-lg font-bold text-white mb-8";
  const cardClass =
    "bg-[#171b2f] border border-gray-800 rounded-[2rem] p-8 md:p-10 mb-8 shadow-2xl backdrop-blur-sm";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Platform Information</h2>
        <div className="space-y-10">
          <div>
            <label className={labelClass}>Platform Name</label>
            <input
              name="platformName"
              value={formData.platformName}
              onChange={handleChange}
              placeholder="NextGen Pros"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tagline</label>
            <input
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="Next-generation digital platform"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Platform Logo</label>
            <div className="group border-2 border-dashed border-gray-800 hover:border-cyan-500/50 rounded-[2rem] p-12 transition-all cursor-pointer bg-[#0a0c16]/50 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Database size={32} />
              </div>
              <span className="text-gray-500 font-bold group-hover:text-cyan-400 transition-colors">
                Click to upload or drag and drop
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Brand Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {Object.entries(formData.brandColors).map(([key, value]) => (
            <div key={key}>
              <label className={labelClass}>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <div className="flex items-center gap-3 bg-[#0a0c16] border border-gray-800 rounded-xl p-2 pr-4 transition-all focus-within:border-cyan-500/50">
                <input
                  type="color"
                  value={value as string}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer overflow-hidden"
                />
                <input
                  type="text"
                  value={value as string}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-white font-mono uppercase text-sm w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={() => setFormData(settingsData || formData)}
          className="px-8 py-3 rounded-xl bg-white/5 border border-gray-800 font-bold hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-10 py-3 rounded-xl bg-[#00d8b6] hover:bg-[#00c2a3] text-white font-bold transition-all shadow-lg shadow-[#00d8b6]/20 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};




const UserManagementSettingsForm = () => {
  const {
    data: userData,
    isLoading,
    isError,
  } = useGetUserManagementSettingsQuery();
  const [updateUser, { isLoading: isUpdating }] =
    useUpdateUserManagementSettingsMutation();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );

  if (isError || (!userData && !isLoading)) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center">
        <p className="text-red-400 font-bold">
          Failed to load user management settings.
        </p>
        <p className="text-gray-500 mt-2 text-sm">
          Please try again later or contact the administrator.
        </p>
      </div>
    );
  }

  if (!formData) return null;

  const handleToggle = (path: string, value: boolean) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleNestedChange = (path: string, value: any) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      await updateUser(formData).unwrap();
      toast.success("User management settings updated successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update user management settings",
      );
    }
  };

  const cardClass =
    "bg-[#171b2f] border border-gray-800 rounded-[2rem] p-8 md:p-10 mb-8 shadow-2xl backdrop-blur-sm";
  const sectionTitleClass =
    "text-lg font-bold text-white mb-8 flex items-center gap-3";
  const labelClass = "text-sm font-medium text-gray-400 mb-2.5 block ml-1";
  const inputClass =
    "w-full bg-[#0a0c16] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 transition-all";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Registration Requirements */}
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            <Settings size={20} className="text-cyan-400" /> Registration Rules
          </h2>
          <div className="space-y-4">
            <Toggler
              label="Email Verification"
              description="Require users to verify their email address after registration."
              enabled={formData.requireEmailVerification}
              onChange={(val) => handleToggle("requireEmailVerification", val)}
            />
            <Toggler
              label="Admin Approval (Clubs)"
              description="Manual sign-off required for all new Club accounts."
              enabled={formData.adminApprovalForClubs}
              onChange={(val) => handleToggle("adminApprovalForClubs", val)}
            />
            <Toggler
              label="Admin Approval (Scouts)"
              description="Manual sign-off required for all new Scout accounts."
              enabled={formData.adminApprovalForScouts}
              onChange={(val) => handleToggle("adminApprovalForScouts", val)}
            />
          </div>
        </div>

        {/* Player Specific Rules */}
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            <Users size={20} className="text-purple-400" /> Player Registration
          </h2>
          <div className="space-y-6">
            <Toggler
              label="Guardian Consent"
              description="Require parent/guardian email for players under certain age."
              enabled={formData.playerRegistration.requireGuardianConsent}
              onChange={(val) =>
                handleToggle("playerRegistration.requireGuardianConsent", val)
              }
            />
            <div>
              <label className={labelClass}>Minimum Registration Age</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={formData.playerRegistration.minimumAge}
                  onChange={(e) =>
                    handleNestedChange(
                      "playerRegistration.minimumAge",
                      parseInt(e.target.value),
                    )
                  }
                  className={inputClass + " w-24"}
                />
                <span className="text-gray-500 text-sm italic">Years old</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles & Subscriptions */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>
          <DollarSign size={20} className="text-emerald-400" /> User Roles &
          Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(formData.userRoles).map(
            ([role, data]: [string, any]) => (
              <div
                key={role}
                className="p-6 rounded-2xl bg-[#0a0c16]/50 border border-gray-800"
              >
                <p className="text-sm font-black uppercase tracking-widest text-[#9C2780] mb-4">
                  {role}
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                      Subscription
                    </label>
                    <input
                      type="text"
                      value={data.subscription}
                      onChange={(e) =>
                        handleNestedChange(
                          `userRoles.${role}.subscription`,
                          e.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">
                      Access Status
                    </label>
                    <select
                      value={data.status}
                      onChange={(e) =>
                        handleNestedChange(
                          `userRoles.${role}.status`,
                          e.target.value,
                        )
                      }
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Permissions */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>
          <Bell size={20} className="text-amber-400" /> Platform Permissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Toggler
            label="Clubs Contact Players"
            enabled={formData.userPermissions.allowClubsToContactPlayers}
            onChange={(val) =>
              handleToggle("userPermissions.allowClubsToContactPlayers", val)
            }
          />
          <Toggler
            label="Scouts Contact Players"
            enabled={formData.userPermissions.allowScoutsToContactPlayers}
            onChange={(val) =>
              handleToggle("userPermissions.allowScoutsToContactPlayers", val)
            }
          />
          <Toggler
            label="Global Messaging"
            enabled={formData.userPermissions.enableMessagingSystem}
            onChange={(val) =>
              handleToggle("userPermissions.enableMessagingSystem", val)
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={() => setFormData(userData)}
          className="px-8 py-3 rounded-xl bg-white/5 border border-gray-800 font-bold hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-10 py-3 rounded-xl bg-[#04B5A3] hover:bg-[#039e8e] text-white font-bold transition-all shadow-lg shadow-[#04B5A3]/20 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

const MonetizationSettingsForm = () => {
  const {
    data: monData,
    isLoading,
    isError,
  } = useGetMonetizationSettingsQuery();
  const [updateMon, { isLoading: isUpdating }] =
    useUpdateMonetizationSettingsMutation();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (monData) {
      setFormData(monData);
    }
  }, [monData]);

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );

  if (isError || (!monData && !isLoading)) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center">
        <p className="text-red-400 font-bold">
          Failed to load monetization settings.
        </p>
        <p className="text-gray-500 mt-2 text-sm">Please try again later.</p>
      </div>
    );
  }

  if (!formData) return null;

  const handleToggle = (path: string, value: boolean) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleNestedChange = (path: string, value: any) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      await updateMon(formData).unwrap();
      toast.success("Monetization settings updated successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update monetization settings",
      );
    }
  };

  const cardClass =
    "bg-[#171b2f] border border-gray-800 rounded-[2rem] p-8 md:p-10 mb-8 shadow-2xl backdrop-blur-sm";
  const sectionTitleClass =
    "text-xl font-bold text-white mb-8 flex items-center gap-3";
  const labelClass = "text-sm font-medium text-gray-400 mb-3 block ml-1";
  const inputClass =
    "w-full bg-[#0a0c16] border border-gray-800 rounded-xl px-4 py-4 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 transition-all";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Profile Boosting Pricing */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Profile Boosting Pricing</h2>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>
                Featured Player Price (EUR/month)
              </label>
              <input
                type="number"
                value={formData.profileBoostPricing.playerPrice}
                onChange={(e) =>
                  handleNestedChange(
                    "profileBoostPricing.playerPrice",
                    parseFloat(e.target.value),
                  )
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Featured Event Price (EUR)</label>
              <input
                type="number"
                value={formData.profileBoostPricing.eventPrice}
                onChange={(e) =>
                  handleNestedChange(
                    "profileBoostPricing.eventPrice",
                    parseFloat(e.target.value),
                  )
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-4">
            <Toggler
              label="Enable automatic boost renewals"
              enabled={formData.profileBoostPricing.autoRenewBoosts}
              onChange={(val) =>
                handleToggle("profileBoostPricing.autoRenewBoosts", val)
              }
            />
            <Toggler
              label="Require admin approval for boosts"
              enabled={
                formData.profileBoostPricing.requireAdminApprovalForBoosts
              }
              onChange={(val) =>
                handleToggle(
                  "profileBoostPricing.requireAdminApprovalForBoosts",
                  val,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>Featured Listings</h2>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>
                Max Featured Players per page
              </label>
              <input
                type="number"
                value={formData.featuredListings.maxFeaturedPlayersPerPage}
                onChange={(e) =>
                  handleNestedChange(
                    "featuredListings.maxFeaturedPlayersPerPage",
                    parseInt(e.target.value),
                  )
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max Featured Events per page</label>
              <input
                type="number"
                value={formData.featuredListings.maxFeaturedEventsPerPage}
                onChange={(e) =>
                  handleNestedChange(
                    "featuredListings.maxFeaturedEventsPerPage",
                    parseInt(e.target.value),
                  )
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Boost duration for players (days)
              </label>
              <input
                type="number"
                value={formData.featuredListings.boostDurationForPlayers}
                onChange={(e) =>
                  handleNestedChange(
                    "featuredListings.boostDurationForPlayers",
                    parseInt(e.target.value),
                  )
                }
                className={inputClass}
              />
            </div>
          </div>
          <Toggler
            label="Show boost badge on profiles"
            enabled={formData.featuredListings.showBoostBadgeOnProfiles}
            onChange={(val) =>
              handleToggle("featuredListings.showBoostBadgeOnProfiles", val)
            }
          />
        </div>
      </div>

      {/* Advertising */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>
          <Bell size={20} className="text-cyan-400" /> Advertising
        </h2>
        <Toggler
          label="Enable Ad Banner System"
          enabled={formData.advertising.enableAdBannerSystem}
          onChange={(val) =>
            handleToggle("advertising.enableAdBannerSystem", val)
          }
        />
      </div>

      {/* Revenue Tracking */}
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>
          <Database size={20} className="text-emerald-400" /> Revenue Tracking
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggler
              label="Enable revenue analytics dashboard"
              enabled={formData.revenueTracking.enableRevenueAnalytics}
              onChange={(val) =>
                handleToggle("revenueTracking.enableRevenueAnalytics", val)
              }
            />
            <Toggler
              label="Track conversion rates"
              enabled={formData.revenueTracking.trackConversionRates}
              onChange={(val) =>
                handleToggle("revenueTracking.trackConversionRates", val)
              }
            />
            <Toggler
              label="Send monthly revenue reports"
              enabled={formData.revenueTracking.sendMonthlyRevenueReports}
              onChange={(val) =>
                handleToggle("revenueTracking.sendMonthlyRevenueReports", val)
              }
            />
          </div>
          <div>
            <label className={labelClass}>Revenue report email</label>
            <input
              type="email"
              value={formData.revenueTracking.revenueReportEmail}
              onChange={(e) =>
                handleNestedChange(
                  "revenueTracking.revenueReportEmail",
                  e.target.value,
                )
              }
              placeholder="admin@nextgenpros.com"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 pb-10">
        <button
          onClick={() => setFormData(monData)}
          className="px-8 py-3 rounded-xl bg-white/5 border border-gray-800 font-bold hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-10 py-3 rounded-xl bg-[#04B5A3] hover:bg-[#039e8e] text-white font-bold transition-all shadow-lg shadow-[#04B5A3]/20 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

const NotificationSettingsForm = () => {
  const {
    data: notifData,
    isLoading,
    isError,
  } = useGetNotificationSettingsQuery();
  const [updateNotif, { isLoading: isUpdating }] =
    useUpdateNotificationSettingsMutation();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (notifData) {
      setFormData(notifData);
    }
  }, [notifData]);

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );

  if (isError || (!notifData && !isLoading)) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center">
        <p className="text-red-400 font-bold">
          Failed to load notification settings.
        </p>
        <p className="text-gray-500 mt-2 text-sm">Please try again later.</p>
      </div>
    );
  }

  if (!formData) return null;

  const handleToggle = (key: string, value: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateNotif({ notifications: formData }).unwrap();
      toast.success("Notification settings updated successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update notification settings",
      );
    }
  };

  const cardClass =
    "bg-[#171b2f] border border-gray-800 rounded-[2rem] p-8 md:p-10 mb-8 shadow-2xl backdrop-blur-sm";
  const sectionTitleClass =
    "text-xl font-bold text-white mb-8 flex items-center gap-3";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className={cardClass}>
        <h2 className={sectionTitleClass}>
          <Bell size={20} className="text-cyan-400" /> Admin Alerts
        </h2>
        <div className="space-y-4">
          <Toggler
            label="New User Registration"
            description="Get notified whenever a new player, club, or scout joins the platform."
            enabled={formData.newUserRegistration}
            onChange={(val) => handleToggle("newUserRegistration", val)}
          />
          <Toggler
            label="Subscription Purchase & Renewal"
            description="Receive alerts for payments and recurring subscription updates."
            enabled={formData.subscriptionPurchaseRenewal}
            onChange={(val) => handleToggle("subscriptionPurchaseRenewal", val)}
          />
          <Toggler
            label="Event Published Notification"
            description="Alert when a new news article or event becomes live."
            enabled={formData.eventPublishedNotification}
            onChange={(val) => handleToggle("eventPublishedNotification", val)}
          />
          <Toggler
            label="Profile Approval Notification"
            description="Get notified when user profiles (Clubs/Scouts) are pending review."
            enabled={formData.profileApprovalNotification}
            onChange={(val) => handleToggle("profileApprovalNotification", val)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 pb-10">
        <button
          onClick={() => setFormData(notifData)}
          className="px-8 py-3 rounded-xl bg-white/5 border border-gray-800 font-bold hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="px-10 py-3 rounded-xl bg-[#04B5A3] hover:bg-[#039e8e] text-white font-bold transition-all shadow-lg shadow-[#04B5A3]/20 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const { data: generalData, isLoading: genLoading } =
    useGetGeneralSettingsQuery();
  const [updateGeneral, { isLoading: genUpdating }] =
    useUpdateGeneralSettingsMutation();

  if (genLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D2C] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="w-full mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-linear-to-r from-[#00E5FF] to-[#9C27B0] bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-500 text-lg">Manage your platform</p>
      </div>

      <div className="w-full flex flex-wrap gap-2 mb-10 pb-2 border-b border-gray-800/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-t-2xl font-bold text-sm transition-all relative ${activeTab === tab.id
                ? "bg-[#171b2f] text-white border-t border-x border-gray-800"
                : "text-gray-500 hover:text-gray-300"
              }`}
          >
            <span className={activeTab === tab.id ? "text-cyan-400" : ""}>
              {tab.icon}
            </span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute -bottom-[2px] left-0 w-full h-[3px] bg-cyan-400 z-10" />
            )}
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === "General" && (
          <GeneralSettingsForm
            settingsData={generalData}
            updateSettings={updateGeneral}
            isUpdating={genUpdating}
          />
        )}
        {activeTab === "User Management" && <UserManagementSettingsForm />}
        {activeTab === "Monetization" && <MonetizationSettingsForm />}
        {activeTab === "Notifications" && <NotificationSettingsForm />}
        {![
          "General",
          "User Management",
          "Monetization",
          "Notifications",
        ].includes(activeTab) && (
            <div className="bg-[#171b2f] border border-gray-800 rounded-[2rem] flex flex-col items-center justify-center py-40">
              <div className="p-6 rounded-full bg-white/5 border border-gray-800 mb-6">
                <Settings size={48} className="text-gray-600 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{activeTab} Settings</h3>
              <p className="text-gray-500">This module is coming soon.</p>
            </div>
          )}
      </div>
    </div>
  );
}
