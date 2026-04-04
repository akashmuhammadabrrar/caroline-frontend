import { baseApi } from "../../api/baseApi";

export interface EventDataApi {
  id: number;
  event_name: string;
  venue_name: string;
  venue_address?: string;
  event_date: string;
  event_time?: string;
  registration_fee: string;
  event_type?: string;
  is_full?: boolean;
  maximum_capacity?: number;
  registered_count?: number;
  description?: string;
  minimum_age?: number;
  maximum_age?: number;
  created_at?: string;
}

export interface EventsResponse {
  results?: EventDataApi[];
  data?: EventDataApi[];
}

export interface EventDetailsResponse {
  data?: EventDataApi;
}

export interface RegistrationPayload {
  event_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_phone: string;
  relationship: string;
  medical_conditions?: string;
  allergies?: string;
  promo_code?: string;
}

export interface RegistrationResponse {
  data?: {
    registration_id?: string;
    id?: string | number;
  };
  registration_id?: string;
  id?: string | number;
}

export interface CheckoutResponse {
  checkout_url?: string;
}

export interface VerifyPaymentResponse {
  status?: string;
}

export interface RegistrationStatusResponse {
  data?: {
    registration_status?: string;
    payment_status?: string;
    status?: string;
  };
  registration_status?: string;
  payment_status?: string;
  status?: string;
}

export interface MyRegistration {
  id: number | string;
  registration_id?: string;
  event_id?: number | string;
  event?: EventDataApi | number | string;
  status?: string;
  registration_status?: string;
  created_at?: string;
}

export interface MyRegistrationsResponse {
  results?: MyRegistration[];
  data?: MyRegistration[];
}

export interface PromoValidateResponse {
  data?: {
    discount_amount?: string | number;
  };
}

export const eventsDirectoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventsResponse | EventDataApi[], void>({
      query: () => "/events/",
    }),
    getEventDetails: builder.query<EventDetailsResponse | EventDataApi, string | number>({
      query: (id) => `/events/${id}/`,
    }),
    createRegistration: builder.mutation<RegistrationResponse, RegistrationPayload>({
      query: (data) => ({
        url: "/players/event-registration/",
        method: "POST",
        body: data,
      }),
    }),
    checkout: builder.mutation<
      CheckoutResponse,
      {
        registration_id: string;
        success_url: string;
        cancel_url: string;
        promo_code?: string;
      }
    >({
      query: (data) => ({
        url: "/players/event-registration/checkout/",
        method: "POST",
        body: data,
      }),
    }),
    verifyPayment: builder.mutation<
      VerifyPaymentResponse,
      { session_id: string; registration_id: string }
    >({
      query: (data) => ({
        url: "/players/event-registration/verify-payment/",
        method: "POST",
        body: data,
      }),
    }),
    getRegistrationStatus: builder.query<
      RegistrationStatusResponse,
      { player_name?: string; contact_email?: string } | string | number
    >({
      query: (params) => {
        if (typeof params === 'object') {
          return `/events/registration-status/?player_name=${params.player_name}&contact_email=${params.contact_email}`;
        }
        return `/events/registration-status/${params}/`;
      },
    }),
    getMyRegistrations: builder.query<MyRegistrationsResponse | MyRegistration[], void>({
      query: () => `/players/event-registrations/`,
      providesTags: ["Events"],
    }),
    applyPromoCode: builder.mutation<
      { data?: unknown, message?: string },
      { code: string; event_id: number | string }
    >({
      query: (data) => ({
        url: "/payments/apply-promo/",
        method: "POST",
        body: data,
      }),
    }),
    validatePromo: builder.mutation<
      PromoValidateResponse,
      { code: string; amount: number; usage_type: string }
    >({
      query: (data) => ({
        url: "/players/promo/validate/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventDetailsQuery,
  useCreateRegistrationMutation,
  useCheckoutMutation,
  useVerifyPaymentMutation,
  useGetRegistrationStatusQuery,
  useGetMyRegistrationsQuery,
  useApplyPromoCodeMutation,
  useValidatePromoMutation,
} = eventsDirectoryApi;
