import { baseApi } from "@/redux/api/baseApi";

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendVerificationCode: builder.mutation<{ message: string; is_verified: boolean }, { email: string }>({
      query: (data) => ({
        url: "/accounts/send-verification-code/",
        method: "POST",
        body: data,
      }),
    }),
    verifyEmail: builder.mutation<{ message: string }, { email: string; code: string }>({
      query: (data) => ({
        url: "/accounts/verify-email/",
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: "/accounts/forgot-password/",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { email: string; code: string; new_password: string; confirm_password: string }>({
      query: (data) => ({
        url: "/accounts/reset-password/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useSendVerificationCodeMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = accountApi;
