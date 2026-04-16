// redux/features/scout/eventsApi.ts
import { baseApi } from "@/redux/api/baseApi";
import { Event, EventListResponse } from "@/types/scout/eventsType";

interface GetEventResponse {
  success: boolean;
  data: Event;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllEvents: builder.query<EventListResponse, any>({
      query: (params) => ({
        url: "/scout-agent/event-discovery/",
        params,
      }),
      providesTags: ["Events"],
    }),

    getAllPlayersEventsRegister : builder.query<EventListResponse,void>({
      query: () => "/players/event-registrations/",
      providesTags:['Events']
    }),

    // Return only the inner data to match the component type
    getEvent: builder.query<Event, number>({
      query: (id) => `/events/${id}/`,
      transformResponse: (response: GetEventResponse) => response.data,
      providesTags: ["Events"],
    }),

    registerForEvent: builder.mutation<any, any>({
      query: (payload) => ({
        url: "/scout-agent/event-registrations/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Events"],
    }),

    checkPaymentStatus: builder.mutation<any, { session_id: string }>({
      query: (payload) => ({
        url: "/scout-agent/event-registrations/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Events"],
    }),

    getScoutRegistrations: builder.query<any, void>({
      query: () => "/scout-agent/event-registrations/",
      providesTags: ["Events"],
    }),
    validatePromo: builder.mutation<any, { code: string; amount: number; usage_type: string }>({
      query: (data) => ({
        url: "/scout-agent/promo/validate/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { 
  useGetAllEventsQuery, 
  useGetEventQuery, 
  useRegisterForEventMutation, 
  useCheckPaymentStatusMutation,
  useGetScoutRegistrationsQuery,
  useValidatePromoMutation
} = eventsApi;