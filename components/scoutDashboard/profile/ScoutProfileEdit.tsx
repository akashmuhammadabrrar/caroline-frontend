import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import {
  MapPin,
  Globe,
  Twitter,
  Facebook,
  Youtube,
  Instagram,
  Plus,
  X,
  Save,
  Camera,
  Cloud,
  Trophy,
  Award,
  Trash2,
  ChevronLeft,
  Building2,
  Target,
  Eye,
  Star,
  Activity,
  Phone,
  Mail,
  Flag,
} from "lucide-react";
import { useUpdateProfileMutation } from "@/redux/features/scout/scoutProfileApi";
import {
  ScoutProfile,
  Achievement,
  NotableDiscovery,
  ScoutingRegion,
  ProfessionalHistory,
  ScoutingStatistic,
} from "@/types/scout/profileType";
import DarkPhoneInput from "../../reuseable/DarkPhoneInput";

// Form types
export interface FormValues {
  full_name: string;
  first_name: string;
  last_name: string;
  bio: string;
  about: string;
  location: string;
  experience_years: number | string;
  connections: number | string;
  email: string;
  phone: string;
  website: string;
  twitter: string;
  facebook: string;
  youtube: string;
  instagram: string;
  profile_visibility: string;
  contact_requests: boolean;
  show_online_status: boolean;
  activity_history: boolean;
  preferred_leagues: string;
  contact_status: string;
  availability: string;
  specialization: string;
  scouting_statistics: ScoutingStatistic;
  achievements: Achievement[];
  notable_discoveries: NotableDiscovery[];
  scouting_regions: ScoutingRegion[];
  professional_history: ProfessionalHistory[];
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] text-[#5B6397] uppercase tracking-wider mb-2 block font-bold">
    {children}
  </label>
);

const inputCls =
  "w-full bg-[#111640] border border-[#1A2160] text-white text-xs rounded-lg px-4 py-3 placeholder-[#2D3568] focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/20 transition-all shadow-inner";

const Card = ({
  title,
  onAdd,
  children,
  headerAction,
}: {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) => (
  <div className="bg-[#12143A] border border-white/[0.08] rounded-2xl p-6 md:p-8 mb-6 shadow-xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest">
        {title}
      </h3>
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-[#00D9FF] text-[10px] font-bold hover:brightness-125 transition-all"
        >
          <Plus size={10} /> Add {title.replace(/s$/, "")}
        </button>
      ) : (
        headerAction
      )}
    </div>
    {children}
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
    onClick={onChange}
    className={`relative w-10 h-5.5 rounded-full transition-all duration-300 flex-shrink-0 ${checked ? "bg-gradient-to-r from-[#00D9FF] to-[#00B4D8] shadow-[0_0_10px_rgba(0,217,255,0.4)]" : "bg-[#1A2160]"}`}
  >
    <span
      className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-lg transition-transform duration-300 transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
    />
  </button>
);

const SuccessRateInput = ({
  register,
  name,
}: {
  register: any;
  name: string;
}) => (
  <div className="relative border-b border-white/5 pb-2">
    <div className="flex items-center gap-1">
      <input
        {...register(name)}
        className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0"
        placeholder="e.g. 89"
      />
      <span className="text-white/30 text-xs font-bold">%</span>
    </div>
  </div>
);

export default function ProfileEditForm({
  profile,
  onCancel,
  onSuccess,
}: {
  profile: ScoutProfile;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState(profile.cover_image ?? "");
  const [avatarPreview, setAvatarPreview] = useState(
    profile.profile_image ?? "",
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      full_name:
        `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
      bio: profile.bio ?? "",
      about: profile.about ?? "",
      location: profile.location ?? "",
      experience_years: profile.experience_years ?? "",
      connections: profile.connections ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      website: profile.website ?? "",
      twitter: profile.twitter ?? "",
      facebook: profile.facebook ?? "",
      youtube: profile.youtube ?? "",
      instagram: profile.instagram ?? "",
      profile_visibility: profile.profile_visibility ?? "public",
      contact_requests: profile.contact_requests ?? false,
      show_online_status: profile.show_online_status ?? false,
      activity_history: profile.activity_history ?? false,
      preferred_leagues: profile.preferred_leagues ?? "",
      contact_status: profile.contact_status ?? "",
      availability: profile.availability ?? "",
      specialization: Array.isArray(profile.specialization) 
        ? profile.specialization.map(s => typeof s === 'string' ? s : Object.values(s)[0] || JSON.stringify(s)).join(", ") 
        : "",
      scouting_statistics: {
        players_scouted: profile.scouting_statistics?.players_scouted ?? "",
        players_recommended:
          profile.scouting_statistics?.players_recommended ?? "",
        professional_placements:
          profile.scouting_statistics?.professional_placements ?? "",
        success_rate: profile.scouting_statistics?.success_rate ?? "",
        clubs_worked_with: profile.scouting_statistics?.clubs_worked_with ?? "",
        international_coverage:
          profile.scouting_statistics?.international_coverage ?? "",
      },
      achievements: (profile.achievements ?? []).map((a) => ({
        id: a.id,
        club_name: a.club_name ?? "",
        achievement: a.achievement ?? "",
        year: a.year ?? new Date().getFullYear(),
        affiliation_type: a.affiliation_type ?? "",
      })),
      notable_discoveries: (profile.notable_discoveries ?? []).map((d) => ({
        player_name: d.player_name ?? "",
        position: d.position ?? "",
        current_team: d.current_team ?? "",
        discovered_year: d.discovered_year ?? "",
      })),
      scouting_regions: (profile.scouting_regions ?? []).map((r) => ({
        country: r.country ?? "",
        coverage_type: r.coverage_type ?? "",
        active_since: r.active_since ?? "",
      })),
      professional_history: (profile.professional_history ?? []).map((h) => ({
        organization: h.organization ?? "",
        role: h.role ?? "",
        duration: h.duration ?? "",
        is_current: h.is_current ?? false,
        description: h.description ?? "",
      })),
    },
  });

  const {
    fields: achFields,
    append: appendAch,
    remove: removeAch,
  } = useFieldArray({ control, name: "achievements" });
  const {
    fields: discoveryFields,
    append: appendDiscovery,
    remove: removeDiscovery,
  } = useFieldArray({ control, name: "notable_discoveries" });
  const {
    fields: regionFields,
    append: appendRegion,
    remove: removeRegion,
  } = useFieldArray({ control, name: "scouting_regions" });
  const {
    fields: historyFields,
    append: appendHistory,
    remove: removeHistory,
  } = useFieldArray({ control, name: "professional_history" });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const fd = new FormData();
      if (coverFile) {
        fd.append("cover_image", coverFile);
      }
      if (avatarFile) {
        fd.append("profile_image", avatarFile);
      }

      // Split full name back into first and last
      const nameParts = data.full_name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      fd.append("first_name", firstName);
      fd.append("last_name", lastName);

      // Clean integer fields
      const parseNum = (val: any) => parseInt(String(val).replace(/\D/g, ""), 10) || 0;
      
      const expYears = parseNum(data.experience_years);
      const conns = parseNum(data.connections);
      
      if (expYears >= 0) fd.append("experience_years", String(expYears));
      if (conns >= 0) fd.append("connections", String(conns));

      const scalar: (keyof FormValues)[] = [
        "bio",
        "about",
        "location",
        "email",
        "phone",
        "website",
        "twitter",
        "facebook",
        "youtube",
        "instagram",
        "profile_visibility",
        "preferred_leagues",
        "contact_status",
        "availability",
      ];

      scalar.forEach((k) => {
        const v = (data as any)[k];
        if (v !== undefined && v !== null && v !== "" && String(v).trim() !== "") {
          fd.append(k, String(v).trim());
        }
      });

      fd.append("contact_requests", String(data.contact_requests));
      fd.append("show_online_status", String(data.show_online_status));
      fd.append("activity_history", String(data.activity_history));

      // Handle Specialization safely (allow for objects or strings)
      const specList = data.specialization
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
        
      fd.append("specialization", JSON.stringify(specList));

      if (data.scouting_statistics) {
        fd.append("scouting_statistics", JSON.stringify(data.scouting_statistics));
      }

      // Clean achievement ints
      const cleanAchs = data.achievements.map((a) => ({
        ...a,
        year: parseNum(a.year) || new Date().getFullYear(),
      }));
      if (cleanAchs.length > 0) {
        fd.append("achievements", JSON.stringify(cleanAchs));
      } else {
        fd.append("achievements", "[]");
      }

      if (data.notable_discoveries?.length > 0) {
        fd.append("notable_discoveries", JSON.stringify(data.notable_discoveries));
      } else {
        fd.append("notable_discoveries", "[]");
      }
      
      if (data.scouting_regions?.length > 0) {
        fd.append("scouting_regions", JSON.stringify(data.scouting_regions));
      } else {
        fd.append("scouting_regions", "[]");
      }
      
      if (data.professional_history?.length > 0) {
        fd.append("professional_history", JSON.stringify(data.professional_history));
      } else {
        fd.append("professional_history", "[]");
      }

      await updateProfile({ id: profile.id, data: fd }).unwrap();
      toast.success("Profile updated successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err?.data?.message || err?.data?.detail || "Failed to update profile. Please verify your inputs.");
    }
  };

  return (
    <div className="pb-24">
      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />
      <input
        ref={avatarRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Banner ── */}
        <div className="relative h-[280px] w-full rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url(${coverPreview || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop"})`,
            }}
          >
            <div className="absolute inset-0 bg-[#0B0D2C]/60" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-1">
              <Cloud size={24} className="text-white/60" />
            </div>
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="text-[#00D9FF] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:brightness-125 transition-all"
            >
              <Cloud size={14} className="mb-0.5" /> Upload Cover Photo
            </button>
          </div>

          <div className="absolute top-6 right-6 z-20 flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#00D9FF] text-[#070B24] border border-[#00D9FF] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] disabled:opacity-50"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── Basic Information Card ── */}
        <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-30 mb-12">
          <div className="bg-[#12143C] border border-white/[0.1] rounded-[24px] p-8 md:p-10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-12">
            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-6">
              <div className="w-44 h-44 rounded-full border-4 border-[#1A2160] overflow-hidden bg-[#111640] shadow-2xl relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center h-full">
                    <X size={48} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 border-[6px] border-[#12143C] rounded-full pointer-events-none" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="px-6 py-2 rounded-lg bg-[#111640] border border-[#1A2160] text-[#00D9FF] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#1A2160] transition-all"
                >
                  <Plus size={12} /> Upload Photo
                </button>
                <p className="text-[9px] text-white/30 text-center max-w-[160px] leading-relaxed">
                  Please upload a recent, high-quality portrait photo (clear
                  face, no sunglasses/caps, minimum 800x800px).
                </p>
              </div>
            </div>

            {/* Form Grid */}
            <div className="flex-1 w-full space-y-6">
              <h2 className="text-lg font-bold text-white">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-full">
                  <FieldLabel>Full Name</FieldLabel>
                  <input
                    {...register("full_name")}
                    className={inputCls}
                    placeholder="Roberto Martinez"
                  />
                </div>
                <div className="col-span-full">
                  <FieldLabel>Professional Title</FieldLabel>
                  <input
                    {...register("contact_status")}
                    className={inputCls}
                    placeholder="Senior Scout - Youth Development"
                  />
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <input
                    {...register("location")}
                    className={inputCls}
                    placeholder="Madrid, Spain"
                  />
                </div>
                <div>
                  <FieldLabel>Experience</FieldLabel>
                  <input
                    {...register("experience_years")}
                    className={inputCls}
                    placeholder="22 years"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="About">
              <div className="space-y-6">
                <div>
                  <FieldLabel>Biography</FieldLabel>
                  <textarea
                    {...register("about")}
                    rows={8}
                    className={`${inputCls} resize-none`}
                    placeholder="Describe your philosophy, success stories, and background in detail..."
                  />
                  <p className="text-[10px] text-white/20 mt-2">
                    250 characters.
                  </p>
                </div>
                <div>
                  <FieldLabel>Specializations (comma-separated)</FieldLabel>
                  <input
                    {...register("specialization")}
                    className={inputCls}
                    placeholder="Youth Scouting, Technical Analysis, Player Development, International Scouting"
                  />
                </div>
              </div>
            </Card>

            <Card title="Scouting Statistics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>Players Scouted</FieldLabel>
                  <div className="relative border-b border-white/5 pb-2">
                    <input
                      {...register("scouting_statistics.players_scouted")}
                      className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0"
                      placeholder="e.g. 1,200+"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Players Recommended</FieldLabel>
                  <div className="relative border-b border-white/5 pb-2">
                    <input
                      {...register("scouting_statistics.players_recommended")}
                      className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0"
                      placeholder="e.g. 145"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Success Rate (%)</FieldLabel>
                  <SuccessRateInput
                    register={register}
                    name="scouting_statistics.success_rate"
                  />
                </div>
                <div>
                  <FieldLabel>Clubs Worked With</FieldLabel>
                  <div className="relative border-b border-white/5 pb-2">
                    <input
                      {...register("scouting_statistics.clubs_worked_with")}
                      className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0"
                      placeholder="e.g. 81%"
                    />
                  </div>
                </div>
                <div className="col-span-full">
                  <FieldLabel>International Coverage</FieldLabel>
                  <div className="relative border-b border-white/5 pb-2">
                    <input
                      {...register(
                        "scouting_statistics.international_coverage",
                      )}
                      className="w-full bg-transparent border-none text-white font-bold p-0 focus:ring-0"
                      placeholder="e.g. 26"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Notable Discoveries"
              onAdd={() =>
                appendDiscovery({
                  player_name: "",
                  position: "",
                  current_team: "",
                  discovered_year: "",
                })
              }
            >
              <div className="space-y-4">
                {discoveryFields.map((field, i) => (
                  <div
                    key={field.id}
                    className="p-6 rounded-2xl bg-[#0B0D2C] border border-white/5 relative group"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          {...register(`notable_discoveries.${i}.player_name`)}
                          className={inputCls}
                          placeholder="Carlos Fernandez"
                        />
                      </div>
                      <div>
                        <input
                          {...register(`notable_discoveries.${i}.position`)}
                          className={inputCls}
                          placeholder="Midfielder"
                        />
                      </div>
                      <div>
                        <input
                          {...register(`notable_discoveries.${i}.current_team`)}
                          className={inputCls}
                          placeholder="Real Madrid CF"
                        />
                      </div>
                      <div>
                        <input
                          {...register(
                            `notable_discoveries.${i}.discovered_year`,
                          )}
                          className={inputCls}
                          placeholder="2018"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDiscovery(i)}
                      className="mt-4 text-[10px] text-red-500/80 flex items-center gap-1.5 font-bold uppercase hover:brightness-125 transition-all"
                    >
                      <Trash2 size={12} /> Remove Discovery
                    </button>
                  </div>
                ))}
              </div>
            </Card>
            <Card
              title="Scouting Regions"
              onAdd={() =>
                appendRegion({
                  country: "",
                  coverage_type: "",
                  active_since: "",
                })
              }
            >
              <div className="space-y-4">
                {regionFields.map((field, i) => (
                  <div
                    key={field.id}
                    className="p-6 rounded-2xl bg-[#0B0D2C] border border-white/5 relative group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        {...register(`scouting_regions.${i}.country`)}
                        className={inputCls}
                        placeholder="England"
                      />
                      <input
                        {...register(`scouting_regions.${i}.coverage_type`)}
                        className={inputCls}
                        placeholder="Full Coverage"
                      />
                      <input
                        {...register(`scouting_regions.${i}.active_since`)}
                        className={inputCls}
                        placeholder="18 years"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRegion(i)}
                      className="mt-4 text-[10px] text-red-500/80 flex items-center gap-1.5 font-bold uppercase hover:brightness-125 transition-all"
                    >
                      <Trash2 size={12} /> Remove Region
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Professional History"
              onAdd={() =>
                appendHistory({
                  organization: "",
                  role: "",
                  duration: "",
                  is_current: false,
                  description: "",
                })
              }
            >
              <div className="space-y-4">
                {historyFields.map((field, i) => (
                  <div
                    key={field.id}
                    className="p-6 rounded-2xl bg-[#0B0D2C] border border-white/5 relative group"
                  >
                    <div className="space-y-4">
                      <input
                        {...register(`professional_history.${i}.organization`)}
                        className={inputCls}
                        placeholder="Manchester United Youth Academy"
                      />
                      <input
                        {...register(`professional_history.${i}.role`)}
                        className={inputCls}
                        placeholder="Senior Scout - Youth Scouting"
                      />
                      <input
                        {...register(`professional_history.${i}.duration`)}
                        className={inputCls}
                        placeholder="Mar 2018 - Present"
                      />

                      <div className="flex items-center gap-3 pt-1">
                        <div
                          onClick={() =>
                            setValue(
                              `professional_history.${i}.is_current`,
                              !watch(`professional_history.${i}.is_current`),
                            )
                          }
                          className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-all ${watch(`professional_history.${i}.is_current`) ? "bg-cyan-500" : "bg-[#1A2160]"}`}
                        >
                          <div
                            className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all ${watch(`professional_history.${i}.is_current`) ? "left-5" : "left-0.5"}`}
                          />
                        </div>
                        <span className="text-xs text-white/60">
                          Current Position
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeHistory(i)}
                        className="mt-2 text-[10px] text-red-500/80 flex items-center gap-1.5 font-bold uppercase hover:brightness-125 transition-all"
                      >
                        <Trash2 size={12} /> Remove Position
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            <Card title="Contact Information">
              <div className="space-y-5">
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input
                    {...register("email")}
                    className={inputCls}
                    placeholder="john.doe@email.com"
                  />
                </div>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <DarkPhoneInput
                    name="phone"
                    control={control as any}
                    placeholder="XXX XXX XXX"
                    className="flex items-center w-full bg-[#111640] border border-[#1A2160] text-white text-xs rounded-lg overflow-hidden focus-within:border-[#00D9FF] focus-within:ring-1 focus-within:ring-[#00D9FF]/20 transition-all shadow-inner"
                  />
                </div>
              </div>
            </Card>

            <Card title="Social Media">
              <div className="space-y-5">
                {[
                  {
                    icon: Instagram,
                    label: "Instagram",
                    name: "instagram" as const,
                  },
                  { icon: Twitter, label: "Twitter", name: "twitter" as const },
                  {
                    icon: Facebook,
                    label: "Facebook",
                    name: "facebook" as const,
                  },
                  { icon: Youtube, label: "YouTube", name: "youtube" as const },
                ].map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon size={14} className="text-[#5B6397]" />
                      <span className="text-[10px] text-[#5B6397] font-bold uppercase">
                        {s.label}
                      </span>
                    </div>
                    <input
                      {...register(s.name)}
                      className={inputCls}
                      placeholder={`@johndoe_${s.name.slice(0, 2)}`}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Achievements"
              headerAction={
                <button
                  type="button"
                  onClick={() =>
                    appendAch({
                      club_name: "",
                      achievement: "",
                      year: new Date().getFullYear(),
                      affiliation_type: "",
                    })
                  }
                  className="w-6 h-6 rounded bg-[#00D9FF]/10 flex items-center justify-center text-[#00D9FF] hover:bg-[#00D9FF]/20 transition-all"
                >
                  <Plus size={14} />
                </button>
              }
            >
              <div className="space-y-2">
                {achFields.map((field, i) => (
                  <div key={field.id} className="flex items-center gap-2 group">
                    <div className="flex-1 bg-[#111640] border border-[#1A2160] rounded-lg px-4 py-2.5">
                      <input
                        {...register(`achievements.${i}.achievement`)}
                        className="w-full bg-transparent text-xs text-white border-none p-0 focus:ring-0"
                        placeholder="Achievement title"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAch(i)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500/60 hover:text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Preferences">
              <div className="space-y-6">
                <div>
                  <FieldLabel>Preferred Leagues</FieldLabel>
                  <input
                    {...register("preferred_leagues")}
                    className={inputCls}
                    placeholder="Premier League, La Liga, Bundesliga"
                  />
                </div>
                <div>
                  <FieldLabel>Contract Status</FieldLabel>
                  <input {...register("contact_status")} className={inputCls} />
                </div>
                <div>
                  <FieldLabel>Availability</FieldLabel>
                  <input
                    {...register("availability")}
                    className={inputCls}
                    placeholder="Available from Summer 2025"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
