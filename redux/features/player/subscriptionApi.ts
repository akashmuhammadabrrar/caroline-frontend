import { baseApi } from "../../api/baseApi";

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query<any, void>({
      query: () => "/players/subscription/info/",
      providesTags: ["Subscription"],
    }),
    getPlans: builder.query<any, void>({
      query: () => "/players/subscription/plans/",
    }),
    getPaymentHistory: builder.query<any, void>({
      query: () => "/players/subscription/payment-history/",
      providesTags: ["PaymentHistory"],
    }),
    createCheckout: builder.mutation<
      any,
      {
        plan_id: number;
        promo_code?: string;
      }
    >({
      query: (data) => ({
        url: "/players/subscription/create-checkout/",
        method: "POST",
        body: data,
      }),
    }),
    verifyPayment: builder.mutation<any, { session_id: string }>({
      query: (data) => ({
        url: "/players/subscription/verify-payment/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "PaymentHistory"],
    }),
    cancelSubscription: builder.mutation<any, { reason?: string } | void>({
      query: (data) => ({
        url: "/players/subscription/cancel/",
        method: "POST",
        body: data || {},
      }),
      invalidatesTags: ["Subscription"],
    }),
    updatePaymentMethod: builder.mutation<any, any>({
      query: (data) => ({
        url: "/players/subscription/payment-method/",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    validatePromo: builder.mutation<
      any,
      { code: string; amount: number; usage_type: string }
    >({
      query: (data) => ({
        url: "/players/promo/validate/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useGetPlansQuery,
  useGetPaymentHistoryQuery,
  useCreateCheckoutMutation,
  useVerifyPaymentMutation,
  useCancelSubscriptionMutation,
  useUpdatePaymentMethodMutation,
  useValidatePromoMutation,
} = subscriptionApi;
