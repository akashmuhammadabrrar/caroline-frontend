"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Mail,
  Phone,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Edit3,
  Save,
  Plus,
  Trash2,
  Trophy,
  MessageSquare,
  Check,
  Shield,
  Camera,
  Upload,
} from "lucide-react";
import {
  useGetClubProfileQuery,
  useUpdateClubProfileMutation,
} from "../../../redux/features/club/clubProfileApi";
import { useGetClubEventsQuery } from "../../../redux/features/club/clubEventManagementApi";

interface Achievement {
  title: string;
  year: string;
}

interface UpcomingEvent {
  title: string;
  date: string;
  venue: string;
  fee?: string;
}

interface FeaturedPlayer {
  name: string;
  age_group: string;
  position: string;
}

interface ClubProfile {
  club_name: string;
  tagline: string;
  club_type: string;
  location: string;
  founded_year: string;
  total_players: string | number;
  email: string;
  phone: string;
  website: string;
  address: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  overview: string;
  mission: string;
  age_groups: string[];
  facilities: string[];
  achievements: Achievement[];
  upcoming_events: UpcomingEvent[];
  featured_players: FeaturedPlayer[];
  gallery: string[];
  cover_image: string;
  logo: string | null;
  age_groups_text?: string;
  _coverFile?: File;
  _logoFile?: File;
}

// ── Fallback data ──────────────────────────────────────────────────────────────
const FALLBACK: ClubProfile = {
  club_name: "FC Barcelona Youth",
  tagline: "Developing Champions Since 1973",
  club_type: "Professional Academy",
  location: "Barcelona, Spain",
  founded_year: "Est. 1979",
  total_players: "8,156 Players",
  email: "academy@fcbarcelona.com",
  phone: "+34 93 496 36 00",
  website: "www.fcbarcelona.com",
  address: "Carrer d'Arístides Maillol, 08028 Barcelona, Spain",
  facebook: "FCBarcelonaYouth",
  twitter: "@FCBYouth",
  instagram: "@fcbtyouth",
  youtube: "FCBarcelonaYouth",
  overview:
    "FC Barcelona Youth Academy, also known as La Masia, is one of the most prestigious youth-development programs in world football.",
  mission:
    "Our mission is to identify, develop, and nurture young football talent while instilling the values of respect, effort, ambition, teamwork, and humility.",
  age_groups: ["U-10", "U-12", "U-14", "U-16", "U-18", "U-21"],
  facilities: [
    "6 natural turf training fields",
    "2 artificial turf pitches",
    "State-of-the-art gym and fitness center",
    "Medical and physiotherapy facilities",
    "Video analysis room",
    "Accommodation for academy players",
  ],
  achievements: [
    { title: "UEFA Youth League Winners", year: "2023" },
    { title: "La Liga Youth Champions", year: "2023" },
    { title: "Copa del Rey Youth Trophy", year: "2022" },
  ],
  upcoming_events: [
    {
      title: "Open Youth Trials 2025",
      date: "15/02/2025",
      venue: "Camp Nou Training Centre",
      fee: "",
    },
    {
      title: "International Youth Showcase",
      date: "22/02/2025",
      venue: "Barcelona",
      fee: "",
    },
    {
      title: "Summer Training Camp",
      date: "01/07/2025",
      venue: "BCN Sports Village",
      fee: "",
    },
  ],
  featured_players: [
    { name: "John Adams", age_group: "U-17", position: "Striker" },
    { name: "Lucas Martin", age_group: "U-19", position: "Midfielder" },
    { name: "Omar Hassan", age_group: "U-15", position: "Defender" },
    { name: "Tom Williams", age_group: "U-18", position: "Goalkeeper" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=300&fit=crop",
  ],
  cover_image:
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&h=400&fit=crop",
  logo: null,
};

// ── Shared styled input ────────────────────────────────────────────────────────
const EInput = ({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`bg-[#0B0E1E] border border-[#252d5a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/60 transition-all w-full ${className}`}
  />
);

const ETextarea = ({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <textarea
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="bg-[#0B0E1E] border border-[#252d5a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/60 transition-all w-full resize-none"
  />
);

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[#111530] border border-[#1e2650] rounded-2xl p-6 ${className}`}
  >
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-black text-white mb-5">{children}</h3>
);

const GradientTitle = ({
  first,
  second,
}: {
  first: string;
  second: string;
}) => (
  <h2 className="text-2xl font-black mb-8">
    <span className="text-cyan-400">{first} </span>
    <span className="text-purple-400">{second}</span>
  </h2>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const ClubProfilePage = () => {
  const { data: apiData, isLoading: isProfileLoading } = useGetClubProfileQuery();
  const { data: apiEventsResponse, isLoading: isEventsLoading } = useGetClubEventsQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateClubProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<ClubProfile>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const raw = apiData?.data || apiData || {};
  
  // Real events from the management system
  const realEvents = Array.isArray(apiEventsResponse) 
    ? apiEventsResponse 
    : (apiEventsResponse?.results || apiEventsResponse?.data || []);

  const profile = { 
    ...FALLBACK, 
    ...raw,
    // Prioritize real events from the management system
    upcoming_events: (raw.upcoming_events && raw.upcoming_events.length > 0)
      ? raw.upcoming_events 
      : (realEvents.length > 0)
        ? realEvents.map((e: any) => ({
            title: e.event_name,
            date: e.event_date ? new Date(e.event_date).toLocaleDateString('en-GB') : "TBD",
            venue: e.venue_name || e.location || "TBD",
            fee: e.registration_fee
          }))
        : (raw.hasOwnProperty('upcoming_events') || apiData) ? [] : FALLBACK.upcoming_events,
    
    featured_players: raw.featured_players || (raw.hasOwnProperty('featured_players') || apiData ? [] : FALLBACK.featured_players),
    achievements: raw.achievements || (raw.hasOwnProperty('achievements') || apiData ? [] : FALLBACK.achievements),
    facilities: raw.facilities || (raw.hasOwnProperty('facilities') || apiData ? [] : FALLBACK.facilities),
  };

  const isLoading = isProfileLoading || isEventsLoading;

  const startEditing = () => {
    setForm(JSON.parse(JSON.stringify(profile)));
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setForm({});
    setCoverPreview(null);
    setLogoPreview(null);
    setSaveError(null);
  };

  const set = (key: keyof ClubProfile, val: any) => setForm((p) => ({ ...p, [key]: val }));

  // ── PATCH API ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError(null);
    try {
      // Send JSON (not FormData) unless there are file uploads
      const hasFiles = form._coverFile || form._logoFile;

      if (hasFiles) {
        const fd = new FormData();
        const { _coverFile, _logoFile, ...rest } = form;
        if (_coverFile) fd.append("cover_image", _coverFile);
        if (_logoFile) fd.append("logo", _logoFile);
        Object.entries(rest).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
          }
        });
        await updateProfile(fd).unwrap();
      } else {
        // pure JSON — drop internal file keys
        const { _coverFile, _logoFile, ...payload } = form;
        await updateProfile(payload).unwrap();
      }

      setIsEditing(false);
      setCoverPreview(null);
      setLogoPreview(null);
    } catch (err: any) {
      setSaveError(
        err?.data?.message ||
          err?.data?.detail ||
          JSON.stringify(err?.data) ||
          "Failed to save. Please try again.",
      );
    }
  };

  const current = isEditing ? form : profile;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT MODE
  // ══════════════════════════════════════════════════════════════════════════
  if (isEditing) {
    return (
      <div className="p-6 space-y-6 bg-[#0B0E1E] min-h-screen">
        {/* Error Banner */}
        {saveError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {saveError}
          </div>
        )}

        {/* ── Cover Photo Upload ── */}
        <div
          className="relative w-full h-98 rounded-2xl bg-[#111530] border-2 border-dashed border-[#1e2650] hover:border-cyan-400/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2"
          onClick={() => coverRef.current?.click()}
        >
          {(coverPreview || profile.cover_image) && (
            <img
              src={coverPreview || profile.cover_image}
              alt="cover"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <Upload size={28} className="text-cyan-400 relative z-10" />
          <span className="text-cyan-400 text-sm font-bold relative z-10">
            Upload Cover Photo
          </span>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setCoverPreview(URL.createObjectURL(f));
                set("_coverFile", f);
              }
            }}
          />
          {/* Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={isSaving}
            className="absolute top-4 right-4 z-20 px-5 py-2.5 bg-cyan-400 text-[#0B0E1E] rounded-xl font-black text-sm flex items-center gap-2 hover:bg-cyan-300 transition-all disabled:opacity-60"
          >
            <Save size={15} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* ── Logo + Basic hero fields (below cover) ── */}
        <div className="flex gap-6 items-start">
          {/* Logo upload */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="w-28 h-28 rounded-full bg-[#111530] border-2 border-[#1e2650] overflow-hidden flex items-center justify-center cursor-pointer hover:border-cyan-400/50 transition-all"
              onClick={() => logoRef.current?.click()}
            >
              {logoPreview || profile.logo ? (
                <img
                  src={logoPreview || profile.logo}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={28} className="text-gray-500" />
              )}
            </div>
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              className="text-xs text-cyan-400 flex items-center gap-1 font-bold hover:text-cyan-300 transition-colors"
            >
              <Upload size={11} /> Upload Photo
            </button>
            <p className="text-[9px] text-gray-500 text-center max-w-[120px]">
              Please upload a recent, high-quality portrait photo.
            </p>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setLogoPreview(URL.createObjectURL(f));
                  set("_logoFile", f);
                }
              }}
            />
          </div>
        </div>

        {/* ── Row 1: Basic Info + Contact Info ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardTitle>Basic Information</CardTitle>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Club Name
                </label>
                <EInput
                  value={current.club_name || ""}
                  onChange={(v) => set("club_name", v)}
                  placeholder="FC Barcelona Youth"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Tagline
                </label>
                <EInput
                  value={current.tagline || ""}
                  onChange={(v) => set("tagline", v)}
                  placeholder="International Football Academy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-bold">
                    Location
                  </label>
                  <EInput
                    value={current.location || ""}
                    onChange={(v) => set("location", v)}
                    placeholder="Barcelona, Spain"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-bold">
                    Founded Year
                  </label>
                  <EInput
                    value={current.founded_year || ""}
                    onChange={(v) => set("founded_year", v)}
                    placeholder="1899"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-bold">
                    Age Groups
                  </label>
                  <EInput
                    value={
                      current.age_groups_text ||
                      (Array.isArray(current.age_groups)
                        ? current.age_groups.join(", ")
                        : "")
                    }
                    onChange={(v) => set("age_groups_text", v)}
                    placeholder="U-7 to U-23"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-bold">
                    Total Players
                  </label>
                  <EInput
                    value={current.total_players || ""}
                    onChange={(v) => set("total_players", v)}
                    placeholder="745"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardTitle>Contact Information</CardTitle>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Email Address
                </label>
                <EInput
                  value={current.email || ""}
                  onChange={(v) => set("email", v)}
                  placeholder="academy@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Phone Number
                </label>
                <EInput
                  value={current.phone || ""}
                  onChange={(v) => set("phone", v)}
                  placeholder="+34 93 496 36 00"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Website
                </label>
                <EInput
                  value={current.website || ""}
                  onChange={(v) => set("website", v)}
                  placeholder="www.fcbarcelona.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Full Address
                </label>
                <EInput
                  value={current.address || ""}
                  onChange={(v) => set("address", v)}
                  placeholder="Full address..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Row 2: About + Social Media ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* About */}
          <Card>
            <CardTitle>About the Academy</CardTitle>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Overview
                </label>
                <ETextarea
                  value={current.overview || ""}
                  onChange={(v) => set("overview", v)}
                  placeholder="Describe your academy..."
                  rows={5}
                />
                <p className="text-[10px] text-gray-600">
                  {(current.overview || "").length} characters
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold">
                  Our Mission
                </label>
                <ETextarea
                  value={current.mission || ""}
                  onChange={(v) => set("mission", v)}
                  placeholder="What is your club's mission..."
                  rows={5}
                />
                <p className="text-[10px] text-gray-600">
                  {(current.mission || "").length} characters
                </p>
              </div>
            </div>
          </Card>

          {/* Social Media */}
          <Card>
            <CardTitle>Social Media</CardTitle>
            <div className="space-y-4">
              {( [
                { label: "Facebook", key: "facebook" },
                { label: "Twitter / X", key: "twitter" },
                { label: "Instagram", key: "instagram" },
                { label: "YouTube", key: "youtube" },
              ] as { label: string; key: keyof ClubProfile }[]).map(({ label, key }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs text-gray-500 font-bold">
                    {label}
                  </label>
                  <EInput
                    value={(current[key] as string) || ""}
                    onChange={(v) => set(key, v)}
                    placeholder={`${label} URL or handle`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Facilities ── */}
        <Card>
          <div className="flex justify-between items-center mb-5">
            <CardTitle>Facilities</CardTitle>
            <button
              type="button"
              onClick={() =>
                set("facilities", [...(current.facilities || []), ""])
              }
              className="text-xs text-cyan-400 flex items-center gap-1 font-bold hover:text-cyan-300 transition-colors"
            >
              <Plus size={13} /> Add Facility
            </button>
          </div>
          <div className="space-y-3">
            {(current.facilities || []).map((f: string, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <EInput
                  value={f}
                  onChange={(v) => {
                    const arr = [...(current.facilities || [])];
                    arr[i] = v;
                    set("facilities", arr);
                  }}
                  placeholder="Facility name"
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "facilities",
                      (current.facilities || []).filter(
                        (_: string, idx: number) => idx !== i,
                      ),
                    )
                  }
                  className="text-red-400 hover:text-red-300 transition-colors shrink-0 p-2 bg-red-400/10 rounded-lg border border-red-400/20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Recent Achievements ── */}
        <Card>
          <div className="flex justify-between items-center mb-5">
            <CardTitle>Recent Achievements</CardTitle>
            <button
              type="button"
              onClick={() =>
                set("achievements", [
                  ...(current.achievements || []),
                  { title: "", year: "" },
                ])
              }
              className="text-xs text-cyan-400 flex items-center gap-1 font-bold hover:text-cyan-300 transition-colors"
            >
              <Plus size={13} /> Add Achievement
            </button>
          </div>
          <div className="space-y-4">
            {(current.achievements || []).map((a: Achievement, i: number) => (
              <div
                key={i}
                className="space-y-2 pb-4 border-b border-[#1e2650] last:border-0 last:pb-0"
              >
                <div className="grid grid-cols-[1fr_140px] gap-3">
                  <EInput
                    value={a.title || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.achievements || []),
                      );
                      arr[i].title = v;
                      set("achievements", arr);
                    }}
                    placeholder="Achievement Title"
                  />
                  <EInput
                    value={a.year || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.achievements || []),
                      );
                      arr[i].year = v;
                      set("achievements", arr);
                    }}
                    placeholder="Year"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "achievements",
                      (current.achievements || []).filter(
                        (_: Achievement, idx: number) => idx !== i,
                      ),
                    )
                  }
                  className="text-xs text-red-400 flex items-center gap-1.5 font-bold hover:text-red-300 transition-colors"
                >
                  <Trash2 size={12} /> Remove Achievement
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Upcoming Events ── */}
        <Card>
          <div className="flex justify-between items-center mb-5">
            <CardTitle>Upcoming Events</CardTitle>
            <button
              type="button"
              onClick={() =>
                set("upcoming_events", [
                  ...(current.upcoming_events || []),
                  { title: "", date: "", venue: "", fee: "" },
                ])
              }
              className="text-xs text-cyan-400 flex items-center gap-1 font-bold hover:text-cyan-300 transition-colors"
            >
              <Plus size={13} /> Add Event
            </button>
          </div>
          <div className="space-y-4">
            {(current.upcoming_events || []).map((ev: UpcomingEvent, i: number) => (
              <div
                key={i}
                className="space-y-2 pb-4 border-b border-[#1e2650] last:border-0 last:pb-0"
              >
                <div className="grid grid-cols-2 gap-3">
                  <EInput
                    value={ev.title || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.upcoming_events || []),
                      );
                      arr[i].title = v;
                      set("upcoming_events", arr);
                    }}
                    placeholder="Event Name"
                  />
                  <EInput
                    value={ev.date || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.upcoming_events || []),
                      );
                      arr[i].date = v;
                      set("upcoming_events", arr);
                    }}
                    placeholder="Date (DD/MM/YYYY)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <EInput
                    value={ev.venue || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.upcoming_events || []),
                      );
                      arr[i].venue = v;
                      set("upcoming_events", arr);
                    }}
                    placeholder="Venue"
                  />
                  <EInput
                    value={ev.fee || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.upcoming_events || []),
                      );
                      arr[i].fee = v;
                      set("upcoming_events", arr);
                    }}
                    placeholder="Fee (optional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "upcoming_events",
                      (current.upcoming_events || []).filter(
                        (_: UpcomingEvent, idx: number) => idx !== i,
                      ),
                    )
                  }
                  className="text-xs text-red-400 flex items-center gap-1.5 font-bold hover:text-red-300 transition-colors"
                >
                  <Trash2 size={12} /> Remove Event
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Featured Players ── */}
        <Card>
          <div className="flex justify-between items-center mb-5">
            <CardTitle>Featured Players</CardTitle>
            <button
              type="button"
              onClick={() =>
                set("featured_players", [
                  ...(current.featured_players || []),
                  { name: "", age_group: "", position: "" },
                ])
              }
              className="text-xs text-cyan-400 flex items-center gap-1 font-bold hover:text-cyan-300 transition-colors"
            >
              <Plus size={13} /> Add Player
            </button>
          </div>
          <div className="space-y-4">
            {(current.featured_players || []).map((p: FeaturedPlayer, i: number) => (
              <div
                key={i}
                className="space-y-2 pb-4 border-b border-[#1e2650] last:border-0 last:pb-0"
              >
                <div className="grid grid-cols-3 gap-3">
                  <EInput
                    value={p.name || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.featured_players || []),
                      );
                      arr[i].name = v;
                      set("featured_players", arr);
                    }}
                    placeholder="Player Name"
                  />
                  <EInput
                    value={p.age_group || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.featured_players || []),
                      );
                      arr[i].age_group = v;
                      set("featured_players", arr);
                    }}
                    placeholder="Age Group (U-17)"
                  />
                  <EInput
                    value={p.position || ""}
                    onChange={(v) => {
                      const arr = JSON.parse(
                        JSON.stringify(current.featured_players || []),
                      );
                      arr[i].position = v;
                      set("featured_players", arr);
                    }}
                    placeholder="Position"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "featured_players",
                      (current.featured_players || []).filter(
                        (_: FeaturedPlayer, idx: number) => idx !== i,
                      ),
                    )
                  }
                  className="text-xs text-red-400 flex items-center gap-1.5 font-bold hover:text-red-300 transition-colors"
                >
                  <Trash2 size={12} /> Remove Player
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end gap-4 pb-8">
          <button
            onClick={cancelEditing}
            className="px-8 py-3 rounded-xl border border-[#1e2650] text-gray-400 font-black hover:bg-white/5 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-cyan-400 text-[#0B0E1E] font-black flex items-center gap-2 hover:bg-cyan-300 transition-all text-sm disabled:opacity-60"
          >
            <Save size={15} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW MODE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0B0E1E] text-white">
      {/* Cover */}
      <div className="relative">
        <div className="h-64 md:h-80 bg-[#111530] overflow-hidden relative">
          {profile.cover_image ? (
            <img
              src={profile.cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#121433] to-[#1a1f4e]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E1E]/80 to-transparent" />
        </div>

        {/* Nav buttons */}
        <div className="absolute top-4 left-6 right-6 flex justify-between items-center">
          <button className="px-4 py-2 bg-[#111530]/80 backdrop-blur-sm border border-[#1e2650] rounded-xl text-sm text-gray-300 font-bold hover:text-white transition-colors">
            ← Back to Directory
          </button>
          <button
            onClick={startEditing}
            className="px-5 py-2.5 bg-cyan-400 text-[#0B0E1E] rounded-xl font-black text-sm flex items-center gap-2 hover:bg-cyan-300 transition-all"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>

        {/* Identity strip */}
        <div className="absolute -bottom-0 left-0 right-0 bg-[#0B0E1E]/90 backdrop-blur-sm border-t border-[#1e2650] px-8 py-5 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#111530] border-2 border-cyan-400/40 overflow-hidden flex items-center justify-center shrink-0 -mt-10">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Shield size={28} className="text-cyan-400" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest border border-cyan-400/30 bg-cyan-400/5 px-2 py-0.5 rounded-full">
              {profile.club_type}
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              {profile.club_name}
            </h1>
            <p className="text-sm text-gray-400">{profile.tagline}</p>
            <div className="flex items-center gap-6 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-cyan-400" />{" "}
                {profile.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-cyan-400" />{" "}
                {profile.founded_year}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={12} className="text-cyan-400" />{" "}
                {profile.total_players}
              </span>
            </div>
          </div>
          {/* <button className="px-5 py-2.5 bg-[#04B5A3] text-white rounded-xl font-bold text-sm hover:bg-[#039d8f] transition-all flex items-center gap-2">
            <MessageSquare size={14} /> Contact Club
          </button> */}
        </div>
      </div>

      <div className="pt-28 px-6 pb-16 space-y-10 max-w-[1400px] mx-auto">
        {/* About */}
        <section>
          <h2 className="text-2xl font-black text-cyan-400 mb-8">
            About the Academy
          </h2>
          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            <Card className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">
                  Overview
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {profile.overview}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">
                  Our Mission
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {profile.mission}
                </p>
              </div>
            </Card>
            <div className="space-y-6">
              <Card>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                  Age Groups
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(profile.age_groups)
                    ? profile.age_groups
                    : ["U-10", "U-12", "U-14", "U-16", "U-18", "U-21"]
                  ).map((g: string) => (
                    <span
                      key={g}
                      className="px-3 py-1.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded-full text-xs font-black"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                  Facilities
                </h3>
                <ul className="space-y-3">
                  {(profile.facilities || []).map((f: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-gray-400"
                    >
                      <Check
                        size={14}
                        className="text-cyan-400 mt-0.5 shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <GradientTitle first="Recent" second="Achievements" />
          <div className="grid md:grid-cols-3 gap-6">
            {(profile.achievements || []).map((a: any, i: number) => {
              const colors = [
                "from-cyan-400/20 to-cyan-400/5 border-cyan-400/20 text-cyan-400",
                "from-purple-400/20 to-purple-400/5 border-purple-400/20 text-purple-400",
                "from-amber-400/20 to-amber-400/5 border-amber-400/20 text-amber-400",
              ];
              const c = colors[i % colors.length];
              return (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${c} border rounded-[24px] p-6`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={18} />
                    <span className="text-sm font-black">{a.year}</span>
                  </div>
                  <h3 className="text-white font-black text-lg leading-tight">
                    {a.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </section>

        {/* Events */}
        <section>
          <GradientTitle first="Upcoming" second="Events" />
          <div className="grid md:grid-cols-3 gap-6">
            {(profile.upcoming_events || []).length > 0 ? (
              (profile.upcoming_events || []).map((ev: any, i: number) => (
                <Card
                  key={i}
                  className="hover:border-cyan-400/30 transition-all space-y-3"
                >
                  <h3 className="text-white font-black">{ev.title}</h3>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-cyan-400" /> {ev.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-cyan-400" /> {ev.venue}
                    </div>
                    {ev.fee && (
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">$</span> {ev.fee}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 border border-dashed border-white/5 rounded-[24px] text-center text-gray-500">
                <p className="text-sm">No upcoming events scheduled yet.</p>
              </div>
            )}
          </div>
        </section>

      

        {/* Featured Players */}
        <section>
          <GradientTitle first="Featured" second="Players" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(profile.featured_players || []).length > 0 ? (
              (profile.featured_players || []).map((p: any, i: number) => (
                <Card
                  key={i}
                  className="flex flex-col items-center text-center gap-3 hover:border-cyan-400/30 transition-all group"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1a1f4e] to-[#0f1228] flex items-center justify-center border-2 border-[#1e2650] group-hover:border-cyan-400/30 transition-all">
                    <span className="text-2xl font-black text-gray-600">
                      {p.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">{p.name}</h4>
                    <p className="text-cyan-400 text-xs font-bold">
                      {p.position}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {p.age_group || p.age} years • {p.country || "N/A"}
                    </p>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 border border-dashed border-white/5 rounded-[24px] text-center text-gray-500">
                <p className="text-sm">No featured players added yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-black text-cyan-400 mb-8">
            Contact Information
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="space-y-5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                Get in Touch
              </h3>
              {[
                {
                  icon: <Mail size={16} className="text-cyan-400" />,
                  label: "Email",
                  value: profile.email,
                },
                {
                  icon: <Phone size={16} className="text-cyan-400" />,
                  label: "Phone",
                  value: profile.phone,
                },
                {
                  icon: <Globe size={16} className="text-cyan-400" />,
                  label: "Website",
                  value: profile.website,
                },
                {
                  icon: <MapPin size={16} className="text-cyan-400" />,
                  label: "Address",
                  value: profile.address,
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm text-white">{value}</p>
                  </div>
                </div>
              ))}
            </Card>
            <div className="space-y-6">
              <Card>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5">
                  Follow Us
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: <Facebook size={16} />,
                      label: "Facebook",
                      href: profile.facebook,
                    },
                    {
                      icon: <Instagram size={16} />,
                      label: "Instagram",
                      href: profile.instagram,
                    },
                    {
                      icon: <Twitter size={16} />,
                      label: "Twitter",
                      href: profile.twitter,
                    },
                    {
                      icon: <Youtube size={16} />,
                      label: "YouTube",
                      href: profile.youtube,
                    },
                  ].map(({ icon, label, href }) => (
                    <a
                      key={label}
                      href={href?.startsWith("http") ? href : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-[#0B0E1E] border border-[#1e2650] rounded-xl text-sm text-gray-300 font-bold hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
                    >
                      {icon} {label}
                    </a>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">
                  Send a Message
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  Interested in joining our academy? Send us a message and we'll
                  get back to you within 24 hours.
                </p>
                <button className="w-full py-3.5 bg-[#04B5A3] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#039d8f] active:scale-[0.98] transition-all">
                  <MessageSquare size={16} /> Send Message
                </button>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClubProfilePage;
