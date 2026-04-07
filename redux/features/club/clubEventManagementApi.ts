import { baseApi } from "@/redux/api/baseApi";
import { EventListResponse, Event } from "@/types/scout/eventsType";

export const clubEventManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClubEvents: builder.query<EventListResponse | Event[], void>({
      query: () => "/club-academy/events/",
      providesTags: ["Events"],
    }),
    getClubEventDetails: builder.query<any, string | number>({
      query: (id) => `/club-academy/events/${id}/`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),
    clubCreateEvent: builder.mutation<unknown, FormData | Record<string, unknown>>({
      query: (data) => ({
        url: "/club-academy/events/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),
    clubUpdateEvent: builder.mutation<unknown, { id: string | number; body: FormData | Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/club-academy/events/${id}/update/`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Events"],
    }),
    clubDeleteEvent: builder.mutation<unknown, string | number>({
      query: (id) => ({
        url: `/club-academy/events/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
    clubToggleFeaturedEvent: builder.mutation<unknown, string | number>({
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
  useGetClubEventDetailsQuery,
  useClubCreateEventMutation,
  useClubUpdateEventMutation,
  useClubDeleteEventMutation,
  useClubToggleFeaturedEventMutation,
} = clubEventManagementApi;