"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyEmailMutation, useSendVerificationCodeMutation } from "@/redux/features/auth/accountApi";
import toast from "react-hot-toast";
import Image from "next/image";
import { Mail, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import DarkInput from "@/components/reuseable/DarkInput";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [sendCode, { isLoading: isSending }] = useSendVerificationCodeMutation();

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Redirecting to login...");
      router.push("/login");
    }
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      await verifyEmail({ email, code }).unwrap();
      toast.success("Email verified successfully! You can now login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.data?.message || "Verification failed. Please try again.");
    }
  };

  const handleResend = async () => {
    try {
      await sendCode({ email }).unwrap();
      toast.success("Verification code resent to your email.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resend code.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-20 h-20 relative mb-6">
            <Image
              src="/images/banner-log.png"
              alt="NextGen Pros"
              width={80}
              height={80}
              className="drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Verify Your Email</h1>
          <p className="text-gray-400 text-sm text-center">
            We've sent a verification code to <span className="text-cyan-400 font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-[#0b1221]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-gray-600 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition-all text-center tracking-[0.5em] font-bold text-xl"
                  maxLength={6}
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 bg-linear-to-r from-[#00E5FF] to-[#00A3FF] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  Verify Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-gray-500 text-sm">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSending}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors disabled:opacity-50"
                >
                  {isSending ? "Sending..." : "Resend Code"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
