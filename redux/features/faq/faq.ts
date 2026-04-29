import { baseApi } from "@/redux/api/baseApi";

export interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqResponse {
  success: boolean;
  data: Faq[];
}



export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFaqs: builder.query<FaqResponse, void>({
      query: () => ({
        url: "/faq/faqs/",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllFaqsQuery } = faqApi;