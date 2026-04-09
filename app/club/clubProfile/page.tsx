"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  ArrowLeft,
  X,
  AlertCircle,
  Award,
} from "lucide-react";
import {
  useGetClubProfileQuery,
  useUpdateClubProfileMutation,
} from "../../../redux/features/club/clubProfileApi";
import { toast } from "react-hot-toast";

// --- Types ---
interface Achievement {
  title: string;
  year: string;
  description?: string;
}

interface FeaturedPlayer {
  "player-name": string;
  age: number | string;
  position: string;
  country: string;
  image?: string;
  player_image?: string; // Possible alternative key
  _file?: File; // Temp for upload
  _preview?: string; // Temp for preview
}

interface ClubProfileFormData {
  organization_name: string;
  tagline: string;
  year_established: string | number;
  location: string;
  city: string;
  country: string;
  age_groups: string[];
  total_players: string | number;
  overview: string;
  mission: string;
  facilities: { value: string }[];
  recent_achievements: Achievement[];
  Featured_players: FeaturedPlayer[];
  email: string;
  phone_number: string;
  website: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#111530] border border-[#1e2650] rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const GradientTitle = ({ first, second }: { first: string; second: string }) => (
  <h2 className="text-2xl font-black mb-8">
    <span className="text-white">{first} </span>
    <span className="text-[#a855f7]">{second}</span>
  </h2>
);

const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs text-gray-400 font-bold mb-1.5 block uppercase tracking-[1px]">
    {children}
  </label>
);

const DarkInput = React.forwardRef<HTMLInputElement, any>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full bg-[#0B0D2C] border border-[#1e2650] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50 transition-all ${className}`}
    {...props}
  />
));
DarkInput.displayName = "DarkInput";

const DarkTextarea = React.forwardRef<HTMLTextAreaElement, any>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full bg-[#0B0D2C] border border-[#1e2650] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50 transition-all resize-none ${className}`}
    {...props}
  />
));
DarkTextarea.displayName = "DarkTextarea";

// --- Helpers ---

const fixCloudinaryUrl = (url?: string) => {
  if (!url) return "";
  // Fix the strange "image/upload/http" prefix if present
  if (url.startsWith("image/upload/http")) {
    return url.replace("image/upload/", "");
  }
  return url;
};

// --- Main Page ---

export default function ClubProfilePage() {
  const { data: apiResponse, isLoading: isFetching } = useGetClubProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateClubProfileMutation();

  const [isEditing, setIsEditing] = useState(false);

  // File states
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ClubProfileFormData>({
    defaultValues: {
      organization_name: "",
      tagline: "",
      year_established: "",
      location: "",
      city: "",
      country: "",
      age_groups: [],
      total_players: "",
      overview: "",
      mission: "",
      facilities: [],
      recent_achievements: [],
      Featured_players: [],
      email: "",
      phone_number: "",
      website: "",
      address: "",
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: ""
    }
  });

  const { fields: facilityFields, append: appendFacility, remove: removeFacility } = useFieldArray({ control, name: "facilities" });
  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({ control, name: "recent_achievements" });
  const { fields: playerFields, append: appendPlayer, remove: removePlayer } = useFieldArray({ control, name: "Featured_players" });

  const clubData = apiResponse?.data || {};

  // Setup initial form values when data is loaded
  useEffect(() => {
    if (clubData && !isEditing) {
      reset({
        organization_name: clubData.organization_name || "",
        tagline: clubData.tagline || "",
        year_established: clubData.year_established || "",
        location: clubData.location || "",
        city: clubData.city || "",
        country: clubData.country || "",
        age_groups: clubData.age_groups || [],
        total_players: clubData.total_players || 0,
        overview: clubData.overview || "",
        mission: clubData.mission || "",
        facilities: clubData.facilities?.map((f: string) => ({ value: f })) || [],
        recent_achievements: clubData.recent_achievements || [],
        Featured_players: clubData.featured_players || [],
        email: clubData.email || "",
        phone_number: clubData.phone_number || "",
        website: clubData.website || "",
        address: clubData.address || "",
        facebook: clubData.social_media?.facebook || "",
        instagram: clubData.social_media?.instagram || "",
        twitter: clubData.social_media?.twitter || "",
        youtube: clubData.social_media?.youtube || ""
      });
    }
  }, [clubData, reset, isEditing]);

  const onSave = async (formData: ClubProfileFormData) => {
    try {
      const fd = new FormData();

      // Binary files
      if (logoFile) {
        fd.append("club_logo", logoFile);
      }
      if (bannerFile) {
        fd.append("club_banner", bannerFile);
      }

      // Handle player images
      formData.Featured_players.forEach((player, idx) => {
        if (player._file) {
          // Based on your report, it seems to expect player_image_X
          fd.append(`player_image_${idx}`, player._file);
          // Also append to standard key just in case
          fd.append("player_image", player._file);
        }
      });

      // Prepare the JSON data payload as documented
      const dataPayload = {
        organization_name: formData.organization_name,
        tagline: formData.tagline,
        founded_year: Number(formData.year_established),
        location: formData.location,
        city: formData.city,
        country: formData.country,
        age_groups: formData.age_groups,
        total_players: Number(formData.total_players),
        overview: formData.overview,
        mission: formData.mission,
        facilities: formData.facilities.map(f => f.value),
        recent_achievements: formData.recent_achievements.map(ach => ({
          title: ach.title,
          year: ach.year
        })),
        Featured_players: formData.Featured_players.map(({ _file, _preview, ...rest }) => ({
          "player-name": rest["player-name"],
          age: Number(rest.age),
          position: rest.position,
          country: rest.country
        })),
        email: formData.email,
        phone_number: formData.phone_number,
        website: formData.website,
        address: formData.address,
        facebook: formData.facebook,
        instagram: formData.instagram,
        twitter: formData.twitter,
        youtube: formData.youtube
      };

      fd.append("data", JSON.stringify(dataPayload));

      // Execute the mutation (which is now definitely PUT)
      await updateProfile(fd).unwrap();
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Clear local file states
      setLogoPreview(null);
      setBannerPreview(null);
      setLogoFile(null);
      setBannerFile(null);
    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error(error?.data?.detail || error?.data?.message || "Failed to update profile");
    }
  };

  const overviewCount = watch("overview")?.length || 0;
  const missionCount = watch("mission")?.length || 0;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0D2C]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  // --- View Mode ---
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-[#0B0D2C] text-white font-sans">
        {/* Banner Section */}
        <div className="relative h-[440px] w-full">
          <img
            src={fixCloudinaryUrl(clubData.cover_photo) || "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&h=440&fit=crop"}
            alt="Club Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute top-8 left-10 right-10 flex justify-between items-center px-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0E1E]/90 backdrop-blur-md rounded-xl text-sm font-black border border-white/10">
              <ArrowLeft size={18} /> Back to Directory
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#04B5A3] text-white rounded-xl text-sm font-black hover:bg-[#03a191] transition-all shadow-lg"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          </div>

          {/* Floated Profile Card */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-6xl px-8">
            <Card className="flex flex-col md:flex-row items-center gap-10 p-8 border-[#1e2650] shadow-2xl bg-[#0B0E1E]">
              <div className="relative shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#1e2650] bg-[#0B0D2C] shadow-xl">
                  <img
                    src={fixCloudinaryUrl(clubData.club_academy_logo) || "/placeholder_logo.png"}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-2 right-2 bg-[#04B5A3] p-1.5 rounded-full border-2 border-[#0B0E1E]">
                  <Shield size={18} className="text-white" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-[2px]">
                    <Award size={14} /> Professional Academy
                  </div>
                </div>
                <h1 className="text-4xl font-black">{clubData.organization_name || "Club Name"}</h1>
                <p className="text-gray-400 text-sm font-medium">{clubData.tagline || "Tagline goes here"}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#a855f7]" /> {clubData.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={16} className="text-[#a855f7]" /> Est. {clubData.year_established}</span>
                  <span className="flex items-center gap-1.5"><Users size={16} className="text-[#a855f7]" /> {clubData.total_players} Players</span>
                </div>
              </div>

            </Card>
          </div>
        </div>

        {/* Content Section */}
        <div className=" mx-auto px-8 pt-40 pb-20 space-y-16">

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2 h-full">
              <section className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                  <h2 className="text-2xl font-black tracking-tight">
                    <span className="text-white">About the </span>
                    <span className="text-[#a855f7]">Academy</span>
                  </h2>
                </div>
                <Card className="p-12 space-y-12 bg-[#0B0E1E] border-white/5 shadow-2xl flex-1 flex flex-col justify-center">
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-xl tracking-wide">Overview</h3>
                    <p className="text-[#94a3b8] text-[15px] leading-[1.8] font-medium max-w-4xl">
                      {clubData.overview || "FC Barcelona Youth Academy, also known as La Masia, is one of the most prestigious youth development programs in world football..."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-xl tracking-wide">Our Mission</h3>
                    <p className="text-[#94a3b8] text-[15px] leading-[1.8] font-medium max-w-4xl">
                      {clubData.mission || "Our mission is to identify, develop, and nurture young football talent while instilling..."}
                    </p>
                  </div>
                </Card>
              </section>
            </div>

            <div className="flex flex-col gap-8 h-full pt-[60px]">
              {/* Separate Cards for Age Groups and Facilities */}
              <Card className="p-8 bg-[#0B0E1E] border-white/5 shadow-xl">
                <h3 className="text-white font-bold text-base mb-6 tracking-wide">Age Groups</h3>
                <div className="flex flex-wrap gap-2.5">
                  {(clubData.age_groups || ["U-10", "U-12", "U-14", "U-16", "U-18", "U-21"]).map((ag: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-[#0F1229] border border-white/5 rounded-xl text-[11px] font-black text-[#04B5A3] uppercase tracking-widest hover:border-[#04B5A3]/30 transition-all">
                      {ag}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-8 bg-[#0B0E1E] border-white/5 shadow-xl flex-1">
                <h3 className="text-white font-bold text-base mb-6 tracking-wide">Facilities</h3>
                <div className="space-y-4">
                  {(clubData.facilities || [
                    "State-of-the-art training center",
                    "Multiple full-size pitches",
                    "Indoor training facilities",
                    "Medical and rehabilitation center",
                    "Educational facilities",
                    "Accommodation for academy players"
                  ]).map((fac: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <Award size={18} className="text-[#04B5A3] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <p className="text-[#94a3b8] text-[13px] font-medium leading-[1.6] group-hover:text-white transition-colors">{fac}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <section>
            <GradientTitle first="Recent" second="Achievements" />
            <div className="grid md:grid-cols-3 gap-6">
              {(clubData.recent_achievements || []).map((ach: any, idx: number) => (
                <Card key={idx} className="group hover:border-cyan-400/50 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy size={18} className="text-[#facc15]" />
                    <span className="text-cyan-400 font-black text-sm">{ach.year}</span>
                  </div>
                  <h4 className="text-white font-black text-lg mb-2 leading-tight uppercase tracking-tight">{ach.title}</h4>
                  <p className="text-gray-500 text-[11px] font-bold leading-relaxed">
                    Champions of Europe's premier youth competition.
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <GradientTitle first="Featured" second="Players" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(clubData.featured_players || []).map((player: any, idx: number) => (
                <Card key={idx} className="flex flex-col items-center text-center p-8 group hover:border-[#a855f7]/50 transition-all border-[#1e2650]">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-[#1e2650] group-hover:border-[#a855f7] bg-[#0B0D2C]">
                    <img
                      src={fixCloudinaryUrl(player.player_image || player.image) || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=400&fit=crop"}
                      alt={player["player-name"]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-white font-black text-base mb-1">{player["player-name"]}</h4>
                  <p className="text-cyan-400 text-[10px] font-black uppercase mb-2 tracking-widest">{player.position}</p>
                  <p className="text-gray-500 text-[10px] font-bold">{player.age} years • {player.country}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-8">
            <Card className="p-10 space-y-8">
              <h3 className="text-white font-black text-2xl">Get in Touch</h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
                <div className="flex items-start gap-4">
                  <Mail size={18} className="text-cyan-400 mt-1" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[2px]">Email</p>
                    <p className="text-sm text-white font-bold leading-snug">{clubData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={18} className="text-cyan-400 mt-1" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[2px]">Phone</p>
                    <p className="text-sm text-white font-bold leading-snug">{clubData.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Globe size={18} className="text-cyan-400 mt-1" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[2px]">Website</p>
                    <p className="text-sm text-cyan-400 font-black underline cursor-pointer">Visit Official Website</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={18} className="text-cyan-400 mt-1" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[2px]">Address</p>
                    <p className="text-sm text-white font-medium leading-relaxed break-words">{clubData.address}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-10 space-y-8 bg-[#111530]">
              <h3 className="text-white font-black text-2xl">Follow Us</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Facebook size={18} />, label: "Facebook", href: clubData.social_media?.facebook },
                  { icon: <Instagram size={18} />, label: "Instagram", href: clubData.social_media?.instagram },
                  { icon: <Twitter size={18} />, label: "Twitter", href: clubData.social_media?.twitter },
                  { icon: <Youtube size={18} />, label: "YouTube", href: clubData.social_media?.youtube }
                ].map((social, idx) => (
                  <a key={idx} href={social.href || "#"} className="flex items-center gap-3 p-4 bg-[#0B0D2C] border border-[#1e2650] rounded-2xl text-gray-500 hover:text-cyan-400 hover:border-cyan-400/50 transition-all font-black text-xs uppercase tracking-wide">
                    {social.icon} {social.label}
                  </a>
                ))}
              </div>
            </Card>
          </section>


        </div>
      </div>
    );
  }

  // --- Edit Mode ---
  return (
    <div className="min-h-screen bg-[#0B0D2C] text-white font-sans p-6">
      <form onSubmit={handleSubmit(onSave)} className="max-w-7xl mx-auto space-y-10 pb-32">

        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div onClick={() => setIsEditing(false)} className="cursor-pointer bg-[#111530] p-3 rounded-xl border border-[#1e2650]">
              <ArrowLeft size={18} />
            </div>
            <h1 className="text-2xl font-black">Academy Configuration</h1>
          </div>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-10 py-3.5 bg-[#04B5A3] text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#03a191] transition-all shadow-xl disabled:opacity-50"
          >
            <Save size={18} /> {isUpdating ? "Processing..." : "Commit Changes"}
          </button>
        </div>

        {/* Banner Upload */}
        <div className="relative h-[400px] rounded-[40px] overflow-hidden border-2 border-dashed border-[#1e2650] bg-[#111530] flex flex-col items-center justify-center group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
          {(bannerPreview || clubData.cover_photo) && (
            <img
              src={bannerPreview || fixCloudinaryUrl(clubData.cover_photo)}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="bg-[#04B5A3]/10 p-5 rounded-2xl border border-[#04B5A3]/30">
              <Upload size={32} className="text-[#04B5A3]" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-sm">Modify Header Portrait</p>
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBannerFile(file);
                  setBannerPreview(URL.createObjectURL(file));
                }
              }}
              accept="image/*"
            />
          </div>
        </div>

        <div className="relative -mt-32 px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Identity Card */}
            <Card className="flex flex-col md:flex-row gap-10 p-10 bg-[#111530]">
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-36 h-36 rounded-3xl bg-[#0B0D2C] border-4 border-[#1e2650] overflow-hidden flex items-center justify-center">
                  {(logoPreview || clubData.club_academy_logo) ? (
                    <img
                      src={logoPreview || fixCloudinaryUrl(clubData.club_academy_logo)}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users size={50} className="text-gray-800" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-5 py-2.5 bg-[#04B5A3]/10 text-[#04B5A3] border border-[#04B5A3]/30 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-[#04B5A3] hover:text-white transition-all"
                >
                  Change Logo
                </button>
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                  accept="image/*"
                />
              </div>

              <div className="flex-1 grid md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1.5">
                  <InputLabel>Club Identity Name</InputLabel>
                  <DarkInput {...register("organization_name")} placeholder="FC Barcelona Youth" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <InputLabel>Marketing Tagline</InputLabel>
                  <DarkInput {...register("tagline")} placeholder="International Football Academy" />
                </div>
                <div className="space-y-1.5">
                  <InputLabel>Full Location</InputLabel>
                  <DarkInput {...register("location")} placeholder="Barcelona, Spain" />
                </div>
                <div className="space-y-1.5">
                  <InputLabel>Established Year</InputLabel>
                  <DarkInput {...register("year_established")} placeholder="1979" type="number" />
                </div>
                <div className="space-y-1.5">
                  <InputLabel>Total Registered Players</InputLabel>
                  <DarkInput {...register("total_players")} placeholder="156" type="number" />
                </div>
                <div className="space-y-1.5">
                  <InputLabel>Age Tiers (e.g. U-12, U-14)</InputLabel>
                  <Controller
                    name="age_groups"
                    control={control}
                    render={({ field }) => (
                      <DarkInput
                        {...field}
                        value={field.value?.join(", ")}
                        onChange={(e: any) => field.onChange(e.target.value.split(",").map((s: string) => s.trim()))}
                        placeholder="U-10, U-12, U-14"
                      />
                    )}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-10 space-y-10">
              <h3 className="text-white font-black text-xl border-b border-[#1e2650] pb-6 uppercase tracking-[1px]">Academy Philosophy</h3>
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <InputLabel>Overview</InputLabel>
                    <span className="text-[10px] text-gray-700 font-black">{overviewCount} characters</span>
                  </div>
                  <DarkTextarea {...register("overview")} rows={8} placeholder="Tell us about your history..." />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <InputLabel>Core Mission</InputLabel>
                    <span className="text-[10px] text-gray-700 font-black">{missionCount} characters</span>
                  </div>
                  <DarkTextarea {...register("mission")} rows={6} placeholder="What is your ultimate goal?" />
                </div>
              </div>
            </Card>

            <Card className="p-10 space-y-10">
              <div className="flex justify-between items-center border-b border-[#1e2650] pb-6">
                <h3 className="text-white font-black text-xl uppercase tracking-[1px]">Facilities</h3>
                <button
                  type="button"
                  onClick={() => appendFacility({ value: "" })}
                  className="text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus size={14} /> Add Asset
                </button>
              </div>
              <div className="grid gap-4">
                {facilityFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4">
                    <DarkInput {...register(`facilities.${index}.value`)} placeholder="e.g. 6 natural turf training fields" />
                    <button
                      type="button"
                      onClick={() => removeFacility(index)}
                      className="p-3.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <aside className="space-y-10 lg:pt-32">
            <Card className="p-8 space-y-8">
              <h3 className="text-white font-black text-lg border-b border-[#1e2650] pb-4">Communication</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <InputLabel>Public Email</InputLabel>
                  <DarkInput {...register("email")} placeholder="academy@club.com" />
                </div>
                <div className="space-y-2">
                  <InputLabel>Phone Contact</InputLabel>
                  <DarkInput {...register("phone_number")} placeholder="+34 900 000 000" />
                </div>
                <div className="space-y-2">
                  <InputLabel>Official Website</InputLabel>
                  <DarkInput {...register("website")} placeholder="www.academy.com" />
                </div>
                <div className="space-y-2">
                  <InputLabel>Full Address</InputLabel>
                  <DarkTextarea {...register("address")} rows={4} placeholder="Physical location details..." />
                </div>
              </div>
            </Card>

            <Card className="p-8 space-y-8">
              <h3 className="text-white font-black text-lg border-b border-[#1e2650] pb-4">Social Profiles</h3>
              <div className="space-y-6">
                {[
                  { label: "Facebook", name: "facebook", icon: <Facebook size={16} /> },
                  { label: "Instagram", name: "instagram", icon: <Instagram size={16} /> },
                  { label: "Twitter", name: "twitter", icon: <Twitter size={16} /> },
                  { label: "YouTube", name: "youtube", icon: <Youtube size={16} /> }
                ].map((social, idx) => (
                  <div key={idx} className="space-y-2">
                    <InputLabel>{social.label}</InputLabel>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700">{social.icon}</div>
                      <DarkInput {...register(social.name as any)} className="pl-12" placeholder={`${social.label} URL`} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>

        <div className="px-8 space-y-10">
          <Card className="p-10 space-y-10">
            <div className="flex justify-between items-center border-b border-[#1e2650] pb-6">
              <h3 className="text-white font-black text-xl uppercase tracking-[1px]">Recent Achievements</h3>
              <button
                type="button"
                onClick={() => appendAchievement({ title: "", year: "" })}
                className="text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={16} /> Add Achievement
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievementFields.map((field, index) => (
                <div key={field.id} className="p-6 bg-[#0B0D2C] border border-[#1e2650] rounded-2xl relative space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-1">
                      <InputLabel>Achievement Name</InputLabel>
                      <DarkInput {...register(`recent_achievements.${index}.title`)} />
                    </div>
                    <div className="space-y-1">
                      <InputLabel>Year</InputLabel>
                      <DarkInput {...register(`recent_achievements.${index}.year`)} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase hover:underline"
                  >
                    <Trash2 size={12} /> Remove Entry
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-10 space-y-10">
            <div className="flex justify-between items-center border-b border-[#1e2650] pb-6">
              <h3 className="text-white font-black text-xl uppercase tracking-[1px]">Featured Players</h3>
              <button
                type="button"
                onClick={() => appendPlayer({ "player-name": "", age: "", position: "", country: "" })}
                className="text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={16} /> Add Showcase
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {playerFields.map((field, index) => {
                const playerWatch = watch(`Featured_players.${index}`);
                return (
                  <div key={field.id} className="p-8 bg-[#0B0D2C] border border-[#1e2650] rounded-3xl relative space-y-8">
                    <div className="flex flex-col md:flex-row gap-10">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-[#111530] border-4 border-[#1e2650] overflow-hidden flex items-center justify-center">
                          {playerWatch?._preview || fixCloudinaryUrl(playerWatch?.player_image || playerWatch?.image) ? (
                            <img src={playerWatch._preview || fixCloudinaryUrl(playerWatch?.player_image || playerWatch.image)} alt="P" className="w-full h-full object-cover" />
                          ) : (
                            <Camera size={32} className="text-gray-800" />
                          )}
                        </div>
                        <button
                          type="button"
                          className="text-[10px] text-cyan-400 font-black uppercase tracking-widest"
                          onClick={() => {
                            const input = document.getElementById(`player_file_${index}`) as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          Upload Photo
                        </button>
                        <input
                          id={`player_file_${index}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setValue(`Featured_players.${index}._file`, file);
                              setValue(`Featured_players.${index}._preview`, URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-1">
                          <InputLabel>Player Name</InputLabel>
                          <DarkInput {...register(`Featured_players.${index}.player-name`)} />
                        </div>
                        <div className="space-y-1">
                          <InputLabel>Age/Category</InputLabel>
                          <DarkInput {...register(`Featured_players.${index}.age`)} />
                        </div>
                        <div className="space-y-1">
                          <InputLabel>Role/Pos</InputLabel>
                          <DarkInput {...register(`Featured_players.${index}.position`)} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <InputLabel>Origin National</InputLabel>
                          <DarkInput {...register(`Featured_players.${index}.country`)} />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removePlayer(index)}
                      className="text-red-500 text-[10px] font-black uppercase tracking-widest"
                    >
                      Delete Profile
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </form>
    </div>
  );
}
