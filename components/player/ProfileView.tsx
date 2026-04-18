"use client";

import React, { useState } from "react";
import BoostProfileModal from "./BoostProfileModal";
import { useGetBoostStatusQuery } from "@/redux/features/player/profileBoostingApi";
import { useGetMyProfileQuery } from "@/redux/features/player/playerProfileAndEdit/profileAndEditApi";
import { 
  MapPin, Edit, Zap, Mail, Phone, 
  Instagram, Twitter, Facebook, Youtube, 
  Calendar, Ruler, Weight, Flag, TrendingUp
} from "lucide-react";

interface Props {
  profile: any;
  onEdit: () => void;
}

const StatBox = ({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) => (
  <div className="bg-[#080B1A] rounded-xl p-4 flex flex-col justify-center">
    <div className="flex items-center gap-2 text-[#8B97B5] mb-2">
      <Icon size={14} />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className="text-white text-sm font-medium">{value}</div>
  </div>
);

const MetaText = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs text-[#8B97B5] font-medium mb-1">{label}</span>
    <span className="text-sm text-white font-medium">{value}</span>
  </div>
);

const CareerStat = ({ value, label }: { value: string | number, label: string }) => (
  <div className="bg-[#080B1A] rounded-xl p-5 flex flex-col items-center justify-center">
    <div className="text-3xl font-bold text-[#00E5FF] mb-2">{value}</div>
    <div className="text-[11px] text-[#8B97B5] uppercase tracking-wider font-medium">{label}</div>
  </div>
);

const SkillBar = ({ label, value }: { label: string, value: number }) => (
  <div className="mb-5 last:mb-0">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-sm font-bold text-[#00E5FF]">{value}</span>
    </div>
    <div className="h-2 w-full bg-[#1E2548] rounded-full overflow-hidden">
      <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function ProfileView({ profile, onEdit }: Props) {
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);

  // Fallback to fetch boost status if we have the profile with an active boostRequestId
  const boostRequestId = profile?.active_boost_request_id || ""; 
  const { data: boostStatus } = useGetBoostStatusQuery(boostRequestId, {
    skip: !boostRequestId
  });

  if (!profile) return null;

  const fmt = (d?: string) => {
    if (!d) return "Not Specified";
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const handle = (url?: string) => {
    if (!url) return "";
    let clean = url.replace(/\/$/, "");
    if (clean.includes("instagram.com/")) clean = clean.split("instagram.com/").pop() || clean;
    else if (clean.includes("twitter.com/")) clean = clean.split("twitter.com/").pop() || clean;
    else if (clean.includes("facebook.com/")) clean = clean.split("facebook.com/").pop() || clean;
    else if (clean.includes("youtube.com/")) clean = clean.split("youtube.com/").pop() || clean;
    return clean.split("/").pop() ?? "";
  };

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="max-w-[1240px] mx-auto p-4 md:p-6 pb-24 space-y-6 font-sans">
      
      {/* ── HERO SECTION ── */}
      <div className="bg-[#121730] rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Cover Image */}
        <div className="h-56 md:h-72 w-full relative bg-linear-to-r from-[#0D122B] to-[#1E2548]">
          {profile.cover_image && (
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${profile.cover_image})` }} 
            />
          )}
          
          <div className="absolute top-6 right-6 flex gap-3">
            <button 
              onClick={onEdit}
              className="px-4 py-2 bg-white text-[#00E5FF] rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-all shadow-lg"
            >
              <Edit size={16} /> Edit Profile
            </button>
            <button 
              onClick={() => setIsBoostModalOpen(true)}
              className="px-4 py-2 bg-[#00E5FF] text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#00d0e6] transition-all shadow-lg"
            >
              <Zap size={16} /> Boost Profile
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="px-6 pb-8 md:px-10 md:pb-10 relative">
          
          <div className="flex flex-col md:flex-row md:items-start gap-6 -mt-16 md:-mt-24 mb-8">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#121730] overflow-hidden bg-[#0A0D1F] flex items-center justify-center shrink-0 relative z-10 shadow-2xl">
              {profile.profile_image ? (
                <img src={profile.profile_image} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-4xl font-black text-[#00E5FF]">{profile.first_name?.charAt(0) || "U"}</span>
              )}
            </div>
            
            <div className="flex-1 flex justify-between items-start mt-16 md:mt-24">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <span className="text-[#00E5FF]">{profile.first_name || "Unknown"}</span>
                  <span className="text-[#A25BFF]">{profile.last_name || "Player"}</span>
                </h1>
                <p className="text-[#8B97B5] text-lg font-medium mt-1">
                  {profile.designation || "Position Not Specified"}
                </p>
                <p className="text-[#8B97B5] text-sm mt-2 flex items-center gap-1.5">
                  <MapPin size={14} /> {profile.city ? `${profile.city}${profile.country ? `, ${profile.country}` : ""}` : profile.address || "Location not specified"}
                </p>
              </div>
              
              {profile.availability_status === "AVAILABLE" && (
                <div className="hidden md:flex border border-[#00E5FF]/30 text-[#00E5FF] px-4 py-1.5 rounded-lg text-sm font-medium">
                  Available
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox icon={Calendar} label="Age" value={profile.age ? `${profile.age} years` : "—"} />
            <StatBox icon={Ruler} label="Height" value={profile.height ? `${profile.height} cm` : "—"} />
            <StatBox icon={Weight} label="Weight" value={profile.weight ? `${profile.weight} kg` : "—"} />
            <StatBox icon={Flag} label="Nationality" value={profile.nationality || "—"} />
          </div>

          {/* Meta Text Row */}
          <div className="grid grid-cols-4 gap-4 px-2">
            <MetaText label="Preferred Foot" value={profile.preferred_foot === "LEFT" ? "Left" : profile.preferred_foot === "RIGHT" ? "Right" : "Both"} />
            <MetaText label="Date of Birth" value={fmt(profile.date_of_birth)} />
            <MetaText label="Jersey Number" value={profile.jersey_number ? `#${profile.jersey_number}` : "N/A"} />
            <MetaText label="Gender" value={profile.gender ? (profile.gender === "MALE" ? "Male (M)" : "Female (F)") : "N/A"} />
          </div>

        </div>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          <div className="bg-[#121730] rounded-2xl p-8 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-4">About</h2>
            <p className="text-[#8B97B5] text-sm leading-relaxed">{profile.about || "No biography provided."}</p>
          </div>

          <div className="bg-[#121730] rounded-2xl p-8 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Career Statistics <span className="text-[#8B97B5]">({profile.career_stats?.season || "Current"} Season)</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CareerStat label="Matches" value={profile.career_stats?.matches ?? 0} />
              <CareerStat label="Goals" value={profile.career_stats?.goals ?? 0} />
              <CareerStat label="Assists" value={profile.career_stats?.assists ?? 0} />
              <CareerStat label="Minutes" value={(profile.career_stats?.minutes ?? 0).toLocaleString()} />
            </div>
          </div>

          <div className="bg-[#121730] rounded-2xl p-8 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Skills & Attributes</h2>
            <div className="space-y-1">
              <SkillBar label="Pace" value={profile.skills?.pace ?? 50} />
              <SkillBar label="Shooting" value={profile.skills?.shooting ?? 50} />
              <SkillBar label="Dribbling" value={profile.skills?.dribbling ?? 50} />
              <SkillBar label="Passing" value={profile.skills?.passing ?? 50} />
              <SkillBar label="Physical" value={profile.skills?.physical ?? 50} />
              <SkillBar label="Technical" value={profile.skills?.technical ?? 50} />
            </div>
          </div>

          <div className="bg-[#121730] rounded-2xl p-8 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Playing History</h2>
            <div className="space-y-6">
              {profile.playing_history?.length > 0 ? profile.playing_history.map((h: any) => (
                <div key={h.id} className="bg-[#0A0D1F] p-5 rounded-xl flex flex-col gap-1">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-white font-medium">{h.club_name}</h3>
                    <span className="text-[#00E5FF] text-sm font-medium">{h.start_year} - {h.end_year || "Present"}</span>
                  </div>
                  <div className="text-[#8B97B5] text-sm">{h.position}</div>
                  {h.achievements && (
                    <div className="text-[#8B97B5] text-sm mt-3">{h.achievements}</div>
                  )}
                </div>
              )) : (
                <p className="text-[#8B97B5] text-sm">No playing history available.</p>
              )}
            </div>
          </div>

          <div className="bg-[#121730] rounded-2xl p-8 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Highlight Videos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.highlight_videos?.length > 0 ? profile.highlight_videos.map((v: any, idx: number) => (
                <a 
                  key={v.id} 
                  href={v.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group rounded-xl overflow-hidden cursor-pointer relative block"
                >
                  <div className="h-40 bg-gray-800 relative flex items-center justify-center">
                    {/* YouTube Thumbnail or Fallback */}
                    <img 
                      src={v.video_url ? (getYoutubeThumbnail(v.video_url) || `https://picsum.photos/seed/${v.id}/400/200`) : `https://picsum.photos/seed/${v.id}/400/200`} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-[#00E5FF]/90 flex items-center justify-center pl-1 text-[#070B24] shadow-lg scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5V19L19 12L8 5Z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-[#0A0D1F] to-transparent z-20">
                    <h4 className="text-white text-sm font-medium">{v.title}</h4>
                    <p className="text-[#8B97B5] text-xs mt-1">{v.description || "Video Highlight"}</p>
                  </div>
                </a>
              )) : (
                <p className="text-[#8B97B5] text-sm">No highlight videos available.</p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          <div className="bg-[#121730] rounded-2xl p-6 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#00E5FF]" />
                <span className="text-sm text-[#8B97B5]">{profile.email || "Email not provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#00E5FF]" />
                <span className="text-sm text-[#8B97B5]">{profile.phone || "Phone not provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121730] rounded-2xl p-6 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Social Media</h2>
            <div className="space-y-4">
              {profile.instagram && (
                <a 
                  href={profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Instagram size={18} className="text-[#E1306C]" />
                  <span className="text-sm text-[#8B97B5]">@{handle(profile.instagram)}</span>
                </a>
              )}
              {profile.twitter && (
                <a 
                  href={profile.twitter.startsWith('http') ? profile.twitter : `https://${profile.twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Twitter size={18} className="text-[#1DA1F2]" />
                  <span className="text-sm text-[#8B97B5]">@{handle(profile.twitter)}</span>
                </a>
              )}
              {profile.facebook && (
                <a 
                  href={profile.facebook.startsWith('http') ? profile.facebook : `https://${profile.facebook}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Facebook size={18} className="text-[#1877F2]" />
                  <span className="text-sm text-[#8B97B5]">{profile.first_name} {profile.last_name}</span>
                </a>
              )}
              {profile.youtube && (
                <a 
                  href={profile.youtube.startsWith('http') ? profile.youtube : `https://${profile.youtube}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Youtube size={18} className="text-[#FF0000]" />
                  <span className="text-sm text-[#8B97B5]">{profile.first_name} Football</span>
                </a>
              )}
              {(!profile.instagram && !profile.twitter && !profile.facebook && !profile.youtube) && (
                <p className="text-[#8B97B5] text-sm">No social media links provided.</p>
              )}
            </div>
          </div>

          <div className="bg-[#121730] rounded-2xl p-6 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Achievements</h2>
            <div className="space-y-4">
              {profile.achievements?.length > 0 ? profile.achievements.map((a: any) => (
                <div key={a.id} className="flex gap-3 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0" />
                  <span className="text-sm text-[#8B97B5]">{a.title} - {new Date(a.date_achieved).getFullYear() || "Year"}</span>
                </div>
              )) : (
                <p className="text-[#8B97B5] text-sm">No achievements listed.</p>
              )}
            </div>
          </div>

          <div className="bg-[#121730] rounded-2xl p-6 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#00E5FF]" /> Profile Insights
            </h2>

            {(boostStatus?.status === "Active" || profile?.is_boosted) && (
              <div className="mb-6 bg-linear-to-r from-[#00E5FF]/10 to-[#B026FF]/10 border border-[#00E5FF]/30 p-3 rounded-xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#0A0D1F] flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                    <Zap size={14} className="text-[#00E5FF]" />
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-sm tracking-wide">Boost Active</h4>
                    <p className="text-[10px] text-[#00E5FF]">Profile visibility increased by 4x</p>
                 </div>
              </div>
            )}
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B97B5]">Profile Views</span>
                <span className="text-sm text-white font-medium">{profile.insights?.profile_views ?? 0}</span>
              </div>
              <div className="text-[11px] text-[#00E5FF] -mt-4">+{profile.insights?.profile_views_this_week ?? 0} this week</div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B97B5]">Scout Views</span>
                <span className="text-sm text-white font-medium">{profile.insights?.scout_views ?? 0}</span>
              </div>
              <div className="text-[11px] text-[#00E5FF] -mt-4">+{profile.insights?.scout_views_this_week ?? 0} this week</div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B97B5]">Club Interest</span>
                <span className="text-sm text-white font-medium">{profile.insights?.club_interest ?? 0} clubs</span>
              </div>
              <div className="text-[11px] text-[#00E5FF] -mt-4">+{profile.insights?.club_interest_this_month ?? 0} new this month</div>
            </div>
          </div>

          <div className="bg-[#121730] rounded-2xl p-6 border border-[#1E2548]">
            <h2 className="text-white font-medium text-lg mb-6">Preferences</h2>
            <div className="space-y-5">
              <div>
                <span className="text-sm text-[#8B97B5] block mb-1">Preferred Regions / Countries</span>
                <span className="text-sm text-white font-medium">{profile.preferred_regions || profile.preferred_leagues || "Not Specified"}</span>
              </div>
              <div>
                <span className="text-sm text-[#8B97B5] block mb-1">Contract Status</span>
                <span className="text-sm text-white font-medium">{profile.contract_status || "Not Specified"}</span>
              </div>
              <div>
                <span className="text-sm text-[#8B97B5] block mb-1">Availability</span>
                <span className="text-sm text-white font-medium">{fmt(profile.available_from)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <BoostProfileModal 
        isOpen={isBoostModalOpen} 
        onClose={() => setIsBoostModalOpen(false)} 
      />
    </div>
  );
}
