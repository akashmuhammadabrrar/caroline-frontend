"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/redux/features/auth/loginApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { LoginPayload } from "@/types/auth";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { ArrowLeft } from "lucide-react";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
  });

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    const payload: LoginPayload = {
      email: data.email,
      password: data.password,
    };

    try {
      const response = await login(payload).unwrap();

      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.access,
          refreshToken: response.refresh,
        })
      );

      toast.success("Login successful");

      // Role-based redirection
      switch (response.user.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "PLAYER":
          router.push("/player");
          break;
        case "SCOUT_AGENT":
          router.push("/scout");
          break;
        case "CLUB_ACADEMY":
          router.push("/club");
          break;
        default:
          router.push("/");
          break;
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Handle unverified email error
      if (error?.data?.is_verified === false) {
        toast.error("Email not verified. Redirecting to verification page...");
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      
      toast.error(error?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="flex items-center gap-2 absolute top-4 left-4 cursor-pointer">
        <Link href="/" className="text-white">
          <ArrowLeft className="text-white" size={20} />
        </Link>
      </div>
      <div className="bg-[#020617] max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/login-logo.png"
            width={200}
            height={200}
            alt="Logo"
            priority
          />
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome Back
          </h1>
         
        </div>

        <div className="bg-[#050B14] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm text-gray-300 font-medium">
                <MdOutlineEmail size={20} />
                Email Address<span className="text-red-500"> *</span>
              </label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="player@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-sm text-gray-300 font-medium">
                <IoLockClosedOutline size={20} />
                Password<span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 pr-12 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <FaRegEye />
                  ) : (

                    <FaRegEyeSlash />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-transparent"
                />
                <span>Remember me</span>
              </label>
              <div className="flex flex-col items-end gap-1">
                <Link
                  href="/forgot-password"
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Forgot Password?
                </Link>
                <Link href="/register" className="text-gray-500 hover:text-gray-300 transition-colors">
                  Back To Register
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${isLoading
                  ? "bg-cyan-800 text-white opacity-70 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/40"
                }`}
            >
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          <p className="mt-6 text-[11px] text-center text-gray-500">
            Protected by NextGen Pros. See our{" "}
            <span className="text-cyan-400">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
