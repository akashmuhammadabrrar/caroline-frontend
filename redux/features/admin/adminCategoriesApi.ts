import { baseApi } from "@/redux/api/baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_visible: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  order: number;
  article_count: number;
}

export interface NewsCategoriesResponse {
  success: boolean;
  count: number;
  data: NewsCategory[];
}

export interface CategoryDetailResponse {
  success: boolean;
  message?: string;
  data: NewsCategory;
}

export interface CategoryPayload {
  name: string;
  description: string;
  is_visible: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  order: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminCategoriesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNewsCategories: builder.query<NewsCategoriesResponse, void>({
      query: () => "/admin-dashboard/news/categories/",
      providesTags: ["Dashboard"],
    }),
    createNewsCategory: builder.mutation<CategoryDetailResponse, CategoryPayload>({
      query: (payload) => ({
        url: "/admin-dashboard/news/categories/create/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Dashboard"],
    }),
    updateNewsCategory: builder.mutation<CategoryDetailResponse, { id: number | string; payload: CategoryPayload }>({
      query: ({ id, payload }) => ({
        url: `/admin-dashboard/news/categories/${id}/update/`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Dashboard"],
    }),
    deleteNewsCategory: builder.mutation<any, number | string>({
      query: (id) => ({
        url: `/admin-dashboard/news/categories/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetNewsCategoriesQuery,
  useCreateNewsCategoryMutation,
  useUpdateNewsCategoryMutation,
  useDeleteNewsCategoryMutation,
} = adminCategoriesApi;
