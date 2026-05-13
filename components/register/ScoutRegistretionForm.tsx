"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { showRegistrationError } from "@/lib/registrationErrors";
import { useRegisterScoutMutation } from "@/redux/features/auth/scoutRegistretionApi";
import { ScoutRegisterPayload } from "@/types/scout";
import DarkInput from "../reuseable/DarkInput";
import DarkPhoneInput from "../reuseable/DarkPhoneInput";
import DarkSelect from "../reuseable/DarkSelect";
import StepIndicator from "../reuseable/StepIndicator";
import { countries } from "@/constants/countries";

import {
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  Calendar,
  Shield,
  Briefcase,
  MapPin,
  Trophy,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { DataChip } from "../reuseable/DataChip";

interface FormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;

  license_type: string;
  license_number: string;
  agency_name: string;
  agency_affiliation: string;

  specialization: string[];
  primary_scouting_regions: string[];
  secondary_scouting_regions: string[];
  age_group_focus: string[];
  position_focus: string[];
  languages_spoken: string[];

  players_discovered: string;
  contracts_signed: string;
  notable_discoveries: string;
  club_affiliations: string;

  scout_license_document?: string;
  government_issued_id?: string;

  legal_agreement_accepted: boolean;
  code_of_conduct_accepted: boolean;
}

const ScoutRegistretionForm = () => {
  const [step, setStep] = useState(0);
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
      specialization: [],
      primary_scouting_regions: [],
      secondary_scouting_regions: [],
      age_group_focus: [],
      position_focus: [],
      languages_spoken: [],
    },
  });

  const [registerScout, { isLoading }] = useRegisterScoutMutation();

  const formValues = watch();

  const canProceedStep0 = !!(
    formValues.first_name &&
    formValues.last_name &&
    formValues.email &&
    formValues.phone_number &&
    formValues.password &&
    formValues.confirm_password &&
    formValues.date_of_birth &&
    formValues.nationality
  );

  const canProceedStep1 = !!(
    formValues.license_type &&
    formValues.license_number &&
    formValues.agency_name &&
    formValues.agency_affiliation &&
    formValues.specialization?.length > 0
  );

  const canProceedStep2 = !!(
    formValues.primary_scouting_regions?.length > 0 &&
    formValues.age_group_focus?.length > 0 &&
    formValues.position_focus?.length > 0 &&
    formValues.languages_spoken?.length > 0
  );

  const canProceedStep3 = !!(
    formValues.players_discovered && formValues.contracts_signed
  );

  const handleNextStep = async () => {
    if (step === 0) {
      if (formValues.password !== formValues.confirm_password) {
        toast.error("Passwords do not match");
        return;
      }
      const valid = await trigger([
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "password",
        "confirm_password",
        "date_of_birth",
        "nationality",
      ]);
      if (valid && canProceedStep0) setStep(1);
    } else if (step === 1) {
      const valid = await trigger([
        "license_type",
        "license_number",
        "agency_name",
        "agency_affiliation",
        "specialization",
      ]);
      if (valid && canProceedStep1) setStep(2);
    } else if (step === 2) {
      const valid = await trigger([
        "primary_scouting_regions",
        "secondary_scouting_regions",
        "age_group_focus",
        "position_focus",
        "languages_spoken",
      ]);
      if (valid && canProceedStep2) setStep(3);
    } else if (step === 3) {
      const valid = await trigger([
        "players_discovered",
        "contracts_signed",
        "notable_discoveries",
        "club_affiliations",
      ]);
      if (valid && canProceedStep3) setStep(4);
    }
  };

  const handleBackStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    const payload: ScoutRegisterPayload = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      nationality: data.nationality,
      phone_number: data.phone_number ? data.phone_number.replace(/\s+/g, "") : "",
      license_type: data.license_type,
      license_number: data.license_number,
      agency_name: data.agency_name,
      agency_affiliation: data.agency_affiliation,
      specialization: data.specialization.map(s => s.toLowerCase().replace(/\s+/g, "_")),
      primary_scouting_regions: data.primary_scouting_regions.map(r => r.toLowerCase()),
      secondary_scouting_regions: data.secondary_scouting_regions.map(r => r.toLowerCase()),
      age_group_focus: data.age_group_focus, // Already matches format e.g. "U-16"
      position_focus: data.position_focus.map(p => p.toLowerCase()),
      languages_spoken: data.languages_spoken.map(l => l.toLowerCase()),
      players_discovered: data.players_discovered,
      contracts_signed: data.contracts_signed,
      notable_discoveries: data.notable_discoveries,
      club_affiliations: data.club_affiliations,
      scout_license_document: null, // Hardcoded to null as per Postman example
      government_issued_id: null, // Hardcoded to null as per Postman example
      legal_agreement_accepted: data.legal_agreement_accepted,
    };

    try {
      await registerScout(payload).unwrap();

      toast.success(
        "Registration successful! Please check your email for verification.",
        {
          duration: 4000,
        },
      );

      reset();
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      console.error("Scout registration failed:", error);
      await showRegistrationError(error, {
        onGoToLogin: () => router.push("/login"),
      });
    }
  };

  const stepLabels = [
    { num: 1, label: "Basic" },
    { num: 2, label: "Professional" },
    { num: 3, label: "Scouting Focus" },
    { num: 4, label: "Legal" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-2xl z-10">
        {/* Header Section (Logo + Title) */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link href="/">
            <Image
              src="/images/banner-log.png"
              alt="NextGen Pros"
              width={120}
              height={120}
              className="mb-6 hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Join as Scout/Agent
          </h1>
          <p className="text-gray-400 text-sm">
            Register as a professional scout or agent
          </p>
        </div>

        <div className="bg-[#0b1221]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative flex flex-col max-h-[85vh] md:max-h-[80vh]">
          {step > 0 && (
            <div className="mb-6 shrink-0">
              <StepIndicator step={step} isMinor={false} />
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {/* STEP 0 - INITIAL ACCOUNT CREATION */}
              {step === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
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
                        if (date.getFullYear() < 1920) return "Invalid date";
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
                        const number = value.split(" ")[1] || "";
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
                    placeholder="scout@example.com"
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
                </div>
              )}

              {/* STEP 1 - PROFESSIONAL CREDENTIALS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="p-4 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/20 mb-4">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Professional Credentials
                    </h2>
                    <p className="text-gray-400 text-xs text-center">
                      Tell us about your professional qualifications
                    </p>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                    <AlertCircle size={20} className="text-blue-400 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-blue-400 text-[11px] font-semibold uppercase tracking-wider">
                        Professional Verification
                      </h4>
                      <p className="text-gray-400 text-[10px] leading-relaxed">
                        This information will be verified to ensure the
                        credibility of our scouting network.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <DarkInput
                      label="License Type"
                      name="license_type"
                      register={register}
                      rules={{ required: "License type is required" }}
                      error={errors.license_type?.message}
                      placeholder="Select License Type"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DarkInput
                        label="License Number (if applicable)"
                        name="license_number"
                        register={register}
                        rules={{ required: "License number is required" }}
                        error={errors.license_number?.message}
                        placeholder="e.g. FIFA-12345"
                      />
                      <DarkInput
                        label="Agency Name (if applicable)"
                        name="agency_name"
                        register={register}
                        rules={{ required: "Agency name or 'Independent' is required" }}
                        error={errors.agency_name?.message}
                        placeholder="Independent or Agency name"
                      />
                    </div>
                    <DarkInput
                      label="Agency Affiliation"
                      name="agency_affiliation"
                      register={register}
                      rules={{ required: "Agency affiliation is required" }}
                      error={errors.agency_affiliation?.message}
                      placeholder="Select Affiliation"
                    />

                    <div className="space-y-3">
                      <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                        Specialization * (Select all that apply)
                      </label>
                      <Controller
                        name="specialization"
                        control={control}
                        rules={{ required: "Please select at least one specialization" }}
                        render={({ field }) => (
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Youth Scouting",
                              "Professional Scouting",
                              "International Scouting",
                              "Technical Analysis",
                              "Performance Analysis",
                              "Player Representation",
                            ].map((opt) => (
                              <DataChip
                                key={opt}
                                label={opt}
                                selected={field.value?.includes(opt)}
                                onToggle={() => {
                                  const current = field.value || [];
                                  if (current.includes(opt)) {
                                    field.onChange(
                                      current.filter((i: string) => i !== opt),
                                    );
                                  } else {
                                    field.onChange([...current, opt]);
                                  }
                                }}
                              />
                            ))}
                          </div>
                        )}
                      />
                      {errors.specialization && (
                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                          {errors.specialization.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 - SCOUTING FOCUS AREAS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="p-4 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/20 mb-4">
                      <MapPin size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Scouting Focus Areas
                    </h2>
                    <p className="text-gray-400 text-xs text-center">
                      Define your scouting regions and target profiles
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Primary Regions */}
                    <div className="space-y-3">
                      <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Globe size={12} /> Primary Scouting Regions * (Where
                        you actively scout)
                      </label>
                      <Controller
                        name="primary_scouting_regions"
                        control={control}
                        rules={{ required: "Please select at least one primary region" }}
                        render={({ field }) => (
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              "Spain",
                              "England",
                              "Germany",
                              "France",
                              "Italy",
                              "Portugal",
                              "Netherlands",
                              "Brazil",
                              "Argentina",
                              "USA",
                              "Africa",
                              "Asia",
                            ].map((opt) => (
                              <DataChip
                                key={opt}
                                label={opt}
                                selected={field.value?.includes(opt)}
                                onToggle={() => {
                                  const current = field.value || [];
                                  if (current.includes(opt))
                                    field.onChange(
                                      current.filter((i: string) => i !== opt),
                                    );
                                  else field.onChange([...current, opt]);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {/* Age Group Focus */}
                    <div className="space-y-3">
                      <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                        Age Group Focus *
                      </label>
                      <Controller
                        name="age_group_focus"
                        control={control}
                        rules={{ required: "Please select at least one age group" }}
                        render={({ field }) => (
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              "U-12",
                              "U-14",
                              "U-16",
                              "U-18",
                              "U-21",
                              "U-23",
                              "Senior",
                              "All Ages",
                            ].map((opt) => (
                              <DataChip
                                key={opt}
                                label={opt}
                                selected={field.value?.includes(opt)}
                                onToggle={() => {
                                  const current = field.value || [];
                                  if (current.includes(opt))
                                    field.onChange(
                                      current.filter((i: string) => i !== opt),
                                    );
                                  else field.onChange([...current, opt]);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {/* Position Focus */}
                    <div className="space-y-3">
                      <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                        Position Focus *
                      </label>
                      <Controller
                        name="position_focus"
                        control={control}
                        rules={{ required: "Please select at least one position focus" }}
                        render={({ field }) => (
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              "Goalkeeper",
                              "Defender",
                              "Midfielder",
                              "Forward",
                              "Winger",
                              "Striker",
                              "All Positions",
                            ].map((opt) => (
                              <DataChip
                                key={opt}
                                label={opt}
                                selected={field.value?.includes(opt)}
                                onToggle={() => {
                                  const current = field.value || [];
                                  if (current.includes(opt))
                                    field.onChange(
                                      current.filter((i: string) => i !== opt),
                                    );
                                  else field.onChange([...current, opt]);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                      <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Globe size={12} /> Languages Spoken (Helpful for
                        scouting)
                      </label>
                      <Controller
                        name="languages_spoken"
                        control={control}
                        rules={{ required: "Please select at least one language" }}
                        render={({ field }) => (
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              "English",
                              "Spanish",
                              "Portuguese",
                              "French",
                              "German",
                              "Italian",
                              "Dutch",
                              "Arabic",
                              "Other",
                            ].map((opt) => (
                              <DataChip
                                key={opt}
                                label={opt}
                                selected={field.value?.includes(opt)}
                                onToggle={() => {
                                  const current = field.value || [];
                                  if (current.includes(opt))
                                    field.onChange(
                                      current.filter((i: string) => i !== opt),
                                    );
                                  else field.onChange([...current, opt]);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 - EXPERIENCE & TRACK RECORD */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="p-4 bg-linear-to-br from-cyan-400 to-indigo-600 rounded-full shadow-lg shadow-cyan-400/20 mb-4">
                      <Trophy size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Experience & Track Record
                    </h2>
                    <p className="text-gray-400 text-xs text-center">
                      Share your scouting achievements
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DarkInput
                      label="Players Discovered *"
                      name="players_discovered"
                      register={register}
                      rules={{ required: "Please enter number of players discovered" }}
                      error={errors.players_discovered?.message}
                      placeholder="e.g. 5-10"
                    />
                    <DarkInput
                      label="Contracts Signed *"
                      name="contracts_signed"
                      register={register}
                      rules={{ required: "Please enter number of contracts signed" }}
                      error={errors.contracts_signed?.message}
                      placeholder="e.g. 3"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                        Notable Discoveries (Optional)
                      </label>
                      <textarea
                        {...register("notable_discoveries")}
                        className="w-full bg-[#050B14]/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 h-28 custom-scrollbar resize-none"
                        placeholder="List any notable players you've discovered or worked with"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                        Club Affiliations (Optional)
                      </label>
                      <textarea
                        {...register("club_affiliations")}
                        className="w-full bg-[#050B14]/80 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 h-28 custom-scrollbar resize-none"
                        placeholder="List clubs you've worked with or have relationships with"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 - DOCUMENTS & LEGAL */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="p-4 bg-linear-to-br from-cyan-400 to-blue-600 rounded-full shadow-lg shadow-cyan-400/20 mb-4">
                      <Shield size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Verification & Legal
                    </h2>
                    <p className="text-gray-400 text-xs text-center">
                      Review and finalize your registration
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Document Upload Placeholders */}
                    <div className="p-6 bg-[#141b2b] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center gap-3 relative overflow-hidden group">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            toast.success(`Attached ${file.name}`);
                            // Ideally we upload this file here and set the URL in the form
                            // For now, setting a placeholder name since it's a string field
                            control._formValues.scout_license_document =
                              file.name;
                          }
                        }}
                      />
                      <Upload
                        size={24}
                        className="text-cyan-400 group-hover:-translate-y-1 transition-transform"
                      />
                      <div className="text-center">
                        <p className="text-xs text-white font-semibold flex items-center gap-2">
                          Upload License/Certification
                          {watch("scout_license_document") && (
                            <CheckCircle size={14} className="text-green-400" />
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {watch("scout_license_document") ||
                            "PDF, JPG, PNG (Max 10MB)"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-5 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold rounded-full group-hover:bg-cyan-500 group-hover:text-black transition-all"
                      >
                        {watch("scout_license_document")
                          ? "Change File"
                          : "Choose File"}
                      </button>
                    </div>

                    <div className="p-6 bg-[#141b2b] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center gap-3 relative overflow-hidden group">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            toast.success(`Attached ${file.name}`);
                            control._formValues.government_issued_id =
                              file.name;
                          }
                        }}
                      />
                      <Upload
                        size={24}
                        className="text-cyan-400 group-hover:-translate-y-1 transition-transform"
                      />
                      <div className="text-center">
                        <p className="text-xs text-white font-semibold flex items-center gap-2">
                          Upload Government-issued ID *
                          {watch("government_issued_id") && (
                            <CheckCircle size={14} className="text-green-400" />
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {watch("government_issued_id") ||
                            "Passport, National ID, or Driver's License"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-5 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold rounded-full group-hover:bg-cyan-500 group-hover:text-black transition-all"
                      >
                        {watch("government_issued_id")
                          ? "Change File"
                          : "Choose File"}
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
                      <h4 className="text-white text-sm font-bold uppercase tracking-widest">
                        Legal Agreement & Code of Conduct
                      </h4>

                      <div className="space-y-3">
                        <label className="group flex items-center gap-4 p-4 bg-[#141b2b] border border-white/5 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all">
                          <input
                            type="checkbox"
                            {...register("legal_agreement_accepted", {
                              required: true,
                            })}
                            className="peer h-5 w-5 appearance-none rounded-md border border-white/20 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all"
                          />
                          <span className="text-[11px] text-gray-300 select-none">
                            I consent to NextGen Pros processing and publishing
                            my professional information.
                          </span>
                        </label>

                        <label className="group flex items-center gap-4 p-4 bg-[#141b2b] border border-white/5 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all">
                          <input
                            type="checkbox"
                            {...register("code_of_conduct_accepted", {
                              required: true,
                            })}
                            className="peer h-5 w-5 appearance-none rounded-md border border-white/20 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all"
                          />
                          <span className="text-[11px] text-gray-300 select-none">
                            I agree to uphold professional standards and comply
                            with all regulations.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Actions Area */}
            <div className="pt-6 shrink-0 bg-[#0b1221]/80 backdrop-blur-sm mt-2 border-t border-white/5">
              <div className="flex flex-col gap-4">
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-4 bg-linear-to-r from-[#00E5FF] to-[#00A3FF] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <User size={18} />
                    Create Account
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-gray-300 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                    {step === 4 ? (
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
                    ) : (
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
                    )}
                  </div>
                )}

                {/* Error display if any required fields are missing before continue */}
                {Object.keys(errors).length > 0 && step > 0 && (
                  <div className="flex items-center justify-center gap-2 text-amber-400 animate-in fade-in duration-300">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-medium">
                      Please complete all required fields to continue
                    </span>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Login Redirect (Mobile only or extra padding) */}
          {step === 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-xs">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:underline">
                  Log in here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Home Redirect */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs"
          >
            <ChevronLeft size={14} />
            Back to role selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScoutRegistretionForm;
