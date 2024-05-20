import type { PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store/store";
import type { UserTypeWithoutPassword } from "@/Models/User/userModel";
import type { Nullable } from "@/utils/typeUtils";

import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "@/api/auth/authApi";
import {userApi} from "@/api/user/usersApi";




interface InitialState {
    user: Nullable<UserTypeWithoutPassword>,
    isAuthenticated: boolean
}

const initialState: InitialState = {
    user: null,
    isAuthenticated: false,
}

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserTypeWithoutPassword>) => {
            state.user = action.payload
        },
        logout: () => {
            return initialState
        },

        setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action: PayloadAction<UserTypeWithoutPassword>) => {
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action: PayloadAction<UserTypeWithoutPassword>) => {
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addMatcher(authApi.endpoints.current.matchFulfilled, (state, action: PayloadAction<UserTypeWithoutPassword>) => {
                state.user = action.payload
                state.isAuthenticated = true
            })

            .addMatcher(userApi.endpoints.uploadAvatar.matchFulfilled, (state, action: PayloadAction<string>) => {
                if(!state.user) return
                state.user.avatar = action.payload
            })
    },
});

export const { setUser, logout, setIsAuthenticated } = slice.actions
export default slice.reducer

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectUser = (state: RootState) => state.auth.user