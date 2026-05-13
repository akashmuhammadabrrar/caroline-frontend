"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResetPasswordMutation } from "@/redux/features/auth/accountApi";
import toast from "react-hot-toast";
import Image from "next/image";
import { Lock, ShieldCheck, CheckCircle2, RefreshCw, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    code: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Redirecting to forgot password...");
      router.push("/forgot-password");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { code, new_password, confirm_password } = formData;

    if (!code || !new_password || !confirm_password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new_password !== confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await resetPassword({ email, ...formData }).unwrap();
      toast.success("Password reset successfully! You can now login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reset password. Please check your code and try again.");
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
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Reset Password</h1>
          <p className="text-gray-400 text-sm text-center">
            Enter the code sent to <span className="text-cyan-400 font-medium">{email}</span> and your new password.
          </p>
        </div>

        <div className="bg-[#0b1221]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="6-digit code"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 text-white placeholder:text-gray-600 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 text-white placeholder:text-gray-600 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Repeat your password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 text-white placeholder:text-gray-600 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-linear-to-r from-[#00E5FF] to-[#00A3FF] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  Reset Password
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
