"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import StepIndicator from "../reuseable/StepIndicator";
import DarkInput from "../reuseable/DarkInput";
import DarkPhoneInput from "../reuseable/DarkPhoneInput";
import DarkSelect from "../reuseable/DarkSelect";
import SignatureField from "./SignatureField";
import { useRegisterPlayerMutation } from "@/redux/features/auth/playerRegistraionApi";
import { showRegistrationError } from "@/lib/registrationErrors";
import { PlayerRegisterPayload } from "@/types/player";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { countries } from "@/constants/countries";
import { useGetAllClubsQuery } from "@/redux/features/scout/clubDireactoryApi";
import {
  User,
  Calendar,
  Globe,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Shield,
  AlertCircle,
  FileText,
} from "lucide-react";

interface FormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  playing_position: string;
  preferred_foot: string;
  height: string;
  weight: string;
  city: string;
  country: string;
  current_club_academy: string;
  type_of_commitment: string;
  contract_valid_until: string;

  parent_guardian_first_name?: string;
  parent_guardian_last_name?: string;
  parent_id_number?: string;
  parent_guardian_email?: string;
  parent_guardian_digital_signature?: string | null;
  accept_privacy: boolean;
}

const PlayerRegisterForm = () => {
  const [step, setStep] = useState(0); // 0 (Initial) to 4 (Privacy)
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      accept_privacy: false,
    },
  });

  const [registerPlayer, { isLoading }] = useRegisterPlayerMutation();
  const { data: clubsData } = useGetAllClubsQuery();
  const allClubs = clubsData?.results || [];

  const dob = watch("date_of_birth");
  const password = watch("password");
  const confirmPassword = watch("confirm_password");
  const nationality = watch("nationality");
  const formValues = watch();

  const [clubSearch, setClubSearch] = useState("");
  const [showClubSuggestions, setShowClubSuggestions] = useState(false);

  const filteredClubs = useMemo(() => {
    if (!clubSearch) return [];
    return allClubs.filter((club) =>
      club.club_name.toLowerCase().includes(clubSearch.toLowerCase()),
    );
  }, [clubSearch, allClubs]);

  const isMinor = useMemo(() => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  }, [dob]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    if (step === 0) {
      const isDobValid =
        dob &&
        new Date(dob).getFullYear() >= 1900 &&
        new Date(dob) <= new Date();
      if (!isDobValid) {
        toast.error(
          "Please enter a valid date of birth (after 1900 and not in the future)",
        );
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      fieldsToValidate = [
        "first_name",
        "last_name",
        "date_of_birth",
        "nationality",
        "phone_number",
        "email",
        "password",
        "confirm_password",
      ];
    } else if (step === 1) {
      fieldsToValidate = [
        "playing_position",
        "preferred_foot",
        "height",
        "weight",
        "city",
        "country",
      ];
    } else if (step === 2) {
      const contractDate = watch("contract_valid_until");
      if (
        contractDate &&
        new Date(contractDate) < new Date(new Date().setHours(0, 0, 0, 0))
      ) {
        toast.error("Contract validity date cannot be in the past");
        return;
      }
      fieldsToValidate = [
        "current_club_academy",
        "type_of_commitment",
        "contract_valid_until",
      ];
    } else if (step === 3 && isMinor) {
      fieldsToValidate = [
        "parent_guardian_first_name",
        "parent_guardian_last_name",
        "parent_id_number",
        "parent_guardian_digital_signature",
      ];
    }

    const valid = await trigger(fieldsToValidate);
    if (valid) {
      if (step === 0) setStep(1);
      else if (step === 1) setStep(2);
      else if (step === 2) setStep(isMinor ? 3 : 4);
      else if (step === 3) setStep(4);
    }
  };

  const handleBackStep = () => {
    if (step === 4) setStep(isMinor ? 3 : 2);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else if (step === 1) setStep(0);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.accept_privacy) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    const payload: PlayerRegisterPayload = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      nationality: data.nationality,
      phone_number: data.phone_number ? data.phone_number.replace(/\s+/g, "") : "",
      playing_position:
        data.playing_position.charAt(0).toUpperCase() +
        data.playing_position.slice(1),
      preferred_foot:
        data.preferred_foot.charAt(0).toUpperCase() +
        data.preferred_foot.slice(1),
      height: parseFloat(data.height),
      weight: parseFloat(data.weight),
      city: data.city,
      country: data.country,
      current_club_academy: data.current_club_academy,
      type_of_commitment: data.type_of_commitment,
      contract_valid_until: data.contract_valid_until,
      parent_guardian_first_name: data.parent_guardian_first_name,
      parent_guardian_last_name: data.parent_guardian_last_name,
      parent_guardian_email: data.parent_guardian_email,
      parent_id_number: data.parent_id_number,
      parent_guardian_digital_signature:
        data.parent_guardian_digital_signature || null,
    };

    if (!isMinor) {
      delete payload.parent_guardian_first_name;
      delete payload.parent_guardian_last_name;
      delete payload.parent_guardian_email;
      delete payload.parent_guardian_digital_signature;
      delete payload.parent_id_number;
    }

    try {
      await registerPlayer(payload).unwrap();
      toast.success("Registration successful!");
      reset();
      router.push("/login");
    } catch (error: any) {
      console.error("Registration failed:", error);
      await showRegistrationError(error, {
        onGoToLogin: () => router.push("/login"),
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10">
        {/* Logo and Header - Only for Step 0 */}
        {step === 0 && (
          <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-24 h-24 relative mb-6">
              <Image
                src="/images/banner-log.png"
                alt="NextGen Pros"
                width={96}
                height={96}
                className="drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Start Your Journey
            </h1>
            <p className="text-gray-400 text-sm">
              Create your NextGen Pros player profile
            </p>
          </div>
        )}

        <div className="bg-[#0b1221]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
          {step > 0 && <StepIndicator step={step} isMinor={isMinor} />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 0 - INITIAL ACCOUNT CREATION */}
            {step === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DarkInput
                    label="First Name"
                    name="first_name"
                    register={register}
                    rules={{ required: "First name is required" }}
                    error={errors.first_name?.message}
                    icon={<User size={16} />}
                    placeholder="John"
                  />
                  <DarkInput
                    label="Last Name"
                    name="last_name"
                    register={register}
                    rules={{ required: "Last name is required" }}
                    error={errors.last_name?.message}
                    icon={<User size={16} />}
                    placeholder="Doe"
                  />
                </div>
                <DarkInput
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  register={register}
                  rules={{ 
                    required: "Date of birth is required",
                    validate: (value: string) => {
                      const date = new Date(value);
                      const today = new Date();
                      if (date.getFullYear() < 1900) return "Invalid date (year too old)";
                      if (date > today) return "Date of birth cannot be in the future";
                      return true;
                    }
                  }}
                  error={errors.date_of_birth?.message}
                  icon={<Calendar size={16} />}
                  value={watch("date_of_birth")}
                />
                <DarkSelect
                  label="Nationality"
                  name="nationality"
                  register={register}
                  rules={{ required: "Nationality is required" }}
                  error={errors.nationality?.message}
                  icon={<Globe size={16} />}
                  options={countries}
                />
                <DarkPhoneInput
                  label="Phone Number"
                  name="phone_number"
                  control={control as any}
                  rules={{
                    required: "Phone number is required",
                    validate: (value: string) => {
                      if (!value) return true;
                      const number = value.includes(" ") ? value.split(" ")[1] : value.replace(/^\+\d+\s*/, "");
                      const totalLength = value.replace(/\s+/g, "").length;
                      if (number.length < 7) return "Phone number is too short";
                      if (totalLength > 15) return "Phone number cannot exceed 15 digits";
                      return true;
                    }
                  }}
                  error={errors.phone_number?.message}
                  icon={<Phone size={16} />}
                  placeholder="XXX XXX XXX"
                />
                <DarkInput
                  label="Email Address"
                  name="email"
                  type="email"
                  register={register}
                  rules={{ 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  error={errors.email?.message}
                  icon={<Mail size={16} />}
                  placeholder="player@example.com"
                />
                <DarkInput
                  label="Password"
                  name="password"
                  type="password"
                  register={register}
                  rules={{ 
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" }
                  }}
                  error={errors.password?.message}
                  icon={<Lock size={16} />}
                  placeholder="********"
                />
                <DarkInput
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  register={register}
                  rules={{ 
                    required: "Please confirm your password",
                    validate: (value: string) => value === watch("password") || "Passwords do not match"
                  }}
                  error={errors.confirm_password?.message}
                  icon={<Lock size={16} />}
                  placeholder="********"
                />

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-4 bg-linear-to-r from-[#00E5FF] to-[#00A3FF] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <User size={18} />
                  Create Account
                </button>

                {/* <div className="relative py-4 flex items-center justify-center">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                   <span className="relative px-4 text-gray-500 text-xs bg-[#0b1221] uppercase tracking-widest">or continue with</span>
                </div> */}

                {/* <div className="grid grid-cols-2 gap-4">
                   <button type="button" className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-white text-sm hover:bg-white/10 transition-colors">
                      <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">G</div>
                      Google
                   </button>
                   <button type="button" className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-white text-sm hover:bg-white/10 transition-colors">
                      <div className="w-5 h-5 bg-[#1877F2] rounded-full flex items-center justify-center text-xs font-bold text-white">f</div>
                      Facebook
                   </button>
                </div> */}
              </div>
            )}

            {/* STEP 1 - PROFILE COMPLETION */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col items-center mb-4">
                  <div className="p-4 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/20 mb-4">
                    <User size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Complete Your Profile
                  </h2>
                  <p className="text-gray-400 text-xs">
                    Tell us about your football profile
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DarkSelect
                    label="Playing Position"
                    name="playing_position"
                    register={register}
                    rules={{ required: "Playing position is required" }}
                    error={errors.playing_position?.message}
                    options={[
                      { label: "Forward", value: "forward" },
                      { label: "Midfielder", value: "midfielder" },
                      { label: "Defender", value: "defender" },
                      { label: "Goalkeeper", value: "goalkeeper" },
                    ]}
                  />
                  <DarkSelect
                    label="Preferred Foot"
                    name="preferred_foot"
                    register={register}
                    rules={{ required: "Preferred foot is required" }}
                    error={errors.preferred_foot?.message}
                    options={[
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                      { label: "Both", value: "both" },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DarkInput
                    label="Height (cm)"
                    name="height"
                    type="number"
                    register={register}
                    rules={{ required: "Height is required" }}
                    error={errors.height?.message}
                    placeholder="175"
                  />
                  <DarkInput
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    register={register}
                    rules={{ required: "Weight is required" }}
                    error={errors.weight?.message}
                    placeholder="70"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DarkInput
                    label="City"
                    name="city"
                    register={register}
                    rules={{ required: "City is required" }}
                    error={errors.city?.message}
                    placeholder="Barcelona"
                  />
                  <DarkSelect
                    label="Country"
                    name="country"
                    register={register}
                    rules={{ required: "Country is required" }}
                    error={errors.country?.message}
                    options={countries}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-gray-300 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-[2] py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 - SPORTS COMMITMENT */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col items-center mb-4">
                  <div className="p-4 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/20 mb-4">
                    <Trophy size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Sports Commitment
                  </h2>
                  <p className="text-gray-400 text-xs">
                    Tell us about your current club situation
                  </p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                  <AlertCircle size={20} className="text-blue-400 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                      Required Information
                    </h4>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      These details are mandatory to complete your registration
                      and help clubs understand your availability.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <DarkInput
                    label="Current Club / Academy"
                    name="current_club_academy"
                    register={register}
                    rules={{ required: "Current club or 'None' is required" }}
                    error={errors.current_club_academy?.message}
                    placeholder="e.g. FC Barcelona Youth Academy or 'None' if free agent"
                    onChange={(e: any) => {
                      setClubSearch(e.target.value);
                      setShowClubSuggestions(true);
                      register("current_club_academy").onChange(e);
                    }}
                  />
                  {showClubSuggestions && filteredClubs.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[#0b1221] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {filteredClubs.map((club) => (
                        <button
                          key={club.id}
                          type="button"
                          onClick={() => {
                            setClubSearch(club.club_name);
                            setShowClubSuggestions(false);
                            control._names.mount.add("current_club_academy");
                            const input = document.getElementsByName(
                              "current_club_academy",
                            )[0] as HTMLInputElement;
                            if (input) {
                              input.value = club.club_name;
                              input.dispatchEvent(
                                new Event("input", { bubbles: true }),
                              );
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                        >
                          {club.club_logo ? (
                            <img
                              src={club.club_logo}
                              alt={club.club_name}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-400">
                              ?
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm text-white font-medium">
                              {club.club_name}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase">
                              {club.location}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <DarkSelect
                  label="Type of Commitment"
                  name="type_of_commitment"
                  register={register}
                  rules={{ required: "Type of commitment is required" }}
                  error={errors.type_of_commitment?.message}
                  options={[
                    { label: "Academy Player", value: "academy_player" },
                    {
                      label: "Youth / Nursery Player",
                      value: "youth_nursery_player",
                    },
                    {
                      label: "Amateur Club Player",
                      value: "amateur_club_player",
                    },
                    {
                      label: "Semi-Professional Player",
                      value: "semi_professional_player",
                    },
                    {
                      label: "Professional Player",
                      value: "professional_player",
                    },
                    { label: "Free Agent", value: "free_agent" },
                  ]}
                />
                <DarkInput
                  label="Contract Valid Until"
                  name="contract_valid_until"
                  type="date"
                  register={register}
                  rules={{ 
                    required: "Contract validity date is required",
                    validate: (value: string) => {
                       const date = new Date(value);
                       const today = new Date();
                       today.setHours(0,0,0,0);
                       if (date < today) return "Contract date cannot be in the past";
                       return true;
                    }
                  }}
                  error={errors.contract_valid_until?.message}
                  placeholder="dd/mm/yyyy"
                  icon={<Calendar size={16} />}
                  value={watch("contract_valid_until")}
                />
                <p className="text-[10px] text-gray-500 pl-1 -mt-4">
                  If you're a free agent, select today's date or a future date
                </p>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-gray-300 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-[2] py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 - PARENT CONSENT (MINOR ONLY) */}
            {step === 3 && isMinor && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col items-center mb-4">
                  <div className="p-4 bg-linear-to-br from-cyan-500 to-indigo-600 rounded-full shadow-lg shadow-cyan-500/20 mb-4">
                    <User size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Parent / Guardian Consent
                  </h2>
                  <p className="text-gray-400 text-xs">
                    Required for players under 18 years old
                  </p>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle size={18} />
                    <h4 className="text-sm font-bold uppercase tracking-wider">
                      Registration Blocked
                    </h4>
                  </div>
                  <p className="text-white text-xs font-semibold">
                    You are under 18 years old.{" "}
                    <span className="text-gray-400 font-normal">
                      To continue registration, parent or guardian must provide
                      the following information consent.
                    </span>
                  </p>

                  <div className="bg-[#141b2b] p-4 rounded-xl space-y-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Required to proceed:
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Parent/Guardian First Name",
                        "Parent/Guardian Last Name",
                        "Parent/Guardian ID Number",
                        "Parent/Guardian Digital Signature",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-[10px] text-gray-300 font-medium"
                        >
                          <div className="w-4 h-4 rounded-full border border-red-500 flex items-center justify-center text-red-500 text-[8px] font-bold">
                            X
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-red-400 text-[10px] italic flex items-center gap-2 px-1">
                    <AlertCircle size={12} />
                    You cannot complete registration without parent/guardian
                    consent.
                  </p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                  <AlertCircle
                    size={16}
                    className="text-blue-400 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <h4 className="text-blue-400 text-[11px] font-semibold">
                      Instructions for Parent/Guardian
                    </h4>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      Please ask your parent or legal guardian to sit with you
                      and complete the following fields. They will need their
                      identification document and must provide a digital
                      signature.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DarkInput
                    label="Parent/Guardian First Name"
                    name="parent_guardian_first_name"
                    register={register}
                    rules={{ required: isMinor ? "Parent's first name is required" : false }}
                    error={errors.parent_guardian_first_name?.message}
                    icon={<User size={14} />}
                    placeholder="Enter parent's first name"
                  />
                  <DarkInput
                    label="Parent/Guardian Last Name"
                    name="parent_guardian_last_name"
                    register={register}
                    rules={{ required: isMinor ? "Parent's last name is required" : false }}
                    error={errors.parent_guardian_last_name?.message}
                    icon={<User size={14} />}
                    placeholder="Enter parent's last name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DarkInput
                    label="Parent/Guardian ID Number"
                    name="parent_id_number"
                    register={register}
                    rules={{ required: isMinor ? "Parent's ID number is required" : false }}
                    error={errors.parent_id_number?.message}
                    placeholder="National ID / Passport number"
                  />
                  <DarkInput
                    label="Parent/Guardian Email Address"
                    name="parent_guardian_email"
                    register={register}
                    rules={{ 
                      required: isMinor ? "Parent's email is required" : false,
                      pattern: isMinor ? {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      } : false
                    }}
                    error={errors.parent_guardian_email?.message}
                    icon={<Mail size={14} />}
                    placeholder="guardian@example.com"
                  />
                </div>
                <p className="text-[10px] text-gray-500 pl-1 -mt-4 italic">
                  Required for identity verification and legal compliance
                </p>

                <Controller
                  name="parent_guardian_digital_signature"
                  control={control}
                  rules={{
                    required:
                      "Parent/Guardian signature is required for minors",
                  }}
                  render={({ field }) => (
                    <SignatureField
                      label="Parent/Guardian Digital Signature"
                      onChange={field.onChange}
                      error={errors.parent_guardian_digital_signature?.message}
                    />
                  )}
                />

                <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Shield size={16} />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider">
                      Parent/Guardian Declaration
                    </h4>
                  </div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    By providing the above information and signature, I confirm
                    that I am the parent or legal guardian of{" "}
                    <span className="text-white font-bold">
                      {formValues.first_name || "..."}{" "}
                      {formValues.last_name || ""}
                    </span>{" "}
                    and I give consent for their registration on the NextGen
                    Pros platform.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-gray-300 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-[2] py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Continue
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 - PRIVACY & CONSENT */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col items-center mb-4">
                  <div className="p-4 bg-linear-to-br from-cyan-400 to-blue-600 rounded-full shadow-lg shadow-cyan-400/20 mb-4">
                    <Shield size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Privacy & Consent
                  </h2>
                  <p className="text-gray-400 text-xs">
                    Review and accept our terms to continue
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
                  <h4 className="text-white text-sm font-bold uppercase tracking-widest">
                    Data Processing & Publishing Consent
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    By proceeding, you agree that NextGen Pros may:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Process and store your personal information securely",
                      "Display your profile information to clubs, scouts, and academies",
                      "Publish your photos and videos on your player profile",
                      "Use your content for platform marketing purposes (with attribution)",
                      "Share your performance statistics with interested parties",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[11px] text-gray-300 transition-all"
                      >
                        <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <ChevronRight size={10} className="text-cyan-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-gray-500 text-[10px] leading-relaxed pt-2">
                    You can manage your privacy settings and revoke consent at
                    any time from your account settings.
                  </p>

                  <div className="pt-4">
                    <label className="group flex items-center gap-4 p-5 bg-[#141b2b] border border-white/5 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all duration-300">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          {...register("accept_privacy", { required: true })}
                          className="peer h-5 w-5 appearance-none rounded-md border border-white/20 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer"
                        />
                        <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white left-1">
                          <svg
                            className="w-3 h-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="4"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-300 font-medium select-none">
                        I consent to NextGen Pros processing and publishing my
                        information, photos, and videos for profile and
                        marketing purposes.
                      </span>
                    </label>
                    {errors.accept_privacy && (
                      <p className="text-red-500 text-[10px] mt-2 ml-2">
                        You must accept the terms to proceed
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                  <AlertCircle
                    size={16}
                    className="text-blue-400 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <h4 className="text-blue-400 text-[11px] font-semibold">
                      Your Privacy Matters
                    </h4>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      We are committed to protecting your data. Read our{" "}
                      <Link
                        href="/privacy"
                        className="text-cyan-400 hover:underline"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/terms"
                        className="text-cyan-400 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      for more details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-gray-300 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] py-4 bg-linear-to-r from-emerald-500 to-green-600 border border-emerald-400/20 rounded-2xl text-white font-bold hover:from-emerald-400 hover:to-green-500 transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    {isLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        <FileText size={18} />
                        Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Error display if any required fields are missing before continue (matching yellow text in figma) */}
          {Object.keys(errors).length > 0 && step > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-amber-400">
              <AlertCircle size={14} />
              <span className="text-[10px] font-medium">
                Please complete all required fields to continue
              </span>
            </div>
          )}
        </div>

        {/* Footer Links - Only for Step 0 */}
        {step === 0 && (
          <div className="mt-10 text-center animate-in fade-in duration-1000">
            <p className="text-[10px] text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-cyan-400 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerRegisterForm;
