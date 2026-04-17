"use client";

import DarkPhoneInput from "@/components/reuseable/DarkPhoneInput";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Info,
  Mail,
  MapPin,
  Phone,
  User
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useCheckoutMutation,
  useCreateRegistrationMutation,
  useGetEventDetailsQuery,
  useGetMyRegistrationsQuery,
  useGetPastRegistrationsQuery,
  useGetRegistrationStatusQuery,
  useGetUpcomingRegistrationsQuery,
  useValidatePromoMutation,
  useVerifyPaymentMutation,
  type EventDataApi,
  type MyRegistration,
} from "../../../../redux/features/player/eventsDirectoryApi";

interface RegistrationStatusData {
  registration_status?: string;
  payment_status?: string;
  status?: string;
  data?: {
    registration_status?: string;
  };
}

type ViewState = "DETAILS" | "REGISTRATION";

const EventDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const currentUser = useAppSelector((state: any) => state.auth?.user);

  const [view, setView] = useState<ViewState>("DETAILS");

  // On mount, check if url query has action=register
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("action") === "register") {
        setView("REGISTRATION");
      }
    }
  }, []);

  const { data: registrationsData } = useGetMyRegistrationsQuery();
  const { data: upcomingData } = useGetUpcomingRegistrationsQuery();
  const { data: pastData } = useGetPastRegistrationsQuery();

  const allRegistrations: MyRegistration[] = React.useMemo(() => {
    const list: MyRegistration[] = [];
    const addToList = (data: any) => {
      if (!data) return;
      if (Array.isArray(data)) list.push(...data);
      else if ('results' in data && Array.isArray(data.results)) list.push(...data.results);
      else if ('data' in data && Array.isArray(data.data)) list.push(...data.data);
    };
    addToList(registrationsData);
    addToList(upcomingData);
    addToList(pastData);
    return list;
  }, [registrationsData, upcomingData, pastData]);
  
  const { data: eventResponse, isLoading: isDetailsLoading } = useGetEventDetailsQuery(id, {
    skip: !id,
  });

  console.log('eventResponse', eventResponse);

  const event = (eventResponse && 'data' in eventResponse && eventResponse.data) ? eventResponse.data : (eventResponse as EventDataApi);

  const reg = allRegistrations.find((r) => {
    if (r.email && currentUser?.email && r.email !== currentUser.email) return false;
    const nameMatch = (r as any).event_name && event?.event_name && (r as any).event_name === event.event_name;
    const regEventId = r.event_id || (typeof r.event === 'object' && r.event !== null && 'id' in r.event ? r.event.id : r.event) || r.event_details?.id;
    return nameMatch || (regEventId && Number(regEventId) === Number(id));
  });
  
  // Also check local storage as an immediate UI fallback
  const existingLocals = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("playerRegistrations") || "{}") : {};
  const localRegisteredId = existingLocals[String(id)];

  const isRegistered = !!reg || !!localRegisteredId;
  const status = (reg?.status || reg?.registration_status || (localRegisteredId ? "COMPLETED" : "")).toUpperCase();
  const localRegistrationId = String(reg?.registration_id || reg?.id || localRegisteredId || "");

  // Fetch real-time registration status ONLY if we have a stored registration_id
  const { data: registrationStatus } = useGetRegistrationStatusQuery(localRegistrationId!, {
    skip: !localRegistrationId,
    pollingInterval: 30000,
  });

  const handleBackToListing = () => {
    router.push("/player/eventsDirectory");
  };

  const handleRegister = () => {
    if (isRegistered) {
      toast.error("You are already registered for this event.");
      return;
    }
    setView("REGISTRATION");
  };

  const handleBackToDetails = () => {
    setView("DETAILS");
  };

  if (isDetailsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#04B5A3]"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 text-white">Event not found.</div>
    );
  }

  if (view === "REGISTRATION") {
    return <RegistrationFlow event={event} onBack={handleBackToDetails} onComplete={handleBackToListing} />;
  }

  return (
    <div className="p-6">
      <button 
        onClick={handleBackToListing}
        className="flex items-center gap-2 text-[#04B5A3] mb-6 hover:underline font-bold"
      >
        <ArrowLeft size={18} /> Back to Events Directory
      </button>

      <EventDetailsView 
        event={event} 
        onRegister={handleRegister} 
        onBack={handleBackToListing}
        registrationStatus={registrationStatus?.data || registrationStatus || reg}
        isRegistered={isRegistered}
      />
    </div>
  );
};

const EventDetailsView = ({ 
  event, 
  onRegister, 
  onBack,
  registrationStatus,
  isRegistered = false,
}: { 
  event: EventDataApi, 
  onRegister: () => void,
  onBack: () => void,
  registrationStatus?: RegistrationStatusData | MyRegistration,
  isRegistered?: boolean,
}) => {
  const regData = registrationStatus as Record<string, string | undefined> | undefined;
  const status = regData?.registration_status || 
    regData?.payment_status || 
    regData?.status ||
    null;

  const totalRegistered = Math.max(
    event.registered_count || 0,
    Array.isArray((event as any).participants) ? (event as any).participants.length : 0
  );
  const isFull = event.is_full === true || ((event.maximum_capacity ?? 0) > 0 && totalRegistered >= (event.maximum_capacity ?? 0));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#121433] border border-[#1E2550] rounded-[32px] p-8">
        <div className="flex justify-between items-start">
          <div>
             <h2 className="text-3xl font-bold text-white mb-2">{event.event_name}</h2>
             <p className="text-gray-400 flex items-center gap-2 mb-4">
               <MapPin size={16} /> {event.venue_name}
             </p>
             {isRegistered && (
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                  status === "PENDING" 
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}>
                  {status === "PENDING" ? <Clock size={14} /> : <Check size={14} />}
                  Status: {status}
                </div>
              )}
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-500 font-bold uppercase mb-1">Registration Fee</p>
             <p className="text-3xl font-black text-white">€{parseFloat(event.registration_fee || "0").toFixed(0)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-8">
          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-8">
            <h3 className="text-xl font-bold text-white mb-6">About This Event</h3>
            <p className="text-gray-400 leading-relaxed">
              {event.description || "Join us for an exclusive opportunity to showcase your talent in front of top scouts and coaches. This trial event is designed for young players aged 16-18 looking to take their career to the next level."}
            </p>
          </div>

          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-8">
            <h3 className="text-xl font-bold text-white mb-6">Event Schedule</h3>
            <div className="space-y-6">
              {[
                { time: "09:00 AM", task: "Registration & Check-in", sub: "Arrival and participant registration" },
                { time: "10:00 AM", task: "Warm-up Session", sub: "Group warm-up and preparation" },
                { time: "11:00 AM", task: "Technical Skills Assessment", sub: "Individual skills evaluation" },
                { time: "01:00 PM", task: "Lunch Break", sub: "Refreshments provided" },
                { time: "02:00 PM", task: "Practice Match", sub: "Full game situation evaluation" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6">
                  <span className="text-sm font-bold text-gray-500 shrink-0 w-20">{item.time}</span>
                  <div>
                    <h5 className="text-white font-bold">{item.task}</h5>
                    <p className="text-xs text-gray-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-8">
             <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Requirements</h3>
             <ul className="space-y-4">
                {[
                  "Age Requirement: Players must be between 16-18 years old",
                  "Experience Level: Minimum 2 years of competitive football experience required",
                  "Medical Clearance: Completed medical clearance form must be submitted before the event",
                  "Equipment: Bring your own football boots, shin guards, and training gear",
                  "Photo ID: Valid identification document required for check-in"
                ].map((txt, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-400 text-sm">
                    <Check size={18} className="text-[#04B5A3] shrink-0" />
                    {txt}
                  </li>
                ))}
             </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
            <h4 className="text-gray-300 font-bold mb-6">Event Information</h4>
            <div className="space-y-5">
              <div className="flex gap-4">
                <Calendar size={20} className="text-[#04B5A3]" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Date & Time</p>
                  <p className="text-sm text-white font-bold">{event.event_date}</p>
                  <p className="text-xs text-gray-400">{event.event_time || "10:00 AM - 5:00 PM"}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin size={20} className="text-[#04B5A3]" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Location</p>
                  <p className="text-sm text-white font-bold">{event.venue_name}</p>
                  <p className="text-xs text-gray-400">{event.venue_address || "Training Complex Stadium"}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <User size={20} className="text-[#04B5A3]" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Organizer</p>
                  <p className="text-sm text-white font-bold">Elite Football Academy</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
            <h4 className="text-gray-300 font-bold mb-6">Availability</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total Capacity</p>
                    <p className="text-2xl font-black text-white">
                      <span className="text-[#04B5A3]">
                        {Math.max(
                          event.registered_count || 0,
                          Array.isArray((event as any).participants) ? (event as any).participants.length : 0
                        )}
                      </span>
                      <span className="text-gray-500 mx-2">/</span>
                      {event.maximum_capacity || 0}
                    </p>
                 </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Spots Left</p>
                    <p className="text-xl font-bold text-cyan-400">
                      {Math.max(0, (event.maximum_capacity ?? 0) - Math.max(
                        event?.registered_count || 0,
                        Array.isArray((event as any).participants) ? (event as any).participants.length : 0
                      ))}
                    </p>
                  </div>
               </div>
                <div className="h-2 w-full bg-[#0B0E1E] rounded-full overflow-hidden border border-[#1E2550]">
                  <div className="h-full bg-linear-to-r from-[#04B5A3] to-cyan-400 transition-all duration-1000" style={{ width: `${Math.min(((((Math.max(event.registered_count || 0 , Array.isArray((event as any).participants) ? (event as any).participants.length : 0)) / (event.maximum_capacity || 1)) * 100)), 100)}%` }}></div>
                </div>
               <p className="text-[10px] text-[#04B5A3] font-bold uppercase tracking-widest text-center">
                 {((event.maximum_capacity ?? 0) - (event.registered_count ?? 0)) <= 5 ? "Hurry! Limited spots remaining" : "Registration Open"}
               </p>
            </div>
          </div>

          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7">
            <h4 className="text-gray-300 font-bold mb-6">Contact</h4>
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <Mail size={16} className="text-[#04B5A3]" />
                 <span className="text-sm text-gray-400 underline cursor-pointer hover:text-white transition-colors">contact@eliteacademy.com</span>
               </div>
               <div className="flex items-center gap-3">
                 <Phone size={16} className="text-[#04B5A3]" />
                 <span className="text-sm text-gray-400">+34 123 456 789</span>
               </div>
            </div>
          </div>

          <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-7 text-center">
            {isRegistered ? (
               <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
                    <p className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                       <Check size={16} /> Already Registered
                    </p>
                  </div>
                  <button 
                    disabled
                    className="w-full py-4 rounded-2xl bg-[#0B0E1E] text-emerald-500 border border-emerald-500/20 font-bold cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Already Registered
                  </button>
               </div>
            ) : (event.status || "").toUpperCase() === "PENDING" ? (
              <div className="space-y-4 text-center">
                <button 
                  disabled
                  className="w-full py-5 rounded-2xl bg-[#0B0E1E] text-amber-500 font-black text-lg cursor-not-allowed uppercase tracking-widest border border-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Clock size={20} />
                  Pending Status
                </button>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Registration is currently closed</p>
              </div>
            ) : ((event.status || "").toUpperCase() === "COMPLETED") ? (
              <div className="space-y-4 text-center">
                <button 
                  disabled
                  className="w-full py-5 rounded-2xl bg-[#0B0E1E] text-blue-500 font-black text-lg cursor-not-allowed uppercase tracking-widest border border-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Completed
                </button>
                <p className="text-[10px] text-gray-500 font-bold uppercase">This event has already ended</p>
              </div>
            ) : isFull ? (
              <div className="space-y-4 text-center">
                <button 
                  disabled
                  className="w-full py-5 rounded-2xl bg-[#0B0E1E] text-blue-500 font-black text-lg cursor-not-allowed uppercase tracking-widest border border-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Completed
                </button>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Event capacity reached</p>
              </div>
            ) : (
              <button 
                onClick={onRegister}
                className="w-full py-5 rounded-2xl bg-[#04B5A3] text-white font-black text-lg hover:bg-[#039d8f] active:scale-[0.98] transition-all shadow-[0_12px_24px_-8px_rgba(4,181,163,0.4)] uppercase tracking-widest"
              >
                Register Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RegistrationFlow = ({ event, onBack, onComplete }: { event: EventDataApi, onBack: () => void, onComplete: () => void }) => {
  const params = useParams();
  const id = params.id as string;
  const [step, setStep] = useState(1);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const [createRegistration] = useCreateRegistrationMutation();
  const [checkout] = useCheckoutMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [validatePromo, { isLoading: isApplyingPromo }] = useValidatePromoMutation();

  const [promoCode, setPromoCode] = useState("");
  const [promoAmount, setPromoAmount] = useState<number>(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    try {
      const res = await validatePromo({ code: promoCode, amount: parseFloat(event.registration_fee || "0"), usage_type: "EVENT" }).unwrap();
      if (res.data?.discount_amount) {
        setPromoAmount(Number(res.data.discount_amount));
        setIsPromoApplied(true);
        toast.success("Promo code applied successfully!");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string, error?: string } };
      setPromoError(error?.data?.message || error?.data?.error || "Invalid promo code");
      setPromoAmount(0);
      setIsPromoApplied(false);
    }
  };

  const handleNext = async (data: Record<string, string>) => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setRegistrationError(null);
      try {
        const payload = {
          event_id: Number(id),
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dob,
          emergency_contact_name: data.emergencyName,
          emergency_phone: data.emergencyPhone,
          relationship: data.relationship,
          medical_conditions: data.medical || "",
          allergies: data.allergies || "",
        };

        const res = await createRegistration(payload).unwrap();
        const regId = res?.data?.registration_id || res?.registration_id || res?.data?.id || res?.id;
        const finalRegId = regId ? String(regId) : null;
        setRegistrationId(finalRegId);
        
        if (finalRegId && event.id) {
          try {
            const existing = JSON.parse(localStorage.getItem("playerRegistrations") || "{}");
            existing[String(event.id)] = finalRegId;
            localStorage.setItem("playerRegistrations", JSON.stringify(existing));
          } catch {}
          toast.success("Registration success! Now proceed to payment.");
          setStep(4);
        }
      } catch (err: unknown) {
        const error = err as { data?: { message?: string, error?: string } };
        const errMsg = error?.data?.message || error?.data?.error || "Registration failed. Please try again.";
        setRegistrationError(errMsg);
        toast.error(errMsg);
      }
    } else if (step === 4) {
      try {
        if (registrationId) {
          localStorage.setItem("current_event_registration_id", registrationId);
        }
        
        const res = await checkout({ 
          registration_id: registrationId!,
        }).unwrap();
        
        if (res.checkout_url) {
          toast.success("Redirecting to checkout...");
          window.location.href = res.checkout_url;
        } else {
          toast.error("Could not get checkout URL.");
        }
      } catch (err: unknown) {
        const error = err as { data?: { message?: string, error?: string } };
        toast.error(error?.data?.message || error?.data?.error || "Checkout failed.");
      }
    }
  };

  const steps = [
    { id: 1, name: "Personal Info" },
    { id: 2, name: "Emergency Contact" },
    { id: 3, name: "Payment" },
    { id: 4, name: "Confirmation" }
  ];

  return (
    <div className="p-6">
      <button 
        onClick={step === 1 ? onBack : () => setStep(step - 1)}
        className="flex items-center gap-2 text-[#04B5A3] mb-8 hover:underline font-bold"
      >
        <ArrowLeft size={18} /> {step === 1 ? "Back to Event Details" : "Back"}
      </button>

      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#121433] border border-[#1E2550] rounded-[24px] p-8">
           <div className="flex justify-between items-end">
              <div>
                 <h2 className="text-3xl font-bold text-white mb-2">Event Registration</h2>
                 <p className="text-gray-400 font-medium">{event.event_name}</p>
                 <p className="text-xs text-gray-500">{event.event_date} • {event.venue_name}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Registration Fee</p>
                 <p className="text-3xl font-black text-cyan-400">€{parseFloat(event.registration_fee || "0").toFixed(0)}</p>
              </div>
           </div>
        </div>

        <div className="bg-[#121433] border border-[#1E2550] rounded-3xl p-6 flex items-center justify-between relative px-12">
            <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-[#1E2550] -translate-y-[22px]" />
            {steps.map((s, idx) => {
              const active = step === s.id;
              const completed = step > s.id;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                    active ? "bg-cyan-400 border-transparent text-white" : 
                    completed ? "bg-[#04B5A3] border-transparent text-white" : 
                    "bg-[#0B0E1E] border-[#1E2550] text-gray-500"
                  }`}>
                    {completed ? <Check size={18} /> : s.id}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? "text-cyan-400" : "text-gray-500"}`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
        </div>

        <div className="bg-[#121433] border border-[#1E2550] rounded-[32px] p-10 min-h-[400px]">
           <form onSubmit={handleSubmit(handleNext)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-8 border-b border-[#1E2550] pb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs text-gray-500 font-bold ml-1">First Name *</label>
                       <input {...register("firstName", { required: true })} className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs text-gray-500 font-bold ml-1">Last Name *</label>
                       <input {...register("lastName", { required: true })} className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs text-gray-500 font-bold ml-1">Email Address *</label>
                       <input {...register("email", { required: true })} className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all" placeholder="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs text-gray-500 font-bold ml-1">Phone Number *</label>
                       <DarkPhoneInput
                         name="phone"
                         control={control}
                         placeholder="XXX XXX XXX"
                         className="flex items-center w-full bg-[#0B0E1E] border border-[#1E2550] text-white text-xs rounded-xl overflow-hidden focus-within:border-cyan-400 transition-all shadow-inner"
                         dropdownClassName="bg-[#0B0E1E] text-white"
                       />
                       {errors.phone && <span className="text-red-500 text-xs ml-1">Phone is required</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                       <label className="text-xs text-gray-500 font-bold ml-1">Date of Birth *</label>
                       <input {...register("dob", { required: true })} type="date" className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all" />
                  </div>
                  <div className="flex gap-4 p-5 bg-cyan-400/5 border border-cyan-400/10 rounded-2xl items-center">
                     <Info className="text-cyan-400 shrink-0" size={20} />
                     <p className="text-xs text-gray-400 leading-relaxed">
                       <span className="text-cyan-400 font-bold">Age Requirement:</span> This event requires participants to be between {event.minimum_age}-{event.maximum_age} years old. Please ensure your age meets this requirement.
                     </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  {/* Error Banner for already-registered or other failures */}
                  {registrationError && (
                    <div className="flex items-start gap-4 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-400 font-black text-xs">!</span>
                      </div>
                      <div>
                        <p className="text-red-400 font-bold text-sm mb-1">Registration Blocked</p>
                        <p className="text-red-300 text-xs leading-relaxed">{registrationError}</p>
                        <button
                          type="button"
                          onClick={onBack}
                          className="mt-3 text-xs text-red-400 underline hover:text-red-300 font-bold transition-colors"
                        >
                          ← Go back to event details
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-8 border-b border-[#1E2550] pb-4">Emergency Contact</h3>
                    <div className="space-y-2">
                       <label className="text-xs text-gray-500 font-bold ml-1">Emergency Contact Name *</label>
                       <input {...register("emergencyName", { required: true })} className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all" placeholder="Full name" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold ml-1">Emergency Phone *</label>
                        <DarkPhoneInput
                          name="emergencyPhone"
                          control={control}
                          placeholder="XXX XXX XXX"
                          className="flex items-center w-full bg-[#0B0E1E] border border-[#1E2550] text-white text-xs rounded-xl overflow-hidden focus-within:border-cyan-400 transition-all shadow-inner"
                          dropdownClassName="bg-[#0B0E1E] text-white"
                        />
                        {errors.emergencyPhone && <span className="text-red-500 text-xs ml-1">Emergency phone is required</span>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold ml-1">Relationship *</label>
                        <input {...register("relationship", { required: true })} className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all" placeholder="e.g. Mother, Father, Guardian" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Medical Information</h3>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-bold ml-1">Medical Conditions</label>
                      <textarea {...register("medical")} className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all h-24 resize-none" placeholder="List any medical conditions. Leave blank if none." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-bold ml-1">Allergies</label>
                      <textarea {...register("allergies")} className="w-full bg-[#0B0E1E] border border-[#1E2550] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all h-24 resize-none" placeholder="List any allergies. Leave blank if none." />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-white mb-8 border-b border-[#1E2550] pb-4">Payment Summary</h3>
                  <div className="bg-[#0B0E1E] border border-[#1E2550] rounded-[24px] p-8 space-y-6">
                     <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-bold ml-1 uppercase tracking-widest">Promo Code</label>
                        <div className="flex gap-3">
                          <input 
                            value={promoCode} 
                            onChange={(e) => setPromoCode(e.target.value)} 
                            disabled={isPromoApplied}
                            className={`flex-1 bg-[#121433] border ${promoError ? 'border-red-500' : 'border-[#1E2550]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-all`} 
                            placeholder="Enter code" 
                          />
                          <button 
                            type="button" 
                            onClick={handleApplyPromo} 
                            disabled={isPromoApplied || isApplyingPromo || !promoCode}
                            className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                          >
                            {isApplyingPromo ? "Applying..." : isPromoApplied ? "Applied" : "Apply"}
                          </button>
                        </div>
                        {promoError && <p className="text-red-500 text-xs ml-1">{promoError}</p>}
                     </div>

                     <div className="border-t border-[#1E2550] pt-6 space-y-4">
                       <div className="flex justify-between text-gray-400 text-sm font-medium">
                          <span>Registration Fee</span>
                          <span className={`text-white ${isPromoApplied ? 'line-through text-gray-500' : ''}`}>€{parseFloat(event.registration_fee || "0").toFixed(2)}</span>
                       </div>
                       {isPromoApplied && (
                         <div className="flex justify-between text-[#00E5FF] text-sm font-bold">
                            <span>Discount applied ({promoCode})</span>
                            <span>-€{promoAmount.toFixed(2)}</span>
                         </div>
                       )}
                       <div className="flex justify-between text-gray-400 text-sm font-medium">
                          <span>Processing Fee</span>
                          <span className="text-white">€2.50</span>
                       </div>
                       <div className="pt-4 border-t border-[#1E2550] flex justify-between items-center">
                          <span className="text-lg font-bold text-white">Total</span>
                          <span className="text-2xl font-black text-white">€{Math.max(0, parseFloat(event.registration_fee || "0") - promoAmount + 2.50).toFixed(2)}</span>
                       </div>
                     </div>
                     <p className="text-xs text-gray-500 pt-4 text-center">
                       You will be redirected to a secure Stripe checkout page in the next step.
                     </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col items-center justify-center space-y-8 py-10">
                   <div className="w-24 h-24 bg-[#04B5A3]/10 text-[#04B5A3] rounded-full flex items-center justify-center border-2 border-[#04B5A3]/30 animate-pulse">
                      <CreditCard size={48} strokeWidth={3} />
                   </div>
                   <div className="text-center space-y-3">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Ready to Checkout</h3>
                      <p className="text-gray-400 max-w-sm mx-auto">Click Confirm & Pay to be redirected to Stripe to securely complete your payment. Once paid, you will be redirected back here.</p>
                   </div>
                   <div className="bg-[#0B0E1E] border border-cyan-400/20 rounded-2xl p-6 w-full max-w-md space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-widest">Registration ID</span>
                        <span className="text-cyan-400 font-mono">#{registrationId?.split('-')[0]?.toUpperCase() || "NEW"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-widest">Status</span>
                        <span className="text-orange-400 font-bold uppercase px-2 py-0.5 bg-orange-400/10 rounded-full">Pending Payment</span>
                      </div>
                   </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-10 border-t border-[#1E2550]">
                 <button 
                  type="button"
                  onClick={step === 1 ? onBack : () => setStep(step - 1)}
                  className="px-8 py-4 rounded-xl border border-[#1E2550] text-gray-500 font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                 >
                   {step === 4 ? "Back to Events" : "Cancel"}
                 </button>
                 <button 
                  type="submit"
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#04B5A3] to-[#039d8f] text-white font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_12px_24px_-8px_rgba(4,181,163,0.4)]"
                 >
                   {step === 4 ? "Confirm & Pay" : "Next Step"}
                   {(step < 4) && <ArrowRight size={20} />}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
