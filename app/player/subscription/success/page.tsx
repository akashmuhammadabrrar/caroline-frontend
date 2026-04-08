"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyPaymentMutation, useGetSubscriptionQuery } from "../../../../redux/features/player/subscriptionApi";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const { data: subscription, refetch } = useGetSubscriptionQuery();
  const activeSub = subscription?.data;

  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (sessionId) {
      verifyPayment({ session_id: sessionId })
        .unwrap()
        .then(async () => {
          toast.success("Payment verified successfully!");
          await refetch();
          setIsDone(true);
        })
        .catch(async (err: any) => {
          console.error("Verification response:", err);
          
          // Gracefully swallow the IntegrityError (500) if a webhook already verified the payment in the background
          const isDuplicate = err?.status === 'PARSING_ERROR' || err?.originalStatus === 500 || String(err?.error).includes("Integrity");
          
          if (isDuplicate) {
            toast.success("Payment verified successfully!");
            await refetch();
            setIsDone(true);
          } else {
            const errorMessage = err?.data?.message || err?.data?.detail || err?.error || "Failed to verify payment. Please contact support.";
            setError(errorMessage);
            toast.error("Verification failed.");
          }
        });
    } else {
      setError("No session ID found.");
    }
  }, [sessionId, verifyPayment, refetch]);

  if (isVerifying || (!isDone && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={32} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">Verifying Payment</h2>
          <p className="text-gray-500 font-medium">Please wait while we confirm your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-8">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 border border-red-500/20">
          <Check size={40} className="rotate-45" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white uppercase italic">Something went wrong</h2>
          <p className="text-gray-400 max-w-md mx-auto">{error}</p>
        </div>
        <button 
          onClick={() => router.push("/player/subscription")}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
        >
          Back to Subscription
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 sm:p-8 animate-in fade-in zoom-in duration-700 w-full">
      <div className="relative mb-8 sm:mb-12">
        <div className="absolute inset-0 bg-cyan-400 blur-3xl opacity-20 animate-pulse" />
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#00D4AA] to-cyan-500 rounded-[30px] sm:rounded-[40px] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,212,170,0.4)] rotate-3">
          <Check className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={3} />
        </div>
      </div>

      <div className="text-center space-y-6 w-full max-w-2xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase italic leading-none tracking-tighter">
            Payment <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent pb-1 inline-block">Successful!</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 font-medium">Welcome to the elite league.</p>
        </div>

        {activeSub && (
          <div className="bg-[#12143A]/50 border border-cyan-400/30 rounded-[32px] p-6 sm:p-8 backdrop-blur-xl space-y-6 text-left shadow-[0_0_30px_rgba(34,211,238,0.1)]">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 tracking-wide uppercase italic">
              Subscription Receipt
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Session ID */}
              <div className="col-span-1 sm:col-span-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Stripe Session ID</p>
                <p className="text-white font-medium text-xs sm:text-sm truncate" title={sessionId || ""}>{sessionId}</p>
              </div>

              {/* Registration ID */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Registration ID</p>
                <p className="text-white font-black text-lg">{activeSub.id || "N/A"}</p>
              </div>
              
              {/* Plan Name */}
              <div className="bg-gradient-to-r from-cyan-400/10 to-purple-500/10 p-4 rounded-xl border border-cyan-400/20">
                <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-1">Plan</p>
                <p className="text-white font-black text-lg uppercase italic">{activeSub.plan_name}</p>
              </div>

              {/* Billing Interval */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Billing Interval</p>
                <p className="text-white font-medium text-lg capitalize">{activeSub.billing_cycle === 'MONTHLY' ? 'Monthly' : activeSub.billing_cycle === 'YEARLY' ? 'Yearly' : activeSub.billing_cycle}</p>
              </div>

              {/* Price */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-white font-black text-2xl tracking-tighter">€{activeSub.amount}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 font-medium bg-[#0B0D2C]/50 p-4 rounded-2xl border border-white/5 mt-4">
              <div className="w-2 h-2 rounded-full bg-[#00D4AA] shadow-[0_0_10px_#00D4AA] flex-shrink-0" />
              Your premium features are now permanently active on your profile.
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-8 w-full">
          <button 
            onClick={() => router.push("/player")}
            className="w-full sm:flex-1 px-8 py-5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(0,212,170,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            Go to Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => router.push("/player/subscription")}
            className="w-full sm:flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95"
          >
            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}