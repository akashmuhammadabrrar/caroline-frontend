import { baseApi } from "@/redux/api/baseApi";

export const clubSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // General Settings
    getGeneralSettings: builder.query<any, void>({
      query: () => "/club-academy/settings/",
      providesTags: ["ClubSettings"],
    }),
    updateGeneralSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: "/club-academy/settings/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ClubSettings"],
    }),

    // Privacy Settings
    getPrivacySettings: builder.query<any, void>({
      query: () => "/club-academy/settings/privacy/",
      providesTags: ["ClubPrivacy"],
    }),
    updatePrivacySettings: builder.mutation<any, any>({
      // User mentioned POST for privacy
      query: (data) => ({
        url: "/club-academy/settings/privacy/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ClubPrivacy"],
    }),

    // Notification Settings
    getNotificationSettings: builder.query<any, void>({
      query: () => "/club-academy/settings/notifications/",
      providesTags: ["ClubNotifications"],
    }),
    updateNotificationSettings: builder.mutation<any, any>({
      query: (data) => ({
        url: "/club-academy/settings/notifications/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ClubNotifications"],
    }),

    // Password & Security
    changePassword: builder.mutation<any, any>({
      query: (data) => ({
        url: "/club-academy/settings/change-password/",
        method: "POST",
        body: data,
      }),
    }),
    signOutAllSessions: builder.mutation<any, void>({
      query: () => ({
        url: "/club-academy/settings/sign-out-all/",
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useChangePasswordMutation,
  useSignOutAllSessionsMutation,
} = clubSettingsApi;
