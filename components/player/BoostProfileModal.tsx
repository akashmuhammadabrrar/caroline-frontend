/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  X,
  ChevronLeft,
  Zap,
  Star,
  Eye,
  Search,
  Award,
  Check,
  CreditCard,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

// RTK Query Hooks
import {
  useGetBoostPackagesQuery,
  useRequestBoostMutation,
  useProcessPaymentMutation,
  useValidatePromoMutation,
} from "@/redux/features/player/profileBoostingApi";
import { useGetMyProfileQuery } from "@/redux/features/player/playerProfileAndEdit/profileAndEditApi";

interface BoostProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoostProfileModal({
  isOpen,
  onClose,
}: BoostProfileModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null,
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [boostRequestId, setBoostRequestId] = useState<string | null>(null);

  // Queries
  const { data: profile } = useGetMyProfileQuery();
  const { data: packagesData, isLoading: isLoadingPackages } =
    useGetBoostPackagesQuery();
  const packages = packagesData?.boostPackages || [];

  // Selected Package Info
  const selectedPackage = packages.find((p: any) => p.id === selectedPackageId);

  // Mutations
  const [requestBoost, { isLoading: isRequesting }] = useRequestBoostMutation();
  const [processPayment, { isLoading: isProcessing }] =
    useProcessPaymentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  // Promo State
  const [promoCode, setPromoCode] = useState("");
  const [promoAmount, setPromoAmount] = useState<number>(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [validatePromo, { isLoading: isApplyingPromo }] = useValidatePromoMutation();

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPackageId(null);
      setStartDate("");
      setEndDate("");
      setBoostRequestId(null);
      setPromoCode("");
      setPromoAmount(0);
      setIsPromoApplied(false);
      setPromoError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handlers
  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !selectedPackage) return;
    setPromoError("");
    try {
      const res = await validatePromo({ code: promoCode, amount: parseFloat(String(selectedPackage.finalPrice || "0")), usage_type: "BOOSTING" }).unwrap();
      if (res.data?.discount_amount) {
        setPromoAmount(Number(res.data.discount_amount));
        setIsPromoApplied(true);
        toast.success("Promo code applied successfully!");
      }
    } catch (error: any) {
      setPromoError(error?.data?.message || "Invalid promo code");
      setPromoAmount(0);
      setIsPromoApplied(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedPackageId || !startDate || !endDate) {
      toast.error("Please select a package and valid date range.");
      return;
    }

    try {
      const response = await requestBoost({
        boostPackageId: selectedPackageId,
        startDate,
        endDate,
      }).unwrap();

      toast.success(response.message || "Boost request submitted.");
      setBoostRequestId(response.boostRequestId);
      setStep(2);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit boost request.");
    }
  };

  const onPaymentSubmit = async (data: any) => {
    if (!boostRequestId) return;

    try {
      const response = await processPayment({
        boostRequestId: boostRequestId,
        stripe_payment_method_id: "pm_card_visa",
        ...(isPromoApplied && promoCode ? { promo_code: promoCode } : {})
      }).unwrap();

      toast.success("Payment successful! Your profile is now boosted.");
      setStep(3);
    } catch (error: any) {
      toast.error(error?.data?.message || "Payment failed.");
    }
  };

  const renderBenefits = () => (
    <div className="space-y-4 text-sm mt-6">
      <div className="flex gap-3">
        <Star size={18} className="text-yellow-400 mt-0.5" />
        <div>
          <p className="font-bold text-white">Featured Placement</p>
          <p className="text-[#8B97B5] text-xs">
            Top position in directory listings
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Eye size={18} className="text-[#00E5FF] mt-0.5" />
        <div>
          <p className="font-bold text-white">4x More Visibility</p>
          <p className="text-[#8B97B5] text-xs">
            Increased profile views and engagement
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Search size={18} className="text-[#00E5FF] mt-0.5" />
        <div>
          <p className="font-bold text-white">Priority in Search</p>
          <p className="text-[#8B97B5] text-xs">
            Appear first in search results
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Award size={18} className="text-yellow-500 mt-0.5" />
        <div>
          <p className="font-bold text-white">Special Badge</p>
          <p className="text-[#8B97B5] text-xs">Featured badge on profile</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#080B1A] border border-[#1E2554] rounded-2xl shadow-2xl relative flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E2554]">
          <div className="flex items-center gap-4">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#11163C] hover:bg-[#1A2255] transition-colors border border-[#1E2554]"
              >
                <ChevronLeft size={16} className="text-gray-300" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black bg-linear-to-r from-[#00E5FF] to-[#B026FF] bg-clip-text text-transparent">
                Boost Your Profile
              </h2>
              <p className="text-[#8B97B5] text-sm">
                Feature your profile to increase visibility and engagement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#11163C] hover:bg-[#1A2255] transition-colors border border-[#1E2554] text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto min-h-[500px]">
          {/* LEFT COLUMN - Dynamic Steps */}
          <div className="flex-1 p-6 lg:border-r border-[#1E2554]">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Profile Target */}
                <div className="bg-[#11163C] border border-[#1E2554] rounded-xl p-4 flex items-center gap-4">
                  <h4 className="absolute text-xs font-bold text-[#8B97B5] -mt-12">
                    Boosting Profile For:
                  </h4>
                  <img
                    src={
                      profile?.profile_image ||
                      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500"
                    }
                    alt="Player Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#00E5FF]"
                  />
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {profile?.full_name || "John Doe"}
                    </h3>
                    <p className="text-sm text-[#00E5FF] capitalize">
                      {profile?.designation || "Forward"}
                    </p>
                  </div>
                </div>

                {/* Step 1: Packages */}
                <div>
                  <h3 className="text-white font-bold mb-4">
                    Step 1: Choose Boost Duration
                  </h3>
                  {isLoadingPackages ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-24 bg-[#11163C] animate-pulse rounded-xl border border-[#1E2554]"></div>
                      <div className="h-24 bg-[#11163C] animate-pulse rounded-xl border border-[#1E2554]"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packages.map((pkg: any) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPackageId === pkg.id
                              ? "border-[#00E5FF] bg-[#11163C]"
                              : "border-[#1E2554] bg-[#0A0D23] hover:border-[#3A4579]"
                          }`}
                        >
                          {pkg.discount > 0 && (
                            <span className="absolute -top-3 right-4 bg-[#00E564] text-black text-xs font-black px-2 py-1 rounded">
                              Save {pkg.discount}%
                            </span>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white text-lg">
                              {pkg.duration}
                            </span>
                            <span className="font-black text-[#00E5FF] text-2xl">
                              €{pkg.finalPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: Date Range */}
                <div>
                  <h3 className="text-white font-bold mb-4">
                    Step 2: Set Date Range
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8B97B5] mb-2 uppercase tracking-wide">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#11163C] border border-[#1E2554] text-white p-3.5 rounded-xl focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8B97B5] mb-2 uppercase tracking-wide">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#11163C] border border-[#1E2554] text-white p-3.5 rounded-xl focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard size={20} className="text-[#00E5FF]" />
                  <h3 className="text-white font-bold text-xl">
                    Payment Method
                  </h3>
                </div>

                <form
                  id="payment-form"
                  onSubmit={handleSubmit(onPaymentSubmit)}
                  className="space-y-8"
                >
                  <div className="bg-[#11163C] p-5 rounded-xl border border-[#1E2554] space-y-4">
                    <h4 className="text-sm font-bold text-white mb-2">
                      Card Information
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-[#8B97B5] mb-1.5 uppercase">
                        Card Number *
                      </label>
                      <div className="relative">
                        <input
                          disabled
                          placeholder="1234 5678 9012 3456"
                          className="w-full bg-[#080B1A] border border-[#1E2550] text-gray-500 p-3.5 pl-10 rounded-lg cursor-not-allowed"
                        />
                        <CreditCard
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#8B97B5] mb-1.5 uppercase">
                          Expiry Date *
                        </label>
                        <input
                          disabled
                          placeholder="MM/YY"
                          className="w-full bg-[#080B1A] border border-[#1E2550] text-gray-500 p-3.5 rounded-lg cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8B97B5] mb-1.5 uppercase">
                          CVV / CVC *
                        </label>
                        <input
                          disabled
                          placeholder="123"
                          className="w-full bg-[#080B1A] border border-[#1E2550] text-gray-500 p-3.5 rounded-lg cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#11163C] p-5 rounded-xl border border-[#1E2554] space-y-4">
                    <h4 className="text-sm font-bold text-white mb-2">
                      Billing Address
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#8B97B5] mb-1.5 uppercase">
                          Country / Region *
                        </label>
                        <input
                          {...register("country", { required: true })}
                          className="w-full bg-[#080B1A] border border-[#1E2550] text-white p-3.5 rounded-lg focus:border-[#00E5FF] focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8B97B5] mb-1.5 uppercase">
                          City *
                        </label>
                        <input
                          {...register("city", { required: true })}
                          className="w-full bg-[#080B1A] border border-[#1E2550] text-white p-3.5 rounded-lg focus:border-[#00E5FF] focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8B97B5] mb-1.5 uppercase">
                          Postal Code *
                        </label>
                        <input
                          {...register("postal", { required: true })}
                          className="w-full bg-[#080B1A] border border-[#1E2550] text-white p-3.5 rounded-lg focus:border-[#00E5FF] focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      {...register("terms", { required: true })}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-[#8B97B5]">
                      I agree to the{" "}
                      <span className="text-[#00E5FF] underline cursor-pointer">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="text-[#00E5FF] underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#04B5A3]">
                    <Lock size={14} /> Secure Payment &nbsp;|&nbsp; 256-bit SSL
                    Encrypted
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-[#04B5A3]/10 text-[#04B5A3] rounded-full flex items-center justify-center border-2 border-[#04B5A3]/30 animate-bounce">
                  <Check size={48} strokeWidth={3} />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Profile Boosted!
                  </h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Your payment was successful and your profile boost is now
                    active. You'll see increased visibility immediately.
                  </p>
                </div>
                <div className="bg-[#11163C] border border-cyan-400/20 rounded-2xl p-6 w-full max-w-md space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-widest">
                      Boost Request ID
                    </span>
                    <span className="text-cyan-400 font-mono">
                      #{boostRequestId?.split("-")[0]?.toUpperCase() || "NEW"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-widest">
                      Status
                    </span>
                    <span className="text-[#04B5A3] font-bold uppercase px-3 py-1 bg-[#04B5A3]/10 rounded-full tracking-wider">
                      Active
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full max-w-md py-4 rounded-xl bg-linear-to-r from-[#04B5A3] to-[#039d8f] text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_12px_24px_-8px_rgba(4,181,163,0.4)]"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Summary */}
          <div className="w-full lg:w-[400px] bg-[#0A0D23] p-8 flex flex-col justify-between">
            {/* Step 1 Visual */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-[#11163C] border border-[#1E2554] rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00E5FF]/20 blur-3xl rounded-full"></div>

                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#00E5FF] to-[#B026FF] flex items-center justify-center mx-auto mb-4 border-4 border-[#080B1A] shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                    <Zap size={28} className="text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-6">
                    Boost Summary
                  </h3>

                  <div className="space-y-4 text-sm mb-6">
                    <div className="flex justify-between items-center border-b border-[#1E2554] pb-4">
                      <span className="text-[#8B97B5]">Duration</span>
                      <span className="font-bold text-white">
                        {selectedPackage?.duration || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[#8B97B5]">Total Price</span>
                      <span className="font-black text-2xl text-[#00E5FF]">
                        €{Math.max(0, parseFloat(String(selectedPackage?.finalPrice || "0")) - promoAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2 text-left">
                    <label className="text-xs text-[#8B97B5] font-bold uppercase tracking-widest pl-1">Promo Code</label>
                    <div className="flex gap-2">
                      <input 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={isPromoApplied || !selectedPackageId}
                        placeholder={!selectedPackageId ? "Select a package first" : "Enter code"}
                        className={`flex-1 bg-[#080B1A] border ${promoError ? 'border-red-500' : 'border-[#1E2550]'} rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm`}
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!selectedPackageId || isPromoApplied || isApplyingPromo || !promoCode}
                        className="px-4 py-2 bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/30 font-bold text-xs uppercase rounded-xl disabled:opacity-50 transition-all"
                      >
                        {isApplyingPromo ? "..." : isPromoApplied ? "Applied" : "Apply"}
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs pl-1">{promoError}</p>}
                    {isPromoApplied && <p className="text-[#00E564] text-xs pl-1">Discount applied: -€{promoAmount.toFixed(2)}</p>}
                  </div>

                  <div className="bg-[#080B1A] rounded-xl p-4 text-left border border-[#1E2550]">
                    <h4 className="text-xs font-bold text-[#8B97B5] mb-2 uppercase flex items-center gap-2">
                      <Zap size={12} /> Boost Benefits
                    </h4>
                    {renderBenefits()}
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={!selectedPackageId || isRequesting}
                  className="w-full py-4 rounded-xl bg-[#00A79D] text-white font-bold text-lg hover:bg-[#00E5FF] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_24px_-8px_rgba(0,167,157,0.4)] flex items-center justify-center gap-2"
                >
                  {isRequesting ? (
                    "Processing..."
                  ) : (
                    <>
                      <Zap size={18} /> Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2 Visual */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-[#11163C] border border-[#1E2554] rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Order Summary
                  </h3>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#00E5FF] to-[#B026FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Profile Boost</p>
                      <p className="text-sm text-[#00E5FF]">
                        {selectedPackage?.duration}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm border-t border-b border-[#1E2554] py-4 my-4">
                    <div className="flex justify-between items-center text-[#8B97B5]">
                      <span>Duration</span>
                      <span className="font-medium text-white">
                        {selectedPackage?.duration}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#8B97B5]">
                      <span>Start Date</span>
                      <span className="font-medium text-white">
                        {startDate
                          ? new Date(startDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#8B97B5]">
                      <span>End Date</span>
                      <span className="font-medium text-white">
                        {endDate ? new Date(endDate).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between items-center text-[#8B97B5]">
                      <span>Subtotal</span>
                      <span className="text-white">
                        €{selectedPackage?.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#8B97B5]">
                      <span>Discount (Package)</span>
                      <span className="text-[#00E564]">
                        -€
                        {(
                          selectedPackage?.price - selectedPackage?.finalPrice
                        )?.toFixed(2) || 0}
                      </span>
                    </div>
                    {isPromoApplied && (
                      <div className="flex justify-between items-center text-[#00E5FF] font-bold mt-1">
                        <span>Promo ({promoCode})</span>
                        <span>-€{promoAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-[#080B1A] p-4 rounded-xl border border-[#1E2550]">
                    <span className="font-bold text-white">Total Amount</span>
                    <span className="font-black text-2xl text-[#00E5FF]">
                      €{Math.max(0, parseFloat(String(selectedPackage?.finalPrice || "0")) - promoAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    form="payment-form"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 rounded-xl bg-[#00A79D] text-white font-bold text-lg hover:bg-[#00E5FF] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_24px_-8px_rgba(0,167,157,0.4)] flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock size={18} /> Complete Payment - €
                        {Math.max(0, parseFloat(String(selectedPackage?.finalPrice || "0")) - promoAmount).toFixed(2)}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-3 rounded-xl bg-[#11163C] text-[#8B97B5] font-bold text-sm hover:text-white transition-all border border-[#1E2554] hover:bg-[#1A2255]"
                  >
                    ← Back to Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
