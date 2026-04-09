import { baseApi } from "@/redux/api/baseApi";
import { AccountSettings, AllSettings, ChangePasswordPayload, DownloadDataResponse, NotificationSettings, PrivacySettings } from "@/types/setting";



// ─── API ──────────────────────────────────────────────────────────────────────

export const settingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // GET all settings
    getAllSettings: builder.query<AllSettings, void>({
      query: () => "/players/settings/all/",
      providesTags: ["Settings"],
    }),

    // PATCH notification settings
    updateNotificationSettings: builder.mutation<
      NotificationSettings,
      Partial<NotificationSettings>
    >({
      query: (body) => ({
        url: "/players/settings/notifications/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    // PATCH privacy settings
    updatePrivacySettings: builder.mutation<
      PrivacySettings,
      Partial<PrivacySettings>
    >({
      query: (body) => ({
        url: "/players/settings/privacy/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    // PATCH account settings
    updateAccountSettings: builder.mutation<
      AccountSettings,
      Partial<AccountSettings>
    >({
      query: (body) => ({
        url: "/players/settings/account/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    // POST change password
    changePassword: builder.mutation<{ message: string }, ChangePasswordPayload>({
      query: (body) => ({
        url: "/players/settings/change_password/",
        method: "POST",
        body,
      }),
    }),

    // POST download data — returns full profile JSON
    downloadData: builder.mutation<DownloadDataResponse, void>({
      query: () => ({
        url: "/players/settings/download_data/",
        method: "POST",
      }),
    }),

    // DELETE account
    deleteAccount: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/players/settings/delete_account/",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useUpdatePrivacySettingsMutation,
  useUpdateAccountSettingsMutation,
  useChangePasswordMutation,
  useDownloadDataMutation,
  useDeleteAccountMutation,
} = settingApi;