/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useVerifyPaymentMutation } from "../../../../redux/features/player/eventsDirectoryApi";

import { Suspense, useRef } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const session_id = searchParams.get("session_id");
  const query_registration_id = searchParams.get("registration_id");

  const [verifyPayment, { isLoading }] = useVerifyPaymentMutation();
  const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "FAILED">("VERIFYING");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  
  const verifyAttempted = useRef(false);

  useEffect(() => {
    // If the backend didn't append registration_id to success_url, get it from localStorage
    const registration_id = query_registration_id || localStorage.getItem("current_event_registration_id");
    
    if (!session_id || !registration_id) {
      setStatus("FAILED");
      setErrorMsg("Missing required payment information in the URL.");
      return;
    }

    setActiveRegId(registration_id);

    const verify = async () => {
      // Prevent double-fetching in React 18 Strict Mode
      if (verifyAttempted.current) return;
      verifyAttempted.current = true;
      
      try {
        await verifyPayment({ session_id, registration_id }).unwrap();
        localStorage.removeItem("current_event_registration_id");
        setStatus("SUCCESS");
      } catch (err: unknown) {
        setStatus("FAILED");
        const error = err as { data?: { detail?: string, messages?: Array<{ message?: string }> } };
        const errMsg = error?.data?.detail || error?.data?.messages?.[0]?.message || "Payment verification failed. Please contact support.";
        setErrorMsg(errMsg);
      }
    };

    verify();
  }, [session_id, query_registration_id, verifyPayment]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-[#121433] border border-[#1E2550] rounded-[32px] p-10 max-w-lg w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {status === "VERIFYING" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Verifying Payment</h3>
              <p className="text-gray-400">Please wait while we confirm your registration...</p>
            </div>
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="flex flex-col items-center justify-center py-4 space-y-8">
            <div className="w-24 h-24 bg-[#04B5A3]/10 text-[#04B5A3] rounded-full flex items-center justify-center border-2 border-[#04B5A3]/30 animate-bounce">
              <Check size={48} strokeWidth={3} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Registration Confirmed!</h3>
              <p className="text-gray-400 max-w-sm mx-auto">Your payment was successful and your registration is complete.</p>
            </div>
            
            <div className="bg-[#0B0E1E] border border-cyan-400/20 rounded-2xl p-6 w-full space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-widest">Registration ID</span>
                <span className="text-cyan-400 font-mono">#{activeRegId?.split('-')[0]?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-widest">Status</span>
                <span className="text-[#04B5A3] font-bold uppercase px-3 py-1 bg-[#04B5A3]/10 rounded-full tracking-wider">Paid</span>
              </div>
            </div>

            <button 
              onClick={() => router.push("/player/eventsDirectory")}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#04B5A3] to-[#039d8f] text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_12px_24px_-8px_rgba(4,181,163,0.4)]"
            >
              View My Events <ArrowRight size={20} />
            </button>
          </div>
        )}

        {status === "FAILED" && (
          <div className="flex flex-col items-center justify-center py-4 space-y-8">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border-2 border-red-500/30">
              <XCircle size={48} strokeWidth={3} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Verification Failed</h3>
              <p className="text-red-400 max-w-sm mx-auto">{errorMsg}</p>
            </div>
            <button 
              onClick={() => router.push("/player/eventsDirectory")}
              className="w-full py-4 rounded-xl border border-[#1E2550] text-gray-300 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} /> Back to Directory
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function EventRegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
