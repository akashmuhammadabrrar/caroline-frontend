"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Clock, MapPin, Users, Mail, Phone, Calendar, Info } from "lucide-react";
import { useGetEventDetailsQuery } from "@/redux/features/admin/adminEventApi";
import { useGetMyRegistrationsQuery } from "@/redux/features/player/eventsDirectoryApi";
import Navbar from "@/components/sheard/Navbar";
import Footer from "@/components/sheard/Footer";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = Number(unwrappedParams.id);
  const router = useRouter();
  const theme = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);

  const { data: eventResponse, isLoading: isEventLoading } = useGetEventDetailsQuery(eventId);
  const { data: registrations, isLoading: isRegLoading } = useGetMyRegistrationsQuery(undefined, {
    skip: !user || user.role !== "PLAYER",
  });
  const event = eventResponse?.data || eventResponse; // Handle different potential response structures

  const registrationsArray = Array.isArray(registrations) ? registrations : ((registrations as any)?.data || []);
  const isRegistered = registrationsArray?.some((reg: any) => {
    const regEventId = reg.event_id || (typeof reg.event === 'object' && reg.event !== null ? reg.event.id : reg.event);
    return (Number(regEventId) === Number(eventId)) && 
           (reg.status === "PENDING" || reg.status === "CONFIRMED" || reg.status === "PAID" || reg.status === "CONFIRM" || reg.status === "SUCCESS");
  });

  const isFull = event?.is_full || (event?.maximum_capacity > 0 && event?.registered_count >= event?.maximum_capacity);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isEventLoading]);

  if (isEventLoading) {
    return (
      <main className="min-h-screen bg-[#050B14] flex flex-col pt-32">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!event || (!event.id && !event.event_name)) {
    return (
      <main className="min-h-screen bg-[#050B14] flex flex-col pt-32">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Event not found</h1>
          <p className="text-gray-400 mb-8">The event you are looking for does not exist or has been removed.</p>
          <Link href="/latest-events" className="text-cyan-400 hover:underline inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Latest Events
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050B14] flex flex-col pt-32 text-white">
      <Navbar />
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 mb-16">
        <Link 
          href="/latest-events" 
          className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors mb-8 bg-cyan-400/10 px-4 py-2 rounded-full border border-cyan-400/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Events
        </Link>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#12143A] rounded-3xl overflow-hidden border border-[#1E2554] shadow-2xl p-8 sm:p-12">
              <div className="flex items-center gap-2 mb-6">
                 <span className="bg-[#06A295]/20 text-[#06A295] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#06A295]/30">
                  {event.status || "Upcoming"}
                </span>
                {event.is_featured && (
                  <span className="bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-purple-500/30">
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-8">
                {event.event_name}
              </h1>
              
              <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mb-10">
                <p>
                  {event.description || "Join us for this exciting event. Stay updated with training tips, nutrition advice, and gear reviews. This event is designed to help you excel in your professional journey and connect with mentors and peers in the industry."}
                </p>
                {!event.description && (
                  <div className="mt-6 p-6 bg-cyan-400/5 rounded-2xl border border-cyan-400/10 flex gap-4">
                    <Info className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    <p className="text-sm text-gray-400 m-0">
                      Detailed event schedule and program modules will be shared with registered participants via email. For immediate inquiries, please reach out to our contact team.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-gray-700/50">
                <h3 className="text-xl font-bold mb-6 text-white">Event Highlights</h3>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Professional scouting opportunities",
                    "Advanced technical training sessions",
                    "Networking with industry experts",
                    "Performance data analysis reports",
                    "Exclusive gear and nutrition guides",
                    "Priority access to future showcases"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-[#00F6FF] font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-[#12143A] rounded-3xl p-8 border border-[#1E2554] shadow-xl sticky top-8">
              <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Event Details</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Date</p>
                    <p className="text-[#06A295] font-semibold">
                      {event.date ? format(new Date(event.date), "EEEE, dd MMM yyyy") : "Date TBD"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Time</p>
                    <p className="text-[#06A295] font-semibold">08:00 AM - 05:00 PM (TBD)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Location</p>
                    <p className="text-[#06A295] font-semibold">{event.location || "Location TBD"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Registration Fee</p>
                    <p className="text-[#06A295] font-semibold text-lg">
                      {event.fee === "0.00" || !event.fee ? "Free Entry" : `$${event.fee}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 pt-8 border-t border-gray-700/50">
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Organizer Contact</p>
                 <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span className="text-[#06A295]">contact@nextgenpros.com</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span className="text-[#06A295]">+1 234 567 890</span>
                 </div>
              </div>

              <button 
                disabled={isRegistered || isFull}
                onClick={() => {
                  if (isRegistered || isFull) return;
                  if (!user) {
                    router.push("/login");
                    return;
                  }
                  if (user.role === "PLAYER") {
                    router.push(`/player/eventsDirectory/${eventId}`);
                  }
                }}
                className={`w-full font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                  isRegistered 
                    ? "bg-[#0B0E1E] text-cyan-400 border border-cyan-400/30 cursor-not-allowed shadow-inner" 
                    : isFull 
                    ? "bg-gray-800/50 text-gray-500 border border-gray-700/50 cursor-not-allowed"
                    : "bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20"
                }`}
              >
                {isRegistered ? (
                  "Already Registered"
                ) : isFull ? (
                  "Completed"
                ) : (
                  "Register For Event"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
