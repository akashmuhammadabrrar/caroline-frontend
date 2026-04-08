import { baseApi } from "@/redux/api/baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpcomingEvent {
  id: number;
  title?: string;
  event_name?: string;
  location?: string;
  city?: string;
  date?: string;
  event_date?: string;
  time?: string;
  club_logo?: string;
}

export interface RecentMessage {
  id: number;
  sender_name: string;
  sender_logo?: string;
  preview: string;
  time_ago: string;  // e.g. "2h ago"
  is_unread: boolean;
}

export interface DashboardStats {
  profile_completeness: number;   // 0–100
  profile_views: number;
  messages_count: number;
  events_registered: number;
  upcoming_events: UpcomingEvent[];
  recent_messages: RecentMessage[];
}

export interface CareerStats {
  id: number;
  season: string;
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const playerDashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // GET dashboard statistics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/players/dashboard/stats/",
      providesTags: ["Dashboard"],
    }),

    // GET upcoming events
    getUpcomingEvents: builder.query<any[], void>({
      query: () => "/players/event-registrations/upcoming/",
      providesTags: ["Dashboard"],
    }),

    // GET career statistics
    getCareerStats: builder.query<CareerStats, void>({
      query: () => "/players/career-stats/me/",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetCareerStatsQuery,
  useGetUpcomingEventsQuery,
} = playerDashboardApi;