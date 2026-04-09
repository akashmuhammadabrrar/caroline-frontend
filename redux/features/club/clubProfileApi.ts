import { baseApi } from "../../api/baseApi";

export const clubProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClubProfile: builder.query<any, void>({
      query: () => "/club-academy/profile/me/",
      providesTags: ["ClubProfile"],
    }),
    updateClubProfile: builder.mutation<any, FormData>({
      query: (data) => ({
        url: "/club-academy/profile/update/",
        method: "PUT",
        body: data,
        // FormData should not have Content-Type set manually; 
        // fetch will set it with the correct boundary.
      }),
      invalidatesTags: ["ClubProfile"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetClubProfileQuery,
  useUpdateClubProfileMutation,
} = clubProfileApi;
