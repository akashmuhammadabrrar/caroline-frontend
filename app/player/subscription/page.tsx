/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Check,
  X,
  AlertCircle,
  CreditCard,
  Download,
  Calendar,
  Lock,
  ChevronRight,
  Rocket,
  CheckCircle,
  Shield,
  XCircle,
} from "lucide-react";
import { formatRegistrationDate } from "@/lib/utils/dateFormatter";
import {
  useGetSubscriptionQuery,
  useGetPaymentHistoryQuery,
  useCancelSubscriptionMutation,
  useUpdatePaymentMethodMutation,
  useGetPlansQuery,
  useCreateCheckoutMutation,
  useValidatePromoMutation,
} from "../../../redux/features/player/subscriptionApi";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Plan {
  id: number;
  planName?: string;
  plan_name?: string;
  plan_type?: string;
  price: string | number;
  billingInterval?: string;
  billing_cycle?: string;
  features: string[];
}

interface ActiveSubscription {
  plan_name: string;
  plan_type: string;
  amount: string | number;
  billing_cycle: string;
  next_billing_date: string;
  card_brand: string;
  card_last_four: string;
  auto_renewal: boolean;
  features: string[];
}

interface PaymentHistoryItem {
  id: number;
  payment_date: string;
  description: string;
  currency: string;
  amount: string | number;
  status: string;
}

const CheckIcon = () => (
  <Check size={18} className="text-[#00D4AA]" strokeWidth={3} />
);

const SubscriptionContent = () => {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Subscribe Modal State
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoAmount, setPromoAmount] = useState<number>(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const router = useRouter();

  const {
    data: subscription,
    isLoading: isSubLoading,
    refetch: refetchSub,
  } = useGetSubscriptionQuery();
  const { data: plansData, isLoading: isPlansLoading } = useGetPlansQuery();
  const { data: historyRes, isLoading: isHistoryLoading } =
    useGetPaymentHistoryQuery();
  const [createCheckout, { isLoading: isCreatingCheckout }] =
    useCreateCheckoutMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();
  const [updatePaymentMethod, { isLoading: isUpdating }] =
    useUpdatePaymentMethodMutation();
  const [validatePromo, { isLoading: isApplyingPromo }] =
    useValidatePromoMutation();

  const activeSub: ActiveSubscription | null = subscription?.data || null;
  const plans: Plan[] = plansData?.data || [];
  const paymentHistory: PaymentHistoryItem[] = historyRes?.data || [];

  const displaySub = activeSub;

  const handleSubscribeClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setPromoCode("");
    setPromoAmount(0);
    setIsPromoApplied(false);
    setPromoError("");
    setIsSubscribeModalOpen(true);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    try {
      const res = await validatePromo({
        code: promoCode,
        amount: parseFloat(String(selectedPlan?.price || "0")),
        usage_type: "SUBSCRIPTION",
      }).unwrap();
      if (res.data?.discount_amount) {
        setPromoAmount(Number(res.data.discount_amount));
        setIsPromoApplied(true);
        toast.success("Promo code applied successfully!");
      }
    } catch (err: any) {
      setPromoError(
        err?.data?.message || err?.data?.error || "Invalid promo code",
      );
      setPromoAmount(0);
      setIsPromoApplied(false);
    }
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlan) return;
    try {
      const baseUrl = window.location.origin;

      const rawName = String(
        selectedPlan.plan_type ||
          selectedPlan.plan_name ||
          selectedPlan.planName ||
          "BASIC",
      ).toUpperCase();
      let pType = "BASIC";
      if (rawName.includes("PRO") || rawName.includes("PREMIUM")) pType = "PRO";
      else if (rawName.includes("ELITE")) pType = "ELITE";
      else if (rawName.includes("BASIC") || rawName.includes("STARTER"))
        pType = "BASIC";
      else pType = "BASIC";

      const rawCycle = String(
        selectedPlan.billing_cycle || selectedPlan.billingInterval || "ANNUAL",
      ).toUpperCase();
      const bCycle = rawCycle.includes("MONTH") ? "MONTHLY" : "ANNUAL";

      const payload: {
        plan_type: string;
        billing_cycle: string;
        success_url?: string;
        cancel_url?: string;
        promo_code?: string;
      } = {
        plan_type: pType,
        billing_cycle: bCycle,
        success_url: `${baseUrl}/player/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/player/subscription/cancel`,
        ...(isPromoApplied && promoCode ? { promo_code: promoCode } : {}),
      };

      const res = await createCheckout(payload).unwrap();

      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      toast.error(
        err?.data?.plan_type?.[0] ||
          err?.data?.message ||
          "Failed to initiate checkout",
      );
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await cancelSubscription({ reason: cancelReason }).unwrap();
      toast.success(res.message || "Subscription cancelled.");
      setIsCancelModalOpen(false);
      setCancelReason("");
      refetchSub();
    } catch (err) {
      toast.error("Failed to cancel subscription.");
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePaymentMethod({ dummy: "data" }).unwrap();
      toast.success("Payment method updated.");
      setIsUpdateModalOpen(false);
      refetchSub();
    } catch (err) {
      toast.error("Failed to update payment method.");
    }
  };

  if (isSubLoading || isPlansLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00D4AA]"></div>
      </div>
    );
  }

  // View 1: Plan Selection (No Active Subscription and No recent Success)
  if (!displaySub) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-4 py-8">
          <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent italic leading-tight">
            Choose Your Power Up
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Join the NextGen network and get exclusive access to scouts, premium
            content, and more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              className="relative group/card bg-[#12143A]/50 border border-white/5 rounded-[40px] p-8 flex flex-col hover:bg-[#12143A] hover:border-cyan-400/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute xl:lg:-top-6 -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-sm font-bold uppercase tracking-widest xl:lg:px-9 px-4 xl:lg:py-1 py-3 rounded-full shadow-lg text-center">
                {plan.plan_name || plan.planName || plan.plan_type}
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2"></h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    €{plan.price}
                  </span>
                  <span className="text-gray-500 font-bold text-xs">
                    /
                    {(
                      plan.billing_cycle ||
                      plan.billingInterval ||
                      ""
                    ).toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1 mb-10">
                {(plan.features || []).map((feature: any, i: number) => {
                  const featureText =
                    typeof feature === "string"
                      ? feature
                      : feature?.name ||
                        feature?.title ||
                        feature?.description ||
                        feature?.more ||
                        Object.values(feature)[0] ||
                        JSON.stringify(feature);
                  return (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="mt-1 flex-shrink-0">
                        <CheckIcon />
                      </div>
                      <span className="text-gray-400 font-medium leading-tight">
                        {featureText}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => handleSubscribeClick(plan)}
                disabled={isCreatingCheckout}
                className="w-full py-4 rounded-2xl bg-[#0B0D2C] border border-white/10 text-white font-black uppercase tracking-widest text-xs group-hover/card:bg-gradient-to-r group-hover/card:from-cyan-400 group-hover/card:to-purple-500 group-hover/card:border-transparent transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // View 2: Active Subscription Management
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Page Title */}
      <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
        Subscription Management
      </h1>

      {/* Current Plan Card */}
      <div className="bg-[#12143A] rounded-2xl p-6 sm:p-8 border border-[#1d204a]">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {displaySub.plan_name}
              </h2>
              <p className="text-[#8A9ABF] text-sm font-medium">
                {(displaySub as any).billing_cycle_name ||
                  displaySub.billing_cycle ||
                  "Annual"}{" "}
                Subscription
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#00E5FF]">
                €{displaySub.amount}
              </p>
              <p className="text-[#8A9ABF] text-[10px] sm:text-xs">
                /{displaySub.billing_cycle === "MONTHLY" ? "month" : "year"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            {(displaySub.features || []).map((feature: any, index: number) => {
              const featureText =
                typeof feature === "string"
                  ? feature
                  : feature?.name ||
                    feature?.title ||
                    feature?.description ||
                    feature?.more ||
                    Object.values(feature)[0] ||
                    JSON.stringify(feature);
              return (
                <div key={index} className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="text-sm text-[#8A9ABF]">{featureText}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-2">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all font-medium"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>

      {/* Billing Information Section */}
      <div className="bg-[#12143A] border border-[#1d204a] rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-6">
          Billing Information
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/[0.02] gap-1">
            <p className="text-[#8A9ABF] text-sm">Next billing date:</p>
            <p className="text-sm text-[#8A9ABF]">
              {displaySub.next_billing_date
                ? formatRegistrationDate(displaySub.next_billing_date)
                : "N/A"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/[0.02] gap-1">
            <p className="text-[#8A9ABF] text-sm">Payment method:</p>
            <p className="text-sm text-[#8A9ABF]">
              •••• •••• •••• {displaySub.card_last_four}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/[0.02] gap-1">
            <p className="text-[#8A9ABF] text-sm">Auto-renewal:</p>
            <span
              className={`text-sm ${displaySub.auto_renewal ? "text-[#00D4AA]" : "text-red-500"}`}
            >
              {displaySub.auto_renewal ? "Active" : "Disabled"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsUpdateModalOpen(true)}
          className="w-full py-3 rounded-lg border border-cyan-400/30 text-[#00E5FF] font-medium hover:bg-cyan-400/10 transition-all text-sm mt-6"
        >
          Update Payment Method
        </button>
      </div>

      {/* Payment History Section */}
      <div className="bg-[#12143A] border border-[#1d204a] rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-6">Payment History</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left pb-4 text-xs font-bold text-white">
                  Date
                </th>
                <th className="text-left pb-4 text-xs font-bold text-white">
                  Description
                </th>
                <th className="text-left pb-4 text-xs font-bold text-white">
                  Amount
                </th>
                <th className="text-left pb-4 text-xs font-bold text-white">
                  Status
                </th>
                <th className="text-left pb-4 text-xs font-bold text-white">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((item: PaymentHistoryItem) => (
                <tr
                  key={item.id}
                  className="border-b border-[#1d204a] last:border-0 hover:bg-white/[0.01]"
                >
                  <td className="py-4 text-xs text-[#8A9ABF]">
                    {new Date(item.payment_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 text-xs text-[#8A9ABF]">
                    {item.description}
                  </td>
                  <td className="py-4 text-xs text-[#8A9ABF]">
                    {item.currency === "usd"
                      ? "$"
                      : item.currency === "eur"
                        ? "€"
                        : ""}
                    {item.amount}
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-[#00D4AA]/10 text-[#00D4AA] text-[10px] rounded-full">
                      {item.status === "PAID" ? "Paid" : item.status}
                    </span>
                  </td>
                  <td className="py-4 text-left">
                    <a
                      href={
                        (item as any).invoice_pdf ||
                        (item as any).invoice_url ||
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00E5FF] text-xs hover:underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
              {paymentHistory.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-500 text-sm"
                  >
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Subscribe Modal */}
      {isSubscribeModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-[#12143A] border border-white/10 rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                Review & Subscribe
              </h3>
              <button
                onClick={() => setIsSubscribeModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-[#0B0D2C]/50 p-6 rounded-3xl border border-white/5 space-y-4 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-[50px] rounded-full pointer-events-none" />

              <h4 className="text-xl font-bold text-white uppercase">
                {selectedPlan.plan_name ||
                  selectedPlan.planName ||
                  selectedPlan.plan_type}
              </h4>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest">
                    Plan Cost
                  </span>
                  <span
                    className={`text-white font-bold ${isPromoApplied ? "line-through text-gray-500" : ""}`}
                  >
                    €{selectedPlan.price} /
                    {(
                      selectedPlan.billing_cycle ||
                      selectedPlan.billingInterval ||
                      ""
                    ).toLowerCase()}
                  </span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#00D4AA] font-bold uppercase tracking-widest">
                      Discount ({promoCode})
                    </span>
                    <span className="text-[#00D4AA] font-bold">
                      -€{promoAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                  <span className="text-white font-black uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-2xl text-cyan-400 font-black">
                    €
                    {Math.max(
                      0,
                      parseFloat(String(selectedPlan.price || "0")) -
                        promoAmount,
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <label className="text-xs text-gray-500 font-bold ml-1 uppercase tracking-widest">
                Promo Code
              </label>
              <div className="flex gap-3">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={isPromoApplied}
                  className={`flex-1 bg-[#0B0D2C] border ${promoError ? "border-red-500" : "border-white/5"} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-all text-sm`}
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isPromoApplied || isApplyingPromo || !promoCode}
                  className="px-6 py-3 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                >
                  {isApplyingPromo
                    ? "..."
                    : isPromoApplied
                      ? "Applied"
                      : "Apply"}
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-xs ml-1 font-medium">
                  {promoError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsSubscribeModalOpen(false)}
                className="py-4 rounded-xl bg-white/5 text-gray-400 font-black hover:bg-white/10 hover:text-white transition-all border border-white/5 active:scale-95 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubscribe}
                disabled={isCreatingCheckout}
                className="py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-black hover:opacity-90 transition-all shadow-lg text-xs uppercase tracking-widest active:scale-95 flex justify-center items-center gap-2"
              >
                {isCreatingCheckout ? "Redirecting..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#12143A] border border-[#2A2B5A] rounded-2xl p-8 text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertCircle size={24} />
            </div>

            <h3 className="text-xl font-bold text-white mb-4">
              Cancel Subscription?
            </h3>

            <p className="text-[#8A9ABF] text-sm mb-6 leading-relaxed">
              No refund. Subscription stays active until{" "}
              <br className="hidden sm:block" />
              expiry, then does not renew.
            </p>

            <div className="space-y-3 mb-8 text-left">
              {[
                "Unlimited events",
                "Featured listings",
                "Advanced analytics",
                "Priority support",
              ].map((perk, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-xs text-[#8A9ABF]"
                >
                  <div className="w-4 h-4 rounded-full border border-red-500/30 flex items-center justify-center">
                    <X size={10} className="text-red-500" />
                  </div>
                  {perk}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 rounded-lg bg-[#0B0D2C] border border-[#1d204a] text-white text-sm font-medium hover:bg-[#15173e] transition-all"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-lg bg-[#FF4B4B] text-white text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isCancelling ? "..." : "Cancel Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Payment Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#12143A] border border-[#2A2B5A] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center px-8 py-6 border-b border-[#1d204a]">
              <h3 className="text-xl font-bold text-white">
                Update Payment Method
              </h3>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <label className="text-sm font-bold text-white">
                  Current Payment Method
                </label>
                <div className="flex items-center justify-between p-4 bg-[#0B0D2C] rounded-xl border border-[#1d204a]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-7 bg-[#12143A] rounded border border-[#1d204a] flex items-center justify-center text-[#00E5FF]">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        •••• •••• •••• {displaySub.card_last_four}
                      </p>
                      <p className="text-xs text-[#8A9ABF]">Expires 12/26</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#00D4AA]/10 text-[#00D4AA] text-[10px] font-bold rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <label className="text-sm font-bold text-white">
                  Add New Payment Method
                </label>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs text-[#8A9ABF] font-medium">
                      Card Number
                    </span>
                    <input
                      className="w-full bg-[#0B0D2C] border border-[#1d204a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm placeholder:text-gray-600"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs text-[#8A9ABF] font-medium">
                        Expiry Date
                      </span>
                      <input
                        className="w-full bg-[#0B0D2C] border border-[#1d204a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm placeholder:text-gray-600"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-[#8A9ABF] font-medium">
                        CVV
                      </span>
                      <input
                        className="w-full bg-[#0B0D2C] border border-[#1d204a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm placeholder:text-gray-600"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-[#8A9ABF] font-medium">
                      Cardholder Name
                    </span>
                    <input
                      className="w-full bg-[#0B0D2C] border border-[#1d204a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm placeholder:text-gray-600"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <span className="text-xs text-[#8A9ABF] font-medium">
                      Billing Address
                    </span>
                    <input
                      className="w-full bg-[#0B0D2C] border border-[#1d204a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm placeholder:text-gray-600"
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        className="w-full bg-[#0B0D2C] border border-[#1d204a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm placeholder:text-gray-600"
                        placeholder="City"
                      />
                      <input
                        className="w-full bg-[#0B0D2C] border border-[#1d204a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] transition-all text-sm placeholder:text-gray-600"
                        placeholder="Postal Code"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-[#1d204a] flex items-center justify-center group-hover:border-[#00E5FF]">
                    <div className="w-2.5 h-2.5 bg-[#00E5FF] rounded-sm opacity-0 transition-opacity" />
                  </div>
                  <span className="text-xs text-[#8A9ABF]">
                    Set as default payment method
                  </span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#0B0D2C] rounded-xl border border-[#1d204a]">
                  <div className="text-[#00E5FF]">
                    <Lock size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-white font-medium">
                      Your payment is secure
                    </p>
                    <p className="text-[10px] text-[#8A9ABF]">
                      We use industry-standard encryption to protect your
                      information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 pb-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 py-3 rounded-lg bg-[#0B0D2C] border border-[#1d204a] text-white text-sm font-medium hover:bg-[#15173e] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePayment}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-[#00D4AA] text-[#0B0D2C] font-bold text-sm rounded-lg hover:bg-[#00bfa0] transition-all"
                >
                  {isUpdating ? "Updating..." : "Update Payment Method"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SubscriptionPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00D4AA]"></div>
        </div>
      }
    >
      <SubscriptionContent />
    </React.Suspense>
  );
}
