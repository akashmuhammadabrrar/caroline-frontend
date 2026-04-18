"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { 
  Camera, Upload, Plus, X, Save, RotateCcw
} from "lucide-react";
import {
  useUpdateProfileMutation,
  useAddPlayingHistoryMutation,
  useUpdatePlayingHistoryMutation,
  useDeletePlayingHistoryMutation,
  useAddAchievementMutation,
  useUpdateAchievementMutation,
  useDeleteAchievementMutation,
  useAddHighlightVideoMutation,
  useUpdateHighlightVideoMutation,
  useDeleteHighlightVideoMutation,
} from "../../redux/features/player/playerProfileAndEdit/profileAndEditApi";
import { useAppDispatch } from "../../redux/hooks";
import { updateUserAvatar } from "../../redux/features/auth/authSlice";

interface Props {
  profile: any;
  onCancel: () => void;
}

const InputField = React.forwardRef<HTMLInputElement, any>(({ label, ...props }, ref) => (
  <div className="space-y-1">
    <label className="text-xs text-[#8B97B5] font-medium ml-1 block">{label}</label>
    <input 
      ref={ref}
      {...props} 
      className="w-full bg-[#0A0D1F] border border-[#1E2548] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-all placeholder:text-[#3A4270]" 
    />
  </div>
));
InputField.displayName = "InputField";

const SelectField = React.forwardRef<HTMLSelectElement, any>(({ label, children, ...props }, ref) => (
  <div className="space-y-1">
    <label className="text-xs text-[#8B97B5] font-medium ml-1 block">{label}</label>
    <select 
      ref={ref}
      {...props} 
      className="w-full bg-[#0A0D1F] border border-[#1E2548] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-all"
    >
      {children}
    </select>
  </div>
));
SelectField.displayName = "SelectField";

const Card = ({ title, badge, children }: { title: string, badge?: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-[#121730] rounded-2xl p-6 border border-[#1E2548] shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-white font-medium text-lg">{title}</h3>
      {badge && <div>{badge}</div>}
    </div>
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

const SkillRange = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-[#8B97B5]">{label}</span>
      <span className="text-sm font-bold text-[#00E5FF]">{value}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-[#1E2548] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#00E5FF] [&::-webkit-slider-thumb]:rounded-full"
      style={{
        background: `linear-gradient(to right, #00E5FF 0%, #00E5FF ${value}%, #1E2548 ${value}%, #1E2548 100%)`
      }}
    />
  </div>
);

export default function ProfileEdit({ profile, onCancel }: Props) {
  const dispatch = useAppDispatch();
  const [updateProfile] = useUpdateProfileMutation();
  const [addPlayingHistory] = useAddPlayingHistoryMutation();
  const [updatePlayingHistory] = useUpdatePlayingHistoryMutation();
  const [deletePlayingHistory] = useDeletePlayingHistoryMutation();
  const [addAchievement] = useAddAchievementMutation();
  const [updateAchievement] = useUpdateAchievementMutation();
  const [deleteAchievement] = useDeleteAchievementMutation();
  const [addHighlightVideo] = useAddHighlightVideoMutation();
  const [updateHighlightVideo] = useUpdateHighlightVideoMutation();
  const [deleteHighlightVideo] = useDeleteHighlightVideoMutation();
  
  const [isSaving, setIsSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string>(profile?.cover_image || "");
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.profile_image || "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, watch, setValue, control } = useForm<any>();

  const { fields: histFields, append: appendHist, remove: removeHist } = useFieldArray({ control, name: "playing_history" });
  const { fields: achFields, append: appendAch, remove: removeAch } = useFieldArray({ control, name: "achievements" });
  const { fields: vidFields, append: appendVid, remove: removeVid } = useFieldArray({ control, name: "highlight_videos" });

  const skills = {
    pace: watch("skill_pace") ?? 50,
    shooting: watch("skill_shooting") ?? 50,
    dribbling: watch("skill_dribbling") ?? 50,
    passing: watch("skill_passing") ?? 50,
    physical: watch("skill_physical") ?? 50,
    technical: watch("skill_technical") ?? 50,
  };

  useEffect(() => {
    if (!profile) return;
    reset({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      designation: profile.designation || "",
      city: profile.city || "",
      country: profile.country || "",
      gender: profile.gender || "MALE",
      about: profile.about || "",
      date_of_birth: profile.date_of_birth || "",
      height: profile.height || "",
      weight: profile.weight || "",
      nationality: profile.nationality || "",
      preferred_foot: profile.preferred_foot || "LEFT",
      jersey_number: profile.jersey_number || "",
      phone: profile.phone || "",
      email: profile.email || "",
      instagram: profile.instagram || "",
      twitter: profile.twitter || "",
      facebook: profile.facebook || "",
      youtube: profile.youtube || "",
      availability_status: profile.availability_status || "AVAILABLE",
      preferred_regions: profile.preferred_regions || profile.preferred_leagues || "",
      contract_status: profile.contract_status || "",
      available_from: profile.available_from || "",
      career_season: profile.career_stats?.season || "",
      career_matches: profile.career_stats?.matches || 0,
      career_goals: profile.career_stats?.goals || 0,
      career_assists: profile.career_stats?.assists || 0,
      career_minutes: profile.career_stats?.minutes || 0,
      skill_pace: profile.skills?.pace || 50,
      skill_shooting: profile.skills?.shooting || 50,
      skill_dribbling: profile.skills?.dribbling || 50,
      skill_passing: profile.skills?.passing || 50,
      skill_physical: profile.skills?.physical || 50,
      skill_technical: profile.skills?.technical || 50,
      playing_history: profile.playing_history?.map((h: any) => ({
        id: h.id,
        club_name: h.club_name || "",
        position: h.position || "",
        start_year: String(h.start_year || ""),
        end_year: h.end_year ? String(h.end_year) : "",
        achievements: h.achievements || "",
      })) || [],
      achievements: profile.achievements?.map((a: any) => ({
        id: a.id,
        title: a.title || "",
        description: a.description || "",
        date_achieved: a.date_achieved || "",
      })) || [],
      highlight_videos: profile.highlight_videos?.map((v: any) => ({
        id: v.id,
        title: v.title || "",
        video_url: v.video_url || "",
        description: v.description || "",
      })) || [],
    });
  }, [profile, reset]);

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    const formData = new FormData();
    if (coverFile) formData.append("cover_image", coverFile);
    if (avatarFile) formData.append("profile_image", avatarFile);

    const fields = [
      "first_name", "last_name", "designation", "city", "country", "gender", "about", "height", "weight", "nationality",
      "preferred_foot", "date_of_birth", "jersey_number", "phone", "email", "instagram", "twitter", "facebook",
      "youtube", "availability_status", "preferred_regions", "contract_status", "available_from",
      "career_season", "career_matches", "career_goals", "career_assists", "career_minutes"
    ];
    fields.forEach((k) => {
      const v = data[k];
      if (v !== undefined && v !== null && v !== "") formData.append(k, String(v));
    });

    formData.append("skill_pace", String(data.skill_pace || 50));
    formData.append("skill_shooting", String(data.skill_shooting || 50));
    formData.append("skill_dribbling", String(data.skill_dribbling || 50));
    formData.append("skill_passing", String(data.skill_passing || 50));
    formData.append("skill_physical", String(data.skill_physical || 50));
    formData.append("skill_technical", String(data.skill_technical || 50));

    try {
      let updatedProfileRes: any = null;
      if (Array.from(formData.keys()).length > 0) {
        updatedProfileRes = await updateProfile(formData).unwrap();
        if (updatedProfileRes && updatedProfileRes.profile_image) {
          dispatch(updateUserAvatar(updatedProfileRes.profile_image));
        }
      }
      
      const promises = [];

      // History
      const prevHistIds = new Set<number>((profile.playing_history || []).map((i: any) => i.id).filter(Boolean));
      const currHistIds = new Set<number>(data.playing_history.filter((i:any) => i.id).map((i:any) => i.id as number));
      for (const id of Array.from(prevHistIds)) if (!currHistIds.has(id)) promises.push(deletePlayingHistory(id));
      for (const item of data.playing_history) {
        const { id, ...rest } = item;
        if (id) promises.push(updatePlayingHistory({ id, data: rest }));
        else promises.push(addPlayingHistory(rest));
      }

      // Achievements
      const prevAchIds = new Set<number>((profile.achievements || []).map((i: any) => i.id).filter(Boolean));
      const currAchIds = new Set<number>(data.achievements.filter((i:any) => i.id).map((i:any) => i.id as number));
      for (const id of Array.from(prevAchIds)) if (!currAchIds.has(id)) promises.push(deleteAchievement(id));
      for (const item of data.achievements) {
        const { id, ...rest } = item;
        if (id) promises.push(updateAchievement({ id, data: rest }));
        else promises.push(addAchievement(rest));
      }

      // Videos
      const prevVidIds = new Set<number>((profile.highlight_videos || []).map((i: any) => i.id).filter(Boolean));
      const currVidIds = new Set<number>(data.highlight_videos.filter((i:any) => i.id).map((i:any) => i.id as number));
      for (const id of Array.from(prevVidIds)) if (!currVidIds.has(id)) promises.push(deleteHighlightVideo(id));
      for (const item of data.highlight_videos) {
        const { id, ...rest } = item;
        if (id) promises.push(updateHighlightVideo({ id, data: rest }));
        else promises.push(addHighlightVideo(rest));
      }

      await Promise.all(promises);
      toast.success("Profile updated successfully");
      onCancel();
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update profile data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto p-4 md:p-6 pb-24 font-sans text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Upload Headers */}
        <div className="bg-[#121730] rounded-2xl overflow-hidden shadow-2xl border border-[#1E2548]">
          <div 
            className="h-44 md:h-64 relative bg-[#0D122B] cursor-pointer group"
            onClick={() => coverInputRef.current?.click()}
          >
             {coverPreview ? (
                <div className="absolute inset-0 bg-cover bg-center transition-opacity" style={{ backgroundImage: `url(${coverPreview})` }} />
             ) : (
                <div className="absolute inset-0 bg-linear-to-r from-[#0D122B] to-[#1E2548]" />
             )}
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 bg-[#121730] px-4 py-3 rounded-xl text-white font-medium border border-[#1E2548] shadow-xl text-center">
                  <div className="flex items-center gap-2">
                    <Upload size={18} className="text-[#00E5FF]" /> Upload Cover Photo
                  </div>
                  <p className="text-[10px] text-[#8B97B5] mt-1 max-w-[200px]">
                    Upload a square image (1080 × 1080 px). Preferably a football-related photo (in match, training, or team kit).
                  </p>
                </div>
             </div>
             <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
             }} />
          </div>

          <div className="px-6 pb-8 md:px-10 -mt-20 flex items-end gap-6 relative z-10">
            <div 
              className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#121730] overflow-hidden bg-[#0A0D1F] flex items-center justify-center cursor-pointer group shrink-0 shadow-2xl"
              onClick={() => avatarInputRef.current?.click()}
            >
               {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
               ) : (
                  <span className="text-4xl font-black text-[#00E5FF]">{profile?.first_name?.charAt(0) || "U"}</span>
               )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                  <Camera className="text-[#00E5FF] mb-2" size={32} />
                  <p className="text-[9px] text-white leading-tight">
                    Upload a square image (1080 × 1080 px). Preferably a football-related photo (in match, training, or team kit).
                  </p>
                </div>
               <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
               }} />
            </div>
            
            <div className="pb-4 flex-1">
               <h2 className="text-2xl font-bold text-white tracking-tight">{profile?.first_name || "Guest"} {profile?.last_name || "Player"}</h2>
               <p className="text-[#8B97B5] text-sm mt-1">Upload a square image (1080 × 1080 px). Preferably a football-related photo (in match, training, or team kit).</p>
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN GRID FOR FORMS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          
          <div className="space-y-6">
            
            <Card title="Basic Information">
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="First Name *" {...register("first_name")} />
                <InputField label="Last Name *" {...register("last_name")} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <SelectField label="Position" {...register("designation")}>
                  <option value="">Select Position</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                </SelectField>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="City" {...register("city")} placeholder="e.g. Barcelona" />
                  <SelectField label="Country" {...register("country")}>
                    <option value="">Select Country</option>
                    {require("@/constants/countries").countries.map((c: any) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </SelectField>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SelectField label="Nationality" {...register("nationality")}>
                  <option value="">Select Nationality</option>
                  {require("@/constants/countries").countries.map((c: any) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </SelectField>
                <div className="space-y-1">
                  <label className="text-xs text-[#8B97B5] font-medium ml-1 block">Date of Birth</label>
                  <input 
                    type="date" 
                    {...register("date_of_birth")}
                    className="w-full bg-[#0A0D1F] border border-[#1E2548] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#8B97B5] font-medium ml-1 block">Age (Calculated)</label>
                  <div className="w-full bg-[#0A0D1F]/50 border border-[#1E2548] rounded-xl px-4 py-3 text-[#00E5FF] text-sm font-bold h-[46px] flex items-center">
                    {watch("date_of_birth") ? (() => {
                      const dob = new Date(watch("date_of_birth"));
                      const today = new Date();
                      let age = today.getFullYear() - dob.getFullYear();
                      const m = today.getMonth() - dob.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                      return age > 0 ? age : 0;
                    })() : "—"}
                  </div>
                </div>
                <SelectField label="Gender" {...register("gender")}>
                  <option value="MALE">Male (M)</option>
                  <option value="FEMALE">Female (F)</option>
                </SelectField>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <InputField label="Height (cm)" type="number" step="0.01" {...register("height")} />
                 <InputField label="Weight (kg)" type="number" step="0.01" {...register("weight")} />
                 <SelectField label="Preferred Foot" {...register("preferred_foot")}>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                    <option value="BOTH">Both</option>
                 </SelectField>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <SelectField label="Availability Status" {...register("availability_status")}>
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                  <option value="OPEN_TO_OFFERS">Open to Offers</option>
                </SelectField>
                <InputField label="Available From" type="date" {...register("available_from")} />
              </div>
              
              <div className="space-y-1 pt-2">
                <label className="text-xs text-[#8B97B5] font-medium ml-1 block">About Me</label>
                <textarea 
                  {...register("about")}
                  className="w-full bg-[#0A0D1F] border border-[#1E2548] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-all min-h-[120px] resize-y placeholder:text-[#3A4270]"
                  placeholder="Tell scouts and clubs about yourself..."
                />
              </div>
            </Card>

            <Card title="Career Statistics">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <InputField label="Season" {...register("career_season")} placeholder="2024/25" />
                <InputField label="Matches" type="number" {...register("career_matches")} />
                <InputField label="Goals" type="number" {...register("career_goals")} />
                <InputField label="Assists" type="number" {...register("career_assists")} />
                <InputField label="Minutes" type="number" {...register("career_minutes")} />
              </div>
            </Card>

            <Card title="Skills & Attributes">
              <div className="grid md:grid-cols-2 lg:grid-cols-1 md:gap-x-12 gap-y-2 pt-2">
                {(["pace", "shooting", "dribbling", "passing", "physical", "technical"] as const).map((sk) => (
                  <SkillRange 
                    key={sk} 
                    label={sk.charAt(0).toUpperCase() + sk.slice(1)} 
                    value={skills[sk]} 
                    onChange={(v) => setValue(`skill_${sk}` as any, v)} 
                  />
                ))}
              </div>
            </Card>

            <Card 
              title="Playing History" 
              badge={<span className="border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-medium px-3 py-1 rounded-full">{histFields.length} Entries</span>}
            >
              <div className="space-y-4">
                {histFields.map((field, i) => (
                  <div key={field.id} className="bg-[#0A0D1F] border border-[#1E2548] rounded-xl p-5 relative group">
                    <button type="button" onClick={() => removeHist(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 bg-red-400/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                    <div className="text-[#00E5FF] text-xs font-medium uppercase tracking-widest mb-4">Entry {i + 1}</div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <InputField label="Club / Academy" {...register(`playing_history.${i}.club_name` as const)} />
                      <InputField label="Position" {...register(`playing_history.${i}.position` as const)} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <InputField label="Start Year" type="number" {...register(`playing_history.${i}.start_year` as const)} />
                      <InputField label="End Year" type="number" {...register(`playing_history.${i}.end_year` as const)} placeholder="Present" />
                    </div>
                    <InputField label="Achievements" {...register(`playing_history.${i}.achievements` as const)} placeholder="e.g. FA Youth Cup Runner-up 2024" />
                  </div>
                ))}
                
                <button type="button" onClick={() => appendHist({ club_name: "", position: "", start_year: "", end_year: "", achievements: "" })} className="w-full py-4 border-2 border-dashed border-[#1E2548] rounded-xl text-[#00E5FF] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#00E5FF]/5 hover:border-[#00E5FF]/50 transition-all">
                  <Plus size={18} /> Add History Entry
                </button>
              </div>
            </Card>
            
            <Card 
              title="Highlight Videos" 
              badge={<span className="border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-medium px-3 py-1 rounded-full">{vidFields.length} Videos</span>}
            >
              <div className="space-y-4">
                {vidFields.map((field, i) => (
                  <div key={field.id} className="bg-[#0A0D1F] border border-[#1E2548] rounded-xl p-5 relative group">
                    <button type="button" onClick={() => removeVid(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 bg-red-400/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                    <div className="text-[#00E5FF] text-xs font-medium uppercase tracking-widest mb-4">Video {i + 1}</div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <InputField label="Title" {...register(`highlight_videos.${i}.title` as const)} placeholder="Season Highlights 2024" />
                        <div className="mt-4">
                          <InputField label="Video URL" {...register(`highlight_videos.${i}.video_url` as const)} placeholder="https://youtube.com/..." />
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center border border-[#1E2548] rounded-xl bg-[#0A0D1F] overflow-hidden">
                        {watch(`highlight_videos.${i}.video_url`) ? (
                          (() => {
                            const url = watch(`highlight_videos.${i}.video_url`);
                            const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                            const match = url?.match(regExp);
                            const thumbUrl = (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
                            
                            return thumbUrl ? (
                              <img src={thumbUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-[10px] text-[#8B97B5] p-4 text-center">Invalid YouTube URL or no thumbnail found</div>
                            );
                          })()
                        ) : (
                          <div className="text-[10px] text-[#8B97B5] p-4 text-center">YouTube thumbnail preview will appear here</div>
                        )}
                      </div>
                    </div>
                    <InputField label="Description" {...register(`highlight_videos.${i}.description` as const)} placeholder="Short description of the video..." />
                  </div>
                ))}
                
                <button type="button" onClick={() => appendVid({ title: "", video_url: "", description: "" })} className="w-full py-4 border-2 border-dashed border-[#1E2548] rounded-xl text-[#00E5FF] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#00E5FF]/5 hover:border-[#00E5FF]/50 transition-all">
                  <Plus size={18} /> Add Highlight Video
                </button>
              </div>
            </Card>

          </div>

          <div className="space-y-6">
            
            <Card title="Contact Information">
              <InputField label="Email Address" type="email" {...register("email")} />
              <div className="mt-4" />
              <InputField label="Phone Number" {...register("phone")} />
            </Card>

            <Card title="Social Media">
              <div className="space-y-4">
                <div className="space-y-1">
                  <InputField label="Instagram URL" {...register("instagram")} placeholder="https://instagram.com/handle" />
                  <p className="text-[10px] text-[#8B97B5] ml-1">Insert full URL. It will be displayed as a handle.</p>
                </div>
                <div className="space-y-1">
                  <InputField label="Twitter / X URL" {...register("twitter")} placeholder="https://twitter.com/handle" />
                  <p className="text-[10px] text-[#8B97B5] ml-1">Insert full URL. It will be displayed as a handle.</p>
                </div>
                <div className="space-y-1">
                  <InputField label="Facebook URL" {...register("facebook")} placeholder="https://facebook.com/handle" />
                  <p className="text-[10px] text-[#8B97B5] ml-1">Insert full URL. It will be displayed as a handle.</p>
                </div>
                <div className="space-y-1">
                  <InputField label="YouTube Channel URL" {...register("youtube")} placeholder="https://youtube.com/@handle" />
                  <p className="text-[10px] text-[#8B97B5] ml-1">Insert full URL. It will be displayed as a handle.</p>
                </div>
              </div>
            </Card>

            <Card 
              title="Achievements"
              badge={<span className="border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-medium px-3 py-1 rounded-full">{achFields.length} Items</span>}
            >
              <div className="space-y-4">
                {achFields.map((field, i) => (
                  <div key={field.id} className="bg-[#0A0D1F] border border-[#1E2548] rounded-xl p-4 relative group">
                    <button type="button" onClick={() => removeAch(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 bg-red-400/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                    
                    <div className="space-y-3 pr-8">
                      <InputField label="Title" {...register(`achievements.${i}.title` as const)} />
                      <InputField label="Date Achieved" type="date" {...register(`achievements.${i}.date_achieved` as const)} />
                      <InputField label="Description" {...register(`achievements.${i}.description` as const)} />
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={() => appendAch({ title: "", description: "", date_achieved: "" })} className="w-full py-3 border border-dashed border-[#1E2548] rounded-xl text-[#00E5FF] font-medium text-xs flex items-center justify-center gap-2 hover:bg-[#00E5FF]/5 hover:border-[#00E5FF]/50 transition-all">
                  <Plus size={16} /> Add Achievement
                </button>
              </div>
            </Card>

            <Card title="Preferences">
              <div className="space-y-4">
                <InputField label="Preferred Regions / Countries" {...register("preferred_regions")} placeholder="Europe, Asia, Italy, Spain..." />
                <InputField label="Contract Status" {...register("contract_status")} placeholder="Open to Offers..." />
              </div>
            </Card>

          </div>
        </div>

        {/* Floating Save Action Bar */}
        <div className="sticky bottom-6 z-50 mt-12 w-full max-w-[800px] mx-auto bg-[#121730]/90 backdrop-blur-xl border border-[#00E5FF]/30 rounded-2xl p-4 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.5)] flex justify-between items-center">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border border-[#1E2548] text-[#8B97B5] font-medium text-sm hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} /> Cancel Edits
          </button>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-8 py-3 rounded-lg bg-[#00E5FF] text-[#121730] font-bold text-sm flex items-center gap-2 hover:bg-[#00d0e6] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><span className="animate-spin rounded-full h-4 w-4 border-2 border-[#121730]/20 border-t-[#121730]"></span> Saving...</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}