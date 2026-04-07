import { baseApi } from "@/redux/api/baseApi";

export interface AdminEventListItem {
  id: number;
  event_name: string;
  date: string;
  location: string;
  fee: string;
  status: string;
  is_featured: boolean;
}

export interface AdminEventListResponse {
  success: boolean;
  count: number;
  data: AdminEventListItem[];
}

export const adminEventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<AdminEventListResponse, void>({
      query: () => "/admin-dashboard/events/",
      providesTags: ["Events"],
    }),
    getEventDetails: builder.query<any, number>({
      query: (id) => `/admin-dashboard/events/${id}/`,
      providesTags: (result, error, id) => [{ type: "Events", id }],
    }),
    createEvent: builder.mutation<any, any>({
      query: (eventData) => ({
        url: "/admin-dashboard/events/create/",
        method: "POST",
        body: eventData,
      }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin-dashboard/events/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Events", id }, "Events"],
    }),

    updateEventStatus: builder.mutation<any, { id: number | string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin-dashboard/events/${id}/update/`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Events", id }, "Events"],
    }),
    deleteEvent: builder.mutation<any, number | string>({
      query: (id) => ({
        url: `/admin-dashboard/events/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const { 
  useGetEventsQuery, 
  useGetEventDetailsQuery,
  useCreateEventMutation, 
  useUpdateEventMutation,
  useUpdateEventStatusMutation,
  useDeleteEventMutation 
} = adminEventApi;
