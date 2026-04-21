import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout } from "../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://98.81.136.120:9000/api",
  prepareHeaders: (headers, { getState, endpoint }) => {
    const state = getState() as RootState;
    const token = state.auth?.accessToken;

    if (token && endpoint !== "login" && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const hadToken = !!state.auth?.accessToken;

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401 && hadToken) {
    // Only clear credentials if the user actually had a token (session expired).
    // This prevents 401s from public API endpoints from logging out anonymous
    // visitors or clearing valid sessions.
    // NOTE: No redirect here — ProtectedRoute handles redirecting to /login
    // for protected pages. The public landing page must stay accessible.
    api.dispatch(logout());
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Profile",
    "Settings",
    "Dashboard",
    "Discovery",
    "Events",
    "Registrations",
    "Clubs",
    "ScoutProfile",
    "Users",
    "Subscription",
    "PaymentHistory",
    "ClubProfile",
    "ClubSettings",
    "ClubPrivacy",
    "ClubNotifications",
    "PlayerDiscovery",
    "Chat",
    "Notification",
    "Promo",
    "Config"
  ],
  endpoints: () => ({}),
});

