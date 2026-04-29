import { baseApi } from "@/redux/api/baseApi";

export interface Ad {
  ad_id: string;
  title: string;
  ad_image: string | null;
  ad_image_url: string | null;
  target_link: string;
  status: string;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export interface AdResponse {
  success: boolean;
  message?: string;
  data: Ad;
}

export interface AdListResponse {
  success: boolean;
  count: number;
  data: Ad[];
}

export const adminAdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAds: builder.query<AdListResponse, void>({
      query: () => "/ads/admin/list/",
      providesTags: ["Ads"],
    }),
    getAdById: builder.query<AdResponse, string>({
      query: (id) => `/ads/admin/${id}/`,
      providesTags: (result, error, id) => [{ type: "Ads", id }],
    }),
    createAd: builder.mutation<AdResponse, FormData>({
      query: (data) => ({
        url: "/ads/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Ads"],
    }),
    updateAd: builder.mutation<AdResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/ads/admin/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Ads", { type: "Ads", id }],
    }),
    deleteAd: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/ads/delete/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ads"],
    }),
  }),
});

export const {
  useGetAdsQuery,
  useGetAdByIdQuery,
  useCreateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
} = adminAdsApi;
