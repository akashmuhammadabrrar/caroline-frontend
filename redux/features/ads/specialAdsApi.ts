import { baseApi } from "@/redux/api/baseApi";

export interface SpecialAd {
  ad_id: string;
  title: string;
  special_ad_image?: string;
  special_ad_image_url: string;
  target_link: string;
  position: "TOP" | "BOTTOM";
  status: "ACTIVE" | "INACTIVE";
  clicks: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminSpecialAdsResponse {
  success: boolean;
  count: number;
  data: SpecialAd[];
}

export interface PublicSpecialAdsResponse {
  success: boolean;
  count: number;
  advertisements: SpecialAd[];
}

export interface SpecialAdMutationResponse {
  success: boolean;
  message: string;
  data: SpecialAd;
}

export const specialAdsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSpecialAds: builder.query<AdminSpecialAdsResponse, void>({
      query: () => "/ads/special-ads/admin/list/",
      providesTags: ["Ads"],
    }),
    getPublicSpecialAds: builder.query<PublicSpecialAdsResponse, void>({
      query: () => "/ads/special-ads/public/top-ads/",
      providesTags: ["Ads"],
    }),
    getPublicBottomSpecialAds: builder.query<PublicSpecialAdsResponse, void>({
      query: () => "/ads/special-ads/public/bottom-ads/",
      providesTags: ["Ads"],
    }),
    createSpecialAd: builder.mutation<SpecialAdMutationResponse, FormData>({
      query: (data) => ({
        url: "/ads/special-ads/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Ads"],
    }),
    updateSpecialAd: builder.mutation<SpecialAdMutationResponse, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/ads/special-ads/update/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Ads"],
    }),
    deleteSpecialAd: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/ads/special-ads/delete/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ads"],
    }),
  }),
});

export const {
  useGetAdminSpecialAdsQuery,
  useGetPublicSpecialAdsQuery,
  useGetPublicBottomSpecialAdsQuery,
  useCreateSpecialAdMutation,
  useUpdateSpecialAdMutation,
  useDeleteSpecialAdMutation,
} = specialAdsApi;
