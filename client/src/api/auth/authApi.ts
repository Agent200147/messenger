import { api } from "@/api/api";
import {type AuthenticatedUserType, type UserLoginType, type UserRegisterType, type UserType} from "@/Models/User/userModel";

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthenticatedUserType, UserLoginType>({
            query: (userData) => ({
                url: "/users/login",
                method: "POST",
                body: userData,
            }),
        }),
        register: builder.mutation<AuthenticatedUserType, UserRegisterType>({
            query: (userData) => ({
                url: "/users/register",
                method: "POST",
                body: userData,
            }),
        }),
        current: builder.query<AuthenticatedUserType, void>({
            query: () => ({
                url: "/users/current",
                method: "GET",
            }),
        }),
    }),
});

export const { useRegisterMutation, useLoginMutation, useCurrentQuery } = authApi;

export const {
    endpoints: { login, register, current },
} = authApi;