"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetEventDetailsQuery } from "@/redux/features/admin/adminEventApi";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Mail, 
  Phone, 
  Globe, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from "lucide-react";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const { data: response, isLoading, error } = useGetEventDetailsQuery(eventId, {
    skip: !eventId,
  });

  const event = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-[#00E5FF]" size={48} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 bg-transparent space-y-4">
        <AlertCircle size={48} className="text-red-500/50" />
        <p>Event details could not be loaded or do not exist.</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-transparent pb-20">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
           <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 border border-[#162d45] text-slate-400 hover:text-white transition-all transform hover:-translate-x-1"
           >
             <ChevronLeft size={20} />
           </button>
           <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
             {event.event_name}
             {event.is_featured && (
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Featured
                </span>
             )}
             <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${
                event.status === 'ACTIVE' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
             }`}>
               {event.status}
             </span>
           </h1>
        </div>
        <p className="text-slate-400 ml-12 max-w-3xl leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content (Left Col) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Banner Image */}
          {event.event_media && (
            <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-[#162d45] relative shadow-2xl group">
              <div className="absolute inset-0 bg-linear-to-t from-[#0D1B2A] to-transparent z-10 opacity-60" />
              {/* Using img tag to support external generic URLs as requested */}
              <img 
                src={event.event_media} 
                alt={event.event_name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 z-20 flex gap-3">
                <div className="backdrop-blur-md bg-black/40 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-white font-medium">
                  <Calendar size={16} className="text-[#00E5FF]" />
                  {event.date}
                </div>
                <div className="backdrop-blur-md bg-black/40 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-white font-medium">
                  <MapPin size={16} className="text-red-400" />
                  {event.city}, {event.country}
                </div>
              </div>
            </div>
          )}

          {/* Schedules Section */}
          <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-8 backdrop-blur-sm shadow-xl">
             <div className="flex items-center gap-3 mb-6">
               <Activity size={24} className="text-[#00E5FF]" />
               <h2 className="text-2xl font-bold text-white">Event Schedule</h2>
             </div>
             
             {event.schedules && event.schedules.length > 0 ? (
               <div className="space-y-4">
                 {[...event.schedules].sort((a: any, b: any) => a.order - b.order).map((schedule: any, idx: number) => (
                   <div key={schedule.id || idx} className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-3 md:w-48 shrink-0">
                       <Clock size={18} className="text-purple-400" />
                       <span className="text-slate-300 font-mono text-sm bg-black/20 px-3 py-1 rounded-lg">
                         {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                       </span>
                     </div>
                     <div>
                       <h4 className="text-white font-bold text-lg">{schedule.activity_title}</h4>
                       <p className="text-slate-400 text-sm mt-1">{schedule.description}</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-slate-500 italic">No schedules defined for this event.</p>
             )}
          </div>

          {/* Requirements Section */}
          <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-8 backdrop-blur-sm shadow-xl">
             <div className="flex items-center gap-3 mb-6">
               <ShieldCheck size={24} className="text-emerald-400" />
               <h2 className="text-2xl font-bold text-white">Requirements</h2>
             </div>

             {event.requirements && event.requirements.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[...event.requirements].sort((a: any, b: any) => a.order - b.order).map((req: any, idx: number) => (
                   <div key={req.id || idx} className="p-5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors relative overflow-hidden">
                     {req.is_mandatory && (
                       <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
                         Required
                       </div>
                     )}
                     <h4 className="text-white font-bold mb-2 pr-12">{req.requirement_title}</h4>
                     <p className="text-slate-400 text-sm line-clamp-2">{req.requirement_description}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-slate-500 italic">No specific requirements listed.</p>
             )}
          </div>

          {/* Registered Participants Section */}
          <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-8 backdrop-blur-sm shadow-xl">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <Users size={24} className="text-[#00E5FF]" />
                 <h2 className="text-2xl font-bold text-white">Registered Players</h2>
               </div>
               <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-300">
                 {event.registered_players?.length || 0} / {event.maximum_capacity} Enrolled
               </div>
             </div>

             {event.registered_players && event.registered_players.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {event.registered_players.map((player: any, idx: number) => {
                   const name = player.first_name ? `${player.first_name} ${player.last_name || ""}` : (player.user_details?.first_name ? `${player.user_details.first_name} ${player.user_details.last_name || ""}` : "Unknown Player");
                   const role = player.position || player.user_details?.position || "Player";
                   const avatar = player.user_details?.profile_photo || null;

                   return (
                     <div key={player.id || idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all group">
                       <div className="w-12 h-12 rounded-full border-2 border-[#00E5FF]/20 overflow-hidden bg-[#0B0E1E] shrink-0">
                         {avatar ? (
                           <img src={avatar} alt={name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-[#00E5FF] font-bold text-lg">
                             {name[0]}
                           </div>
                         )}
                       </div>
                       <div className="min-w-0 flex-1">
                         <h4 className="text-white font-bold truncate">{name}</h4>
                         <p className="text-slate-500 text-xs mt-0.5">{role}</p>
                       </div>
                       <div className="text-right">
                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                           player.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                           {player.status || 'PENDING'}
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="py-12 text-center bg-white/2 rounded-2xl border border-dashed border-white/10">
                 <Users size={32} className="mx-auto text-slate-700 mb-3" />
                 <p className="text-slate-500">No players registered yet.</p>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Info (Right Col) */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center text-center group hover:bg-[#0D1B2A]/80 transition-colors">
               <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                 <Users size={24} />
               </div>
               <p className="text-2xl font-bold text-white">{event.spots_available?.split('/')[0] || 0}</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registrations</p>
               <p className="text-xs text-slate-400 mt-1">of {event.maximum_capacity} spots</p>
            </div>
            <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center text-center group hover:bg-[#0D1B2A]/80 transition-colors">
               <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                 <DollarSign size={24} />
               </div>
               <p className="text-2xl font-bold text-white">{event.registration_fee}</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Entry Fee</p>
            </div>
          </div>

          {/* Location & Details Card */}
          <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-6 backdrop-blur-sm shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-[#162d45] pb-4">Event Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{event.venue_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{event.street_address}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{event.city}, {event.postal_code}, {event.country}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Type & Age</p>
                  <p className="text-sm font-medium text-white capitalize mt-0.5">
                    {event.event_type.toLowerCase()} • Ages {event.minimum_age}-{event.maximum_age}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-[#0D1B2A]/50 border border-[#162d45] rounded-3xl p-6 backdrop-blur-sm shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-[#162d45] pb-4">Contact Info</h3>
            
            <div className="space-y-4">
              {event.contact_email && (
                <a href={`mailto:${event.contact_email}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="text-sm font-medium text-white truncate max-w-[200px] mt-0.5">{event.contact_email}</p>
                  </div>
                </a>
              )}
              
              {event.contact_phone && (
                <a href={`tel:${event.contact_phone}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-white mt-0.5">{event.contact_phone}</p>
                  </div>
                </a>
              )}

              {event.website && (
                <a href={event.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Website</p>
                    <p className="text-sm font-medium text-[#00E5FF] mt-0.5 truncate max-w-[200px]">{event.website}</p>
                  </div>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
