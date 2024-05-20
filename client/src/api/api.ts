import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { type RootState, store } from "@/store/store";

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
    // prepareHeaders: (headers, { getState }) => {
    //     const user = (getState() as RootState).auth.user || localStorage.getItem("user");
    //     if (!user) {
    //         return headers
    //     }
    //     const token = typeof user === "string" ? JSON.parse(user).token : user.token
    //     if (token) {
    //         headers.set("authorization", `Bearer ${token}`)
    //     }
    //     return headers
    // },
    credentials: 'include'
})

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 });

export const api = createApi({
    reducerPath: "splitApi",
    baseQuery: baseQuery,
    refetchOnMountOrArgChange: true,
    endpoints: () => ({}),
})