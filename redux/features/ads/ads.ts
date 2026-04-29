import { baseApi } from "@/redux/api/baseApi";

export interface Advertisement {
  ad_id: string;
  title: string;
  ad_image_url: string;
  target_link: string;
  clicks: number;
}

export interface AdsResponse {
  success: boolean;
  count: number;
  advertisements: Advertisement[];
}

export const adsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAds: builder.query<AdsResponse, void>({
      query: () => ({
        url: "/ads/public/",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllAdsQuery } = adsApi;
