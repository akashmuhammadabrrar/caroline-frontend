import { baseApi } from "../../api/baseApi";

export interface AppConfig {
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  branding: {
    title: string;
    logoUrl: string;
    faviconUrl: string;
  };
  version: string;
}

export const configApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppConfig: builder.query<AppConfig, void>({
      query: () => "/admin/config", // Assuming admin config endpoint
      providesTags: ["Config"],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;
          // Example: Setting up Server-Sent Events for real-time config updates
          const apiUrl = "http://98.81.136.120:9000/api";
          if (!apiUrl) return;

          const eventSource = new EventSource(`${apiUrl}/admin/config/stream`);

          eventSource.onmessage = (event) => {
            try {
              const newConfig = JSON.parse(event.data);
              updateCachedData((draft) => {
                Object.assign(draft, newConfig);
              });
            } catch (err) {
              console.error("Failed to parse config update", err);
            }
          };

          await cacheEntryRemoved;
          eventSource.close();
        } catch {
          // no-op
        }
      },
    }),
    updateAppConfig: builder.mutation<AppConfig, Partial<AppConfig>>({
      query: (configData) => ({
        url: "/admin/config",
        method: "PUT",
        body: configData,
      }),
      invalidatesTags: ["Config"],
    }),
  }),
});

export const { useGetAppConfigQuery, useUpdateAppConfigMutation } = configApi;
