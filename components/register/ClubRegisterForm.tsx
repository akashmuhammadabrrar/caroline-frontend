"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { showRegistrationError } from "@/lib/registrationErrors";
import DarkInput from "../reuseable/DarkInput";
import DarkPhoneInput from "../reuseable/DarkPhoneInput";
import DarkSelect from "../reuseable/DarkSelect";
import StepIndicator from "../reuseable/StepIndicator";
import { countries } from "@/constants/countries";
import { useRegisterClubMutation } from "@/redux/features/auth/clubRegistretaionApi";
import { ClubRegisterPayload } from "@/types/club";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Lock, 
  Calendar, 
  Hash, 
  User, 
  Briefcase, 
  Trophy, 
  Users, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileText
} from "lucide-react";
import Image from "next/image";
import { DataChip } from "../reuseable/DataChip";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

interface FormData {
  email: string;
  password: string;
  confirm_password: string;

  organization_name: string;
  organization_type: string;
  country: string;
  city: string;
  website: string;
  phone_number: string;
  full_address: string;
  postal_code: string;
  established_year: string;
  registration_number: string;
  tax_id: string;

  contact_full_name: string;
  contact_role_position: string;
  contact_email: string;
  contact_phone_number: string;

  number_of_training_fields: string;
  additional_facilities: string[];
  age_groups_work_with: string[];
  training_programs: string[];

  club_website: string;
  facebook: string;
  instagram: string;
  twitter: string;

  official_verification_documents?: string;
  club_academy_logo?: string;

  data_processing_consent: boolean;
  terms_acceptance: boolean;
}

const ClubRegisterForm = () => {
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
      additional_facilities: [],
      age_groups_work_with: [],
      training_programs: [],
    }
  });

  const [registerClub, { isLoading }] = useRegisterClubMutation();

  const formValues = watch();

  const canProceedStep0 = !!(
     formValues.organization_name &&
     formValues.organization_type &&
     formValues.country &&
     formValues.city &&
     formValues.phone_number &&
     formValues.email &&
     formValues.password &&
     formValues.confirm_password
  );

  const canProceedStep1 = !!(
    formValues.full_address &&
    formValues.postal_code &&
    formValues.established_year &&
    formValues.registration_number
  );

  const canProceedStep2 = !!(
    formValues.contact_full_name &&
    formValues.contact_role_position &&
    formValues.contact_email &&
    formValues.contact_phone_number
  );

  const canProceedStep3 = !!(
    formValues.number_of_training_fields &&
    formValues.age_groups_work_with?.length > 0 &&
    formValues.training_programs?.length > 0
  );

  const handleNextStep = async () => {
    if (step === 0) {
      if (formValues.password !== formValues.confirm_password) {
        toast.error("Passwords do not match");
        return;
      }
      const valid = await trigger([
        "organization_name",
        "organization_type",
        "country",
        "city",
        "phone_number",
        "email",
        "password",
        "confirm_password",
      ]);
      if (valid && canProceedStep0) setStep(1);
    } else if (step === 1) {
      const valid = await trigger([
        "full_address",
        "postal_code",
        "established_year",
        "registration_number",
      ]);
      if (valid && canProceedStep1) setStep(2);
    } else if (step === 2) {
      const valid = await trigger([
        "contact_full_name",
        "contact_role_position",
        "contact_email",
        "contact_phone_number",
      ]);
      if (valid && canProceedStep2) setStep(3);
    } else if (step === 3) {
      const valid = await trigger([
        "number_of_training_fields",
        "age_groups_work_with",
        "training_programs",
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
    const payload: ClubRegisterPayload = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      organization_name: data.organization_name,
      organization_type: data.organization_type,
      country: data.country,
      city: data.city,
      website: data.website,
      phone_number: data.phone_number,
      full_address: data.full_address,
      postal_code: data.postal_code,
      established_year: Number(data.established_year),
      registration_number: data.registration_number,
      tax_id: data.tax_id || "",
      contact_full_name: data.contact_full_name,
      contact_role_position: data.contact_role_position,
      contact_email: data.contact_email,
      contact_phone_number: data.contact_phone_number,
      number_of_training_fields: Number(data.number_of_training_fields),
      additional_facilities: data.additional_facilities,
      age_groups_work_with: data.age_groups_work_with,
      training_programs: data.training_programs,
      club_website: data.club_website || "",
      facebook: data.facebook || "",
      instagram: data.instagram || "",
      twitter: data.twitter || "",
      official_verification_documents:
        data.official_verification_documents || null,
      club_academy_logo: data.club_academy_logo || null,
      legal_terms_accepted: data.terms_acceptance, // Map UI field to payload field
    };

    try {
      await registerClub(payload).unwrap();

      toast.success(
         "Registration successful! Please check your email for verification.",
         { duration: 4000 }
      );

      reset();
      setStep(1);
      router.push("/login");
    } catch (error: unknown) {
      console.error("Club registration failed:", error);
      await showRegistrationError(error, {
        onGoToLogin: () => router.push("/login"),
      });
    }
  };

  const stepLabels = [
    { num: 1, label: "Organization Details" },
    { num: 2, label: "Primary Contact" },
    { num: 3, label: "Facilities" },
    { num: 4, label: "Verification" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-2xl z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link href="/">
             <Image src="/images/banner-log.png" alt="NextGen Pros" width={120} height={120} className="mb-6 hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Register Your Organization</h1>
          <p className="text-gray-400 text-sm">Join NextGen Pros as a club or academy</p>
        </div>

        <div className="bg-[#0b1221]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative flex flex-col max-h-[85vh] md:max-h-[80vh]">
          {step > 0 && (
            <div className="mb-6 shrink-0">
               <StepIndicator step={step} isMinor={false} stepsOverride={stepLabels} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              
              {/* STEP 0 - INITIAL ACCOUNT CREATION */}
              {step === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                  <DarkInput
                     label="Organization Name *"
                     name="organization_name"
                     register={register}
                     rules={{ required: "Organization name is required" }}
                     error={errors.organization_name?.message}
                     icon={<Building2 size={16} />}
                     placeholder="e.g., FC Barcelona Youth Academy"
                  />
                  <DarkSelect
                     label="Organization Type"
                     name="organization_type"
                     register={register}
                     rules={{ required: "Organization type is required" }}
                     error={errors.organization_type?.message}
                     icon={<Briefcase size={16} />}
                     options={[
                       { label: "Club", value: "club" },
                       { label: "Academy", value: "academy" },
                       { label: "Both", value: "both" },
                     ]}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <DarkSelect
                        label="Country"
                        name="country"
                        register={register}
                        rules={{ required: "Country is required" }}
                        error={errors.country?.message}
                        icon={<Globe size={16} />}
                        options={countries}
                     />
                     <DarkInput
                        label="City *"
                        name="city"
                        register={register}
                        rules={{ required: "City is required" }}
                        error={errors.city?.message}
                        icon={<MapPin size={16} />}
                        placeholder="Barcelona"
                     />
                  </div>
                     <DarkPhoneInput
                        label="Phone Number *"
                        name="phone_number"
                        control={control as any}
                        rules={{
                          required: "Phone number is required",
                          validate: (value: string) => {
                            const number = value.split(" ")[1] || "";
                            if (number.length < 7) return "Phone number is too short";
                            if (number.length > 15) return "Phone number cannot exceed 15 digits";
                            return true;
                          }
                        }}
                        error={errors.phone_number?.message}
                        icon={<Phone size={14} />}
                        placeholder="XXX XXX XXX"
                     />
                  <DarkInput
                     label="Website (Optional)"
                     name="website"
                     register={register}
                     error={errors.website?.message}
                     icon={<Globe size={16} />}
                     placeholder="https://yourclub.com"
                  />
                  <DarkInput
                     label="Official Email Address *"
                     name="email"
                     type="email"
                     register={register}
                     rules={{ 
                        required: "Official email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                     }}
                     error={errors.email?.message}
                     icon={<Mail size={16} />}
                     placeholder="contact@yourclub.com"
                  />
                  <p className="text-[10px] text-gray-500 -mt-4 ml-1">Use your organization's official email address</p>
                  
                  <DarkInput
                     label="Password *"
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
                     label="Confirm Password *"
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

              {/* STEP 1 - ORGANIZATION DETAILS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                   <div className="flex flex-col items-center mb-4">
                     <div className="p-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/20 mb-4">
                        <Building2 size={32} className="text-white" />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">Organization Details</h2>
                     <p className="text-gray-400 text-xs text-center">Tell us about your club or academy</p>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                     <AlertCircle size={20} className="text-blue-400 shrink-0" />
                     <div className="space-y-1">
                        <h4 className="text-blue-400 text-[11px] font-semibold uppercase tracking-wider">Official Information Required</h4>
                        <p className="text-gray-400 text-[10px] leading-relaxed">Please provide accurate official details for verification purposes. This information will be used to verify your organization's legitimacy.</p>
                     </div>
                  </div>

                  <DarkInput
                     label="Full Address *"
                     name="full_address"
                     register={register}
                     rules={{ required: "Full address is required" }}
                     error={errors.full_address?.message}
                     icon={<MapPin size={16} />}
                     placeholder="Street address, building number, district"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <DarkInput
                        label="Postal Code *"
                        name="postal_code"
                        register={register}
                        rules={{ required: "Postal code is required" }}
                        error={errors.postal_code?.message}
                        placeholder="08028"
                     />
                     <DarkInput
                        label="Established Year *"
                        name="established_year"
                        type="number"
                        register={register}
                        rules={{ required: "Established year is required" }}
                        error={errors.established_year?.message}
                        icon={<Calendar size={16} />}
                        placeholder="1899"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <DarkInput
                        label="Registration Number *"
                        name="registration_number"
                        register={register}
                        rules={{ required: "Registration number is required" }}
                        error={errors.registration_number?.message}
                        icon={<Hash size={16} />}
                        placeholder="Official registration #"
                     />
                     <DarkInput
                        label="Tax ID (Optional)"
                        name="tax_id"
                        register={register}
                        error={errors.tax_id?.message}
                        placeholder="Tax identification number"
                     />
                  </div>
                </div>
              )}

              {/* STEP 2 - PRIMARY CONTACT */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                   <div className="flex flex-col items-center mb-4">
                     <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20 mb-4">
                        <Users size={32} className="text-white" />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">Primary Contact Person</h2>
                     <p className="text-gray-400 text-xs text-center">Who should we contact regarding your organization?</p>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                     <AlertCircle size={20} className="text-amber-400 shrink-0" />
                     <div className="space-y-1">
                        <h4 className="text-amber-400 text-[11px] font-semibold uppercase tracking-wider">Important Contact Information</h4>
                        <p className="text-gray-400 text-[10px] leading-relaxed">This person will be the main point of contact for account management, player inquiries, and platform communications.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <DarkInput
                        label="Full Name *"
                        name="contact_full_name"
                        register={register}
                        rules={{ required: "Contact name is required" }}
                        error={errors.contact_full_name?.message}
                        icon={<User size={16} />}
                        placeholder="Contact person's full name"
                     />
                     <DarkInput
                        label="Role / Position *"
                        name="contact_role_position"
                        register={register}
                        rules={{ required: "Role/Position is required" }}
                        error={errors.contact_role_position?.message}
                        icon={<Briefcase size={16} />}
                        placeholder="Select Role"
                     />
                  </div>

                  <DarkInput
                     label="Email Address *"
                     name="contact_email"
                     type="email"
                     register={register}
                     rules={{ 
                        required: "Contact email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                     }}
                     error={errors.contact_email?.message}
                     icon={<Mail size={16} />}
                     placeholder="contact@yourclub.com"
                  />
                  <p className="text-[10px] text-gray-500 -mt-4 ml-1">This can be the same as your organization email</p>

                           <DarkPhoneInput
                              label="Contact Phone"
                              name="contact_phone_number"
                              control={control as any}
                              rules={{
                                required: "Contact phone number is required",
                                validate: (value: string) => {
                                  const number = value.split(" ")[1] || "";
                                  if (number.length < 7) return "Phone number is too short";
                                  if (number.length > 15) return "Phone number cannot exceed 15 digits";
                                  return true;
                                }
                              }}
                              error={errors.contact_phone_number?.message}
                              icon={<Phone size={14} />}
                              placeholder="XXX XXX XXX"
                           />           </div>
              )}

              {/* STEP 3 - FACILITIES & PROGRAMS */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                   <div className="flex flex-col items-center mb-4">
                     <div className="p-4 bg-linear-to-br from-blue-400 to-purple-600 rounded-full shadow-lg shadow-blue-400/20 mb-4">
                        <Trophy size={32} className="text-white" />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">Facilities & Programs</h2>
                     <p className="text-gray-400 text-xs text-center">Tell us about your facilities and training programs</p>
                  </div>

                  <DarkInput
                     label="Number of Training Fields/Pitches *"
                     name="number_of_training_fields"
                     type="number"
                     register={register}
                     rules={{ required: "Number of fields is required" }}
                     error={errors.number_of_training_fields?.message}
                     placeholder="Select"
                  />

                  {/* Additional Facilities */}
                  <div className="space-y-3">
                     <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">Additional Facilities</label>
                     <div className="space-y-2">
                        {[
                           { id: "indoor_training", title: "Indoor Training Facilities", desc: "Gymnasium, indoor courts, etc." },
                           { id: "medical_staff", title: "Medical Staff & Facilities", desc: "Physiotherapists, medical room, etc." }
                        ].map(facility => (
                           <label key={facility.id} className="group flex items-start gap-4 p-4 bg-[#141b2b] border border-white/5 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all">
                              <input 
                                 type="checkbox" 
                                 value={facility.id}
                                 {...register("additional_facilities")}
                                 className="peer mt-1 h-5 w-5 appearance-none rounded-md border border-white/20 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all shrink-0" 
                              />
                              <div>
                                 <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{facility.title}</p>
                                 <p className="text-[10px] text-gray-500">{facility.desc}</p>
                              </div>
                           </label>
                        ))}
                     </div>
                  </div>

                  {/* Age Groups */}
                  <div className="space-y-3">
                    <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">Age Groups You Work With * (Select all that apply)</label>
                    <Controller
                      name="age_groups_work_with"
                      control={control}
                      rules={{ required: "Please select at least one age group" }}
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-2">
                          {["U-8", "U-10", "U-12", "U-14", "U-16", "U-18", "U-21", "Senior"].map(opt => (
                            <DataChip
                              key={opt}
                              label={opt}
                              selected={field.value?.includes(opt)}
                              onToggle={() => {
                                const current = field.value || [];
                                if (current.includes(opt)) field.onChange(current.filter((i: string) => i !== opt));
                                else field.onChange([...current, opt]);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {/* Training Programs */}
                  <div className="space-y-3">
                     <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">Training Programs (Select all that apply)</label>
                     <div className="space-y-2">
                        {[
                           { id: "technical_skills", title: "Technical Skills", desc: "Ball control, passing, dribbling" },
                           { id: "tactical_training", title: "Tactical Training", desc: "Formations, game strategy" },
                           { id: "physical_conditioning", title: "Physical Conditioning", desc: "Fitness, strength, endurance" },
                           { id: "goalkeeper_training", title: "Goalkeeper Training", desc: "Specialized GK development" },
                           { id: "mental_coaching", title: "Mental Coaching", desc: "Psychology, motivation" },
                        ].map(program => (
                           <label key={program.id} className="group flex items-start gap-4 p-4 bg-[#141b2b] border border-white/5 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all">
                              <input 
                                 type="checkbox" 
                                 value={program.id}
                                 {...register("training_programs")}
                                 className="peer mt-1 h-5 w-5 appearance-none rounded-md border border-white/20 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all shrink-0" 
                              />
                              <div>
                                 <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{program.title}</p>
                                 <p className="text-[10px] text-gray-500">{program.desc}</p>
                              </div>
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/5">
                     <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1">Social Media & Website (Optional)</label>
                     <DarkInput
                        name="club_website"
                        register={register}
                        icon={<Globe size={16} color="#00E5FF" />}
                        placeholder="https://yourclub.com"
                     />
                     <DarkInput
                        name="facebook"
                        register={register}
                        icon={<FaFacebook size={16} color="#00E5FF" />}
                        placeholder="https://facebook.com/yourclub"
                     />
                     <DarkInput
                        name="instagram"
                        register={register}
                        icon={<FaInstagram size={16} color="#00E5FF" />}
                        placeholder="https://instagram.com/yourclub"
                     />
                     <DarkInput
                        name="twitter"
                        register={register}
                        icon={<FaTwitter size={16} color="#00E5FF" />}
                        placeholder="https://twitter.com/yourclub"
                     />
                  </div>
                </div>
              )}

              {/* STEP 4 - VERIFICATION & CONSENT */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                   <div className="flex flex-col items-center mb-4">
                     <div className="p-4 bg-linear-to-br from-cyan-400 to-blue-600 rounded-full shadow-lg shadow-cyan-400/20 mb-4">
                        <CheckCircle size={32} className="text-white" />
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-2">Verification & Consent</h2>
                     <p className="text-gray-400 text-xs text-center">Upload verification documents and accept terms</p>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                     <AlertCircle size={20} className="text-amber-400 shrink-0" />
                     <div className="space-y-1">
                        <h4 className="text-amber-400 text-[11px] font-semibold uppercase tracking-wider">Verification Required</h4>
                        <p className="text-gray-400 text-[10px] leading-relaxed">To ensure platform quality, all clubs/academies must be verified. Please upload an official document proving your organization's legitimacy (business license, registration certificate, etc.).</p>
                     </div>
                  </div>

                  {/* Document Upload Placeholders */}
                  <div className="space-y-4">
                     <div>
                        <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1 block mb-2">Official Verification Document *</label>
                        <div className="p-6 bg-[#141b2b] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center gap-3 relative overflow-hidden group">
                           <input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                    toast.success(`Attached ${file.name}`);
                                    control._formValues.official_verification_documents = file.name;
                                 }
                              }}
                           />
                           <Upload size={24} className="text-cyan-400 group-hover:-translate-y-1 transition-transform" />
                           <div className="text-center">
                              <p className="text-sm text-white font-semibold flex items-center justify-center gap-2">
                                 Upload Verification Document
                                 {watch("official_verification_documents") && <CheckCircle size={14} className="text-green-400" />}
                              </p>
                              <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto mt-1">
                                 {watch("official_verification_documents") || "Business license, registration certificate, or official letter"}
                              </p>
                           </div>
                           <button type="button" className="px-5 py-2 mt-2 bg-[#00E5FF] text-black text-xs font-bold rounded-full hover:bg-cyan-400 transition-all">
                              {watch("official_verification_documents") ? "Change File" : "Choose File"}
                           </button>
                           <p className="text-[9px] text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                     </div>

                     <div>
                        <label className="text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-1 block mb-2">Club/Academy Logo *</label>
                        <div className="p-6 bg-[#141b2b] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center gap-3 relative overflow-hidden group">
                           <input 
                              type="file" 
                              accept=".jpg,.jpeg,.png"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                    toast.success(`Attached ${file.name}`);
                                    control._formValues.club_academy_logo = file.name;
                                 }
                              }}
                           />
                           <Upload size={24} className="text-cyan-400 group-hover:-translate-y-1 transition-transform" />
                           <div className="text-center">
                              <p className="text-sm text-white font-semibold flex items-center justify-center gap-2">
                                 Upload Your Logo
                                 {watch("club_academy_logo") && <CheckCircle size={14} className="text-green-400" />}
                              </p>
                              <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto mt-1">
                                 {watch("club_academy_logo") || "This will be displayed on your profile"}
                              </p>
                           </div>
                           <button type="button" className="px-5 py-2 mt-2 bg-[#00E5FF] text-black text-xs font-bold rounded-full hover:bg-cyan-400 transition-all">
                              {watch("club_academy_logo") ? "Change File" : "Choose File"}
                           </button>
                           <p className="text-[9px] text-gray-500">PNG, JPG, SVG (Recommended: 500x500px)</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-[#141b2b] border border-white/5 p-6 rounded-[2rem] space-y-4">
                     <h4 className="text-white text-sm font-bold">Legal Terms & Consent</h4>
                     
                     <div className="space-y-3">
                        <label className="group flex items-start gap-4 p-4 bg-[#0F1523] border border-white/5 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all">
                           <input type="checkbox" {...register("data_processing_consent", { required: true })} className="peer mt-0.5 h-4 w-4 appearance-none rounded border border-white/20 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all shrink-0" />
                           <span className="text-[11px] text-gray-300 leading-relaxed font-medium">
                              <strong className="text-white">Data Processing Consent:</strong> I consent to NextGen Pros processing and publishing our organization's information, photos, content for promo study and marketing.
                           </span>
                        </label>

                        <label className="group flex items-start gap-4 p-4 bg-[#0F1523] border border-white/5 rounded-2xl cursor-pointer hover:border-cyan-500/30 transition-all">
                           <input type="checkbox" {...register("terms_acceptance", { required: true })} className="peer mt-0.5 h-4 w-4 appearance-none rounded border border-white/20 bg-transparent checked:bg-cyan-500 checked:border-cyan-500 transition-all shrink-0" />
                           <span className="text-[11px] text-gray-300 leading-relaxed font-medium">
                              <strong className="text-white">Terms Acceptance:</strong> I confirm that I am authorized to represent this organization and accept the <Link href="/terms" className="text-cyan-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
                           </span>
                        </label>
                     </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                     <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                        <h4 className="text-blue-400 text-[11px] font-semibold uppercase tracking-wider">Verification Process</h4>
                        <p className="text-gray-400 text-[10px] leading-relaxed">After submission, our team will review your documents within 24-48 hours. You'll receive an email notification once your organization is verified and approved.</p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Actions Area */}
            <div className="pt-6 shrink-0 bg-[#0b1221]/80 backdrop-blur-sm mt-2 border-t border-white/5">
              <div className="flex flex-col gap-4">
                {step === 0 ? (
                  <>
                     <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-4 bg-linear-to-r from-[#00E5FF] to-[#00A3FF] text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2"
                     >
                        <User size={18} />
                        Create Account
                     </button>
                     
                     <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">or continue with</span>
                        <div className="flex-grow border-t border-white/5"></div>
                     </div>
                     
                     {/* <div className="grid grid-cols-2 gap-4">
                        <button type="button" className="py-3 bg-[#1A2235] border border-white/5 rounded-xl text-white text-xs font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                           <Image src="/images/google-icon.svg" alt="Google" width={16} height={16} />
                           Google
                        </button>
                        <button type="button" className="py-3 bg-[#1A2235] border border-white/5 rounded-xl text-white text-xs font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                           <Image src="/images/facebook-icon.svg" alt="Facebook" width={16} height={16} />
                           Facebook
                        </button>
                     </div> */}
                     
                     <p className="text-[9px] text-gray-500 text-center mt-2">
                        By creating an account, you agree to our <Link href="/terms" className="text-[#00E5FF]">Terms of Service</Link> and <Link href="/privacy" className="text-[#00E5FF]">Privacy Policy</Link>
                     </p>
                  </>
                ) : (
                  <div className="flex gap-4">
                    <button type="button" onClick={handleBackStep} className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-gray-300 font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                       <ChevronLeft size={18} />
                       Back
                    </button>
                    {step === 4 ? (
                      <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-linear-to-r from-emerald-500 to-green-600 border border-emerald-400/20 rounded-2xl text-white font-bold hover:from-emerald-400 hover:to-green-500 transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                         {isLoading ? "Processing..." : (
                           <>
                             <FileText size={18} />
                             Complete Registration
                           </>
                         )}
                      </button>
                    ) : (
                      <button type="button" onClick={handleNextStep} className="flex-[2] py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 group">
                         Continue
                         <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Error display if any required fields are missing before continue */}
                {(Object.keys(errors).length > 0 && step > 0) && (
                  <div className="flex items-center justify-center gap-2 text-amber-400 animate-in fade-in duration-300">
                     <AlertCircle size={14} />
                     <span className="text-[10px] font-medium">Please complete all required fields to continue</span>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Login Redirect */}
          {step === 0 && (
            <div className="mt-8 flex justify-center">
               <Link href="/register" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs">
                  <ChevronLeft size={14} />
                  Back to role selection
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubRegisterForm;
