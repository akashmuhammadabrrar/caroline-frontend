import { baseApi } from "@/redux/api/baseApi";

export const clubEventManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClubEvents: builder.query({
      query: () => "/club-academy/events/",
      providesTags: ["Events"],
    }),
    createEvent: builder.mutation({
      query: (data) => ({
        url: "/club-academy/events/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/club-academy/events/${id}/update/`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/club-academy/events/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
    toggleFeaturedEvent: builder.mutation({
      query: (id) => ({
        url: `/club-academy/events/${id}/toggle-featured/`, 
        method: "POST",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useGetClubEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useToggleFeaturedEventMutation,
} = clubEventManagementApi;