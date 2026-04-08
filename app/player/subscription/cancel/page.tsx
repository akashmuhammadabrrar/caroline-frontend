"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, LayoutDashboard, RotateCcw } from "lucide-react";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full overflow-hidden">
      <div className="text-center space-y-6 sm:space-y-8 w-full max-w-xl mx-auto relative z-10">
        
        {/* Glow effect positioned behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-3/4 bg-red-500/10 blur-[100px] pointer-events-none rounded-full" />

        {/* The Premium Cancel Card */}
        <div className="bg-[#12143A]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          
          {/* Subtle internal gradient/glare */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none transition-transform group-hover:scale-110 duration-700" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Icon Container */}
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse rounded-full" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-red-500/10 to-red-600/30 border border-red-500/40 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-transform hover:scale-110 duration-500 hover:rotate-[15deg]">
                <XCircle size={48} className="sm:w-16 sm:h-16" strokeWidth={2} />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-center w-full">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                Checkout
                <br className="sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 border-b-2 border-red-500/30 pb-1 sm:pb-2 inline-block mt-2 sm:mt-0 sm:ml-3">Canceled</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                Your subscription was not activated and your account hasn't been charged.
              </p>
            </div>

            <div className="w-full bg-[#0B0D2C] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/5 relative overflow-hidden">
               <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-500 to-transparent" />
               <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-left pl-2 font-medium">
                 Take your time! You can return to the plans page and try again whenever you're ready to elevate your career.
               </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <button 
                onClick={() => router.push("/player/subscription")}
                className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-red-500/10 to-red-600/20 border border-red-500/30 rounded-xl text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
              >
                <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
                Back to Plans
              </button>
              
              <button 
                onClick={() => router.push("/player/dashboard")}
                className="w-full sm:flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 group/btn2"
              >
                <LayoutDashboard size={16} className="text-gray-400 group-hover/btn2:text-white transition-colors" />
                Dashboard
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">
              <RotateCcw size={12} className="opacity-70" />
              Your current status is unchanged
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}