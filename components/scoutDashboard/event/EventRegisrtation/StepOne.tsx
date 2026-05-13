import { useFormContext } from "react-hook-form";
import { Info } from "lucide-react";
import DarkPhoneInput from "../../../reuseable/DarkPhoneInput";

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

export default function StepOne() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70 flex items-center gap-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("first_name", { required: "First name is required" })}
            placeholder="Enter first name"
            className={`w-full bg-[#0A0F1D] border ${errors.first_name ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-all`}
          />
          {errors.first_name && (
            <p className="text-xs text-red-400 mt-1">
              {errors.first_name.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70 flex items-center gap-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("last_name", { required: "Last name is required" })}
            placeholder="Enter last name"
            className={`w-full bg-[#0A0F1D] border ${errors.last_name ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-all`}
          />
          {errors.last_name && (
            <p className="text-xs text-red-400 mt-1">
              {errors.last_name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-white/70 flex items-center gap-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            placeholder="example@email.com"
            className={`w-full bg-[#0A0F1D] border ${errors.email ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-all`}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-white/70 flex items-center gap-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <DarkPhoneInput
            name="phone_number"
            control={control as any}
            rules={{
              required: "Phone number is required",
              validate: (value: string) => {
                const number = value.split(" ")[1] || "";
                const totalLength = value.replace(/\s+/g, "").length;
                if (number.length < 7) return "Phone number is too short";
                if (totalLength > 15) return "Phone number cannot exceed 15 digits";
                return true;
              }
            }}
            placeholder="XXX XXX XXX"
            className={`flex items-center w-full bg-[#0A0F1D] border rounded-xl overflow-hidden transition-all duration-300 ${errors.phone_number ? "border-red-500/50" : "border-white/10 focus-within:border-[#00E5FF]/50"}`}
          />
          {errors.phone_number && (
            <p className="text-xs text-red-400 mt-1">
              {errors.phone_number.message}
            </p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-2xl p-4 flex gap-3">
        <div className="mt-0.5">
          <Info className="w-5 h-5 text-[#00E5FF]" />
        </div>
        <div>
          <h4 className="text-[#00E5FF] text-sm font-bold mb-1">
            About Your Registration
          </h4>
          <p className="text-white/60 text-xs leading-relaxed">
            As a registered scout, you can attend this event to find talent.
            Please complete all registration steps to confirm your attendance.
          </p>
        </div>
      </div>
    </div>
  );
}
