import { baseApi } from "@/redux/api/baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewsMetrics {
  total_articles: number;
  published_this_month: number;
  total_views: number;
  active_categories: number;
  published_count: number;
  draft_count: number;
}

export interface NewsMetricsResponse {
  success: boolean;
  data: NewsMetrics;
}

export interface NewsArticle {
  id: number;
  unique_id: string;
  title: string;
  image_url?: string;
  category: string;
  author: string;
  date_published: string;
  views: number;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface NewsArticleDetail {
  id: number;
  unique_id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date_published: string;
  read_time: string;
  image_url: string;
  views: number;
  shares: number;
  engagement_rate: number;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  created_at: string;
  updated_at: string;
}

export interface NewsArticleDetailResponse {
  success: boolean;
  data: NewsArticleDetail;
}

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

export interface NewsArticlesResponse {
  success: boolean;
  count: number;
  data: NewsArticle[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminNewsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNewsDashboardMetrics: builder.query<NewsMetricsResponse, void>({
      query: () => "/admin-dashboard/news/dashboard/",
      providesTags: ["Dashboard"],
    }),
    getNewsArticles: builder.query<NewsArticlesResponse, void>({
      query: () => "/admin-dashboard/news/articles/",
      providesTags: ["Dashboard"],
    }),
    getNewsCategories: builder.query<NewsCategoriesResponse, void>({
      query: () => "/admin-dashboard/news/categories/",
      providesTags: ["Dashboard"],
    }),
    getNewsArticleDetails: builder.query<NewsArticleDetailResponse, string | number>({
      query: (id) => `/admin-dashboard/news/articles/${id}/`,
      providesTags: (result, error, id) => [{ type: "Dashboard", id }],
    }),
    createNewsArticle: builder.mutation<NewsArticleDetailResponse, FormData>({
      query: (formData) => ({
        url: "/admin-dashboard/news/articles/create/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Dashboard"],
    }),
    updateNewsArticle: builder.mutation<NewsArticleDetailResponse, { id: number | string; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin-dashboard/news/articles/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Dashboard", { type: "Dashboard", id }],
    }),
    deleteNewsArticle: builder.mutation<any, number | string>({
      query: (id) => ({
        url: `/admin-dashboard/news/articles/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetNewsDashboardMetricsQuery,
  useGetNewsArticlesQuery,
  useGetNewsCategoriesQuery,
  useGetNewsArticleDetailsQuery,
  useCreateNewsArticleMutation,
  useUpdateNewsArticleMutation,
  useDeleteNewsArticleMutation,
} = adminNewsApi;
