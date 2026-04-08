// components/scoutDashboard/profile/ScoutProfileView.tsx
"use client";

import {
  MapPin,
  CalendarDays,
  Users,
  Eye,
  Star,
  MessageSquare,
  Trophy,
  Globe,
  Phone,
  Mail,
  Award,
  Target,
  Building2,
  ChevronLeft,
  Twitter,
  Youtube,
  Facebook,
  CheckCircle,
  Flag,
  Instagram,
} from "lucide-react";
import Image from "next/image";
import { ScoutProfile } from "@/types/scout/profileType";

/* ─── Shared Components ────────────────────────────────────────── */
const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-[#12143A] border border-white/[0.08] rounded-2xl p-6 mb-6 shadow-xl">
    <h3 className="text-[10px] font-bold text-[#5B6397] mb-6 uppercase tracking-widest">
      {title}
    </h3>
    {children}
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">
    {title}
  </h2>
);

const fmtDate = (iso?: string) => {
  if (!iso) return "Not available";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export default function ProfileView({ profile }: { profile: ScoutProfile }) {
  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Scout Member";
  
  return (
    <div className="text-white font-sans pb-12 w-full">
      {/* ── Banner & Hero ── */}
      <div className="relative h-[280px] w-full rounded-3xl overflow-hidden">
        {/* Stadium Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${(() => {
              const url = profile.cover_image;
              if (!url || url === "null" || url === "") return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop';
              if (url.startsWith("http") || url.startsWith("/")) return url;
              return `/${url}`;
            })()})` 
          }}
        >
          <div className="absolute inset-0 bg-[#0B0D2C]/60" />
        </div>

        {/* Floating Profile Card */}
        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] z-20">
          <div className="bg-[#12143C] border border-white/[0.08] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-2xl backdrop-blur-sm">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 overflow-hidden flex-shrink-0 relative">
              <Image
                src={(() => {
                  const url = profile.profile_image;
                  if (!url || url === "null" || url === "") {
                    return "https://i.pinimg.com/736x/0a/5b/ca/0a5bcaaceea33af3dd2fa3b80f5db0c5.jpg";
                  }
                  if (url.startsWith("http") || url.startsWith("/")) {
                    return url;
                  }
                  // Prepend slash to relative paths to satisfy Next.js Image component
                  return `/${url}`;
                })()}
                alt={fullName}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold truncate">
                  <span className="text-[#00E5FF]">{profile.first_name || "Unknown"} </span>
                  <span className="text-[#9C27B0]">{profile.last_name || "Member"}</span>
                </h1>
                <CheckCircle size={18} className="text-[#00E5FF] flex-shrink-0" />
              </div>
              <p className="text-sm text-white/50 mb-6 truncate">{profile.bio || "No bio provided"}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 md:gap-x-8 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
                    <MapPin size={16} className="text-[#00E5FF]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/40 uppercase">Location</p>
                    <p className="text-xs font-semibold">{profile.location || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
                    <CalendarDays size={16} className="text-[#00E5FF]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/40 uppercase">Joined</p>
                    <p className="text-xs font-semibold">{fmtDate(profile.joined)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
                    <Users size={16} className="text-[#00E5FF]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/40 uppercase">Connections</p>
                    <p className="text-xs font-semibold">{profile.connections || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
                    <Trophy size={16} className="text-[#00E5FF]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/40 uppercase">Experience</p>
                    <p className="text-xs font-semibold">{profile.experience_years || 0} years</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Spacer for Hero ── */}
      <div className="h-[60px]" />

      {/* ── Stats Card Bar ── */}
      <section className="px-0 max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {[
          { label: "Shortlisted Players", val: profile.dashboard_stats?.shortlisted_players || 0, sub: "Ready for review", icon: Star },
          { label: "Upcoming Events", val: profile.dashboard_stats?.upcoming_events || 0, sub: "In calendar", icon: CalendarDays },
          { label: "Active Conversations", val: profile.dashboard_stats?.active_conversations || 0, sub: "Messaging", icon: MessageSquare },
        ].map((s) => (
          <div key={s.label} className="bg-[#12143A] border border-white/[0.08] rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center mb-4 text-[#00E5FF]">
              <s.icon size={18} />
            </div>
            <p className="text-xs text-white/50 mb-1">{s.label}</p>
            <p className="text-2xl font-bold mb-1">{s.val}</p>
            <p className="text-[10px] text-[#00D4AA]">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* ── Layout Grid ── */}
      <div className="px-0 max-w-7xl mx-auto grid gridz-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About */}
          <div className="bg-[#12143A] border border-white/[0.08] rounded-xl p-7">
            <SectionTitle title="About" />
            <p className="text-sm text-white/70 leading-relaxed mb-6 whitespace-pre-line">
              {profile.about || "No detailed about information provided."}
            </p>
            {profile.specialization && profile.specialization.length > 0 && (
              <div>
                <p className="text-xs text-white/30 uppercase mb-3">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {profile.specialization.map((spec) => (
                    <span key={String(spec)} className="px-3 py-1.5 bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-medium rounded-full">
                      {String(spec).replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scouting Statistics */}
          {profile.scouting_statistics && (
            <div className="bg-[#12143A] border border-white/[0.08] rounded-xl p-7">
              <SectionTitle title="Scouting Statistics" />
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Players Scouted", val: profile.scouting_statistics.players_scouted || 0, icon: Eye },
                  { label: "Recommended", val: profile.scouting_statistics.players_recommended || 0, icon: Star },
                  { label: "Pro Placements", val: profile.scouting_statistics.professional_placements || 0, icon: Trophy },
                ].map((st) => (
                  <div key={st.label} className="bg-[#0B0D2C] border border-white/[0.05] rounded-xl p-4">
                    <div className="text-[#00E5FF] mb-2"><st.icon size={16} /></div>
                    <p className="text-[10px] text-white/40 mb-1">{st.label}</p>
                    <p className="text-lg font-bold">{st.val}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Success Rate", val: `${(Number(profile.scouting_statistics.success_rate) * 1) || 0}%`, icon: Target },
                  { label: "Clubs worked with", val: profile.scouting_statistics.clubs_worked_with || 0, icon: Building2 },
                ].map((st) => (
                  <div key={st.label} className="bg-[#0B0D2C] border border-white/[0.05] rounded-xl p-4">
                    <div className="text-[#00E5FF] mb-2"><st.icon size={16} /></div>
                    <p className="text-[10px] text-white/40 mb-1">{st.label}</p>
                    <p className="text-lg font-bold">{st.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notable Observations */}
          <div className="bg-[#12143A] border border-white/[0.08] rounded-xl p-7">
            <SectionTitle title="Notable Observations" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                  { label: "Availability", val: profile.availability },
                  { label: "Contact Status", val: profile.contact_status },
                  { label: "Preferred Leagues", val: profile.preferred_leagues },
                  { label: "Profile Visibility", val: profile.profile_visibility },
               ].map(item => (
                 <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 md:last:border-b">
                    <span className="text-[#5B6397] text-[11px] font-medium tracking-wide uppercase">{item.label}</span>
                    <span className="text-[#00D9FF] text-xs font-bold text-right truncate max-w-[150px]">{item.val || "—"}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Notable Discoveries */}
          {profile.notable_discoveries && profile.notable_discoveries.length > 0 && (
            <div className="bg-[#12143A] border border-white/[0.08] rounded-2xl p-8 shadow-xl">
              <SectionTitle title="Notable Discoveries" />
              <div className="space-y-6">
                {profile.notable_discoveries.map((p, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-white/5 last:border-0 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-bold text-white">{p.player_name}</p>
                        <div className="w-2 h-2 rounded-full bg-[#00D9FF] shadow-[0_0_8px_rgba(0,217,255,0.4)]" />
                      </div>
                      <p className="text-xs text-[#5B6397] font-medium uppercase tracking-wider">{p.position}</p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-sm font-bold text-[#00D9FF] mb-1">{p.current_team}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Discovered in {p.discovered_year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scouting Regions */}
          <div className="bg-[#12143A] border border-white/[0.08] rounded-xl p-7">
            <SectionTitle title="Scouting Regions" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.scouting_regions && profile.scouting_regions.length > 0 ? (
                profile.scouting_regions.map((r, idx) => (
                  <div key={idx} className="bg-[#0B0D2C] border border-white/[0.05] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flag size={16} className="text-[#5B6397]" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{r.country}</p>
                        <p className="text-[10px] text-white/30 lowercase">{r.coverage_type} coverage</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-[#00E5FF] flex-shrink-0">{r.active_since} years</p>
                  </div>
                ))
              ) : profile.preferred_leagues ? (
                profile.preferred_leagues.split(",").map((r, i) => (
                  <div key={i} className="bg-[#0B0D2C] border border-white/[0.05] rounded-xl p-4 flex items-center gap-3">
                    <Flag size={16} className="text-[#5B6397]" />
                    <span className="text-[#8891BB] text-xs font-medium truncate">{r.trim()}</span>
                  </div>
                ))
              ) : (
                <p className="text-[#2D3568] text-xs italic">No regions set.</p>
              )}
            </div>
          </div>

          {/* Professional History / Achievements */}
          <div className="bg-[#12143A] border border-white/[0.08] rounded-xl p-7">
            <SectionTitle title="Achievements & History" />
            <div className="space-y-6">
              {profile.achievements && profile.achievements.length > 0 ? (
                profile.achievements.map((ach) => (
                  <div key={ach.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0D2C]/40 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center flex-shrink-0 text-[#00E5FF]">
                      <Trophy size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold truncate text-white">{ach.club_name}</p>
                        <span className="text-[#00E5FF] text-[10px] font-bold bg-[#00E5FF]/10 px-2 py-0.5 rounded-lg">{ach.year}</span>
                      </div>
                      <p className="text-xs text-white/70 font-medium">{ach.achievement}</p>
                      <p className="text-[10px] text-[#5B6397] mt-1">{ach.affiliation_type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#2D3568] text-xs italic">No professional history or achievements added.</p>
              )}
              
              {profile.professional_history && profile.professional_history.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-4">
                   <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Job History</p>
                   {profile.professional_history.map((j, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white/50">
                        <Building2 size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold truncate text-white/80">{j.organization}</p>
                          {j.is_current && (
                            <span className="px-2 py-0.5 bg-[#00D4AA] text-black text-[9px] font-bold rounded-lg uppercase">Current</span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/50">{j.role} • {j.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div>
          {/* Contact Info */}
          <SidebarSection title="Personal Information">
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", val: profile.email },
                { icon: Phone, label: "Phone", val: profile.phone },
                { icon: Globe, label: "Website", val: profile.website, color: "text-[#00E5FF]" },
                { icon: Instagram, label: "Instagram", val: profile.instagram },
                { icon: Twitter, label: "Twitter", val: profile.twitter },
                { icon: Facebook, label: "Facebook", val: profile.facebook },
                { icon: Youtube, label: "YouTube", val: profile.youtube },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-[#111640] border border-[#1A2160] flex items-center justify-center text-[#5B6397] group-hover:text-[#00E5FF] group-hover:border-[#00E5FF]/30 transition-all">
                    <c.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-white/30 uppercase">{c.label}</p>
                    <p className={`text-[11px] font-medium truncate ${c.val ? (c.color || "text-white/80") : "text-[#2D3568]"}`}>
                       {c.val ? (
                          <a 
                            href={c.val.startsWith('http') ? c.val : (c.label === 'Email' ? `mailto:${c.val}` : (c.label === 'Phone' ? `tel:${c.val}` : `https://${c.val}`))} 
                            target={c.label === 'Email' || c.label === 'Phone' ? undefined : "_blank"} 
                            rel={c.label === 'Email' || c.label === 'Phone' ? undefined : "noopener noreferrer"} 
                            className="hover:underline"
                          >
                            {c.val.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/').pop() || c.val}
                          </a>
                       ) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>

          {/* Visibility Section */}
          <SidebarSection title="Preferences">
             <div className="space-y-3">
                {[
                  { label: "Contact Requests", val: profile.contact_requests },
                  { label: "Show Online", val: profile.show_online_status },
                  { label: "Activity History", val: profile.activity_history },
                ].map(p => (
                   <div key={p.label} className="flex items-center justify-between p-3 rounded-lg bg-[#0B0D2C] border border-white/5">
                      <span className="text-[11px] text-white/60">{p.label}</span>
                      <div className={`w-2 h-2 rounded-full ${p.val ? 'bg-[#00D4AA] shadow-[0_0_8px_#00D4AA]' : 'bg-red-500'}`} />
                   </div>
                ))}
             </div>
          </SidebarSection>
        </div>
      </div>
    </div>
  );
}