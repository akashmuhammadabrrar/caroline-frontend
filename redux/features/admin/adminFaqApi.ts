import { baseApi } from "../../api/baseApi";

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
  message?: string;
  data: Faq;
}

export interface FaqListResponse {
  success: boolean;
  data: Faq[];
}

export const adminFaqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<FaqListResponse, void>({
      query: () => "/admin-dashboard/faqs/",
      providesTags: ["Faq"],
    }),
    getFaqById: builder.query<FaqResponse, number | string>({
      query: (id) => `/faq/admin-dashboard/faqs/${id}/`,
      providesTags: (result, error, id) => [{ type: "Faq", id }],
    }),
    createFaq: builder.mutation<FaqResponse, Partial<Faq>>({
      query: (data) => ({
        url: "/admin-dashboard/faqs/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Faq"],
    }),
    updateFaq: builder.mutation<FaqResponse, { id: number | string; data: Partial<Faq> }>({
      query: ({ id, data }) => ({
        url: `/faq/admin-dashboard/faqs/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Faq", { type: "Faq", id }],
    }),
    deleteFaq: builder.mutation<FaqResponse, number | string>({
      query: (id) => ({
        url: `/faq/admin-dashboard/faqs/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faq"],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useGetFaqByIdQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = adminFaqApi;
