import { baseApi } from "../../api/baseApi";

export interface Testimonial {
  id: number;
  name: string;
  image_url: string | null;
  rating: number;
  comment: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialResponse {
  success: boolean;
  message?: string;
  data: Testimonial;
}

export interface TestimonialListResponse {
  success: boolean;
  data: Testimonial[];
}

export const adminTestimonialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTestimonials: builder.query<TestimonialListResponse, void>({
      query: () => "/admin-dashboard/testimonials/",
      providesTags: ["Testimonials"],
    }),
    getTestimonialById: builder.query<TestimonialResponse, number | string>({
      query: (id) => `/admin-dashboard/testimonials/${id}/`,
      providesTags: (result, error, id) => [{ type: "Testimonials", id }],
    }),
    createTestimonial: builder.mutation<TestimonialResponse, FormData>({
      query: (data) => ({
        url: "/admin-dashboard/testimonials/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Testimonials"],
    }),
    updateTestimonial: builder.mutation<TestimonialResponse, { id: number | string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/admin-dashboard/testimonials/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Testimonials", { type: "Testimonials", id }],
    }),
    deleteTestimonial: builder.mutation<TestimonialResponse, number | string>({
      query: (id) => ({
        url: `/admin-dashboard/testimonials/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Testimonials"],
    }),
  }),
});

export const {
  useGetTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} = adminTestimonialApi;
