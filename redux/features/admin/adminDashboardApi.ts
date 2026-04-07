import { baseApi } from "@/redux/api/baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatInfo {
  count?: number;
  amount?: number;
  currency?: string;
  change: number;
}

export interface DashboardOverview {
  total_users: StatInfo;
  active_events: StatInfo;
  monthly_revenue: StatInfo;
  subscriptions: StatInfo;
}

export interface AdminActivity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  type: "player" | "club" | "scout" | "system";
}

export interface AdminDashboardResponse {
  success: boolean;
  data: {
    overview: DashboardOverview;
    recent_activity: AdminActivity[];
  };
}

export interface SubscriptionItem {
  user: string;
  email: string;
  plan: string;
  status: 'Active' | 'Cancelled' | 'Expired' | string;
  nextBilling: string;
  amount: string;
  autoRenew: 'Enabled' | 'Disabled' | string;
}

export interface SubscriptionTrackingResponse {
  totalSubscribers: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  expiringThisMonth: number;
  subscriptions: SubscriptionItem[];
}

export interface SubscriptionUser {
  name: string;
  email: string;
  userId: string;
  role: string;
  lastLogin: string;
}

export interface SubscriptionDetailsInfo {
  plan: string;
  status: string;
  amount: string;
  billingCycle: string;
  nextBilling: string;
  autoRenew: string;
  paymentMethod: string;
  transactionId: string;
}

export interface BillingHistoryItem {
  date: string;
  invoiceId: string;
  amount: string;
  status: string;
}

export interface SubscriptionDetailsResponse {
  user: SubscriptionUser;
  subscription: SubscriptionDetailsInfo;
  billingHistory: BillingHistoryItem[];
}

export interface PlanItem {
  id: number;
  planName: string;
  price: string;
  billingInterval: string;
  status: string;
  features: string[];
  subscribers: number;
}

export interface CancelSubscriptionResponse {
  message: string;
}

export interface CreatePlanRequest {
  planName: string;
  price: string;
  billingInterval: string;
  features: string[];
  status: string;
}

export interface CreatePlanResponse {
  message: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminDashboardData: builder.query<AdminDashboardResponse, void>({
      query: () => "/admin-dashboard/dashboard/",
      providesTags: ["Dashboard"],
    }),
    getSubscriptionTrackingData: builder.query<SubscriptionTrackingResponse, void>({
      query: () => "/admin-dashboard/subscription-tracking/",
      providesTags: ["Dashboard"],
    }),
    getSubscriptionDetails: builder.query<SubscriptionDetailsResponse, string | number>({
      query: (id) => `/admin-dashboard/subscription/${id}/`,
      providesTags: ["Dashboard"],
    }),
    getSubscriptionPlans: builder.query<PlanItem[], void>({
      query: () => "/admin-dashboard/plans/",
      providesTags: ["Dashboard"],
    }),
    cancelSubscription: builder.mutation<CancelSubscriptionResponse, { id: string | number; confirmation: boolean }>({
      query: (data) => ({
        url: `/admin-dashboard/subscription/${data.id}/cancel/`,
        method: "POST",
        body: { confirmation: data.confirmation }
      }),
      invalidatesTags: ["Dashboard"],
    }),
    createSubscriptionPlan: builder.mutation<CreatePlanResponse, CreatePlanRequest>({
      query: (data) => ({
        url: "/admin-dashboard/plans/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Dashboard"],
    }),
    updateSubscriptionPlan: builder.mutation<CreatePlanResponse, { id: number } & CreatePlanRequest>({
      query: ({ id, ...data }) => ({
        url: `/admin-dashboard/plans/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetAdminDashboardDataQuery,
  useGetSubscriptionTrackingDataQuery,
  useGetSubscriptionDetailsQuery,
  useGetSubscriptionPlansQuery,
  useCancelSubscriptionMutation,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation
} = adminDashboardApi;
