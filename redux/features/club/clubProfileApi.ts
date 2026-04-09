import { baseApi } from "../../api/baseApi";

export const clubProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClubProfile: builder.query<any, void>({
      query: () => "/club-academy/profile/me/",
      providesTags: ["ClubProfile"],
    }),
    updateClubProfile: builder.mutation<any, FormData | Record<string, any>>({
      query: (data) => ({
        url: "/club-academy/profile/update/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ClubProfile"],
    }),
  }),
});

export const {
  useGetClubProfileQuery,
  useUpdateClubProfileMutation,
} = clubProfileApi;
