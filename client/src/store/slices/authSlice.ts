import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "@/api/auth/authApi";
import { RootState } from "@/store/store";
import {AuthenticatedUserType, UserType} from "@/Models/User/userModel";



interface InitialState {
    user: AuthenticatedUserType;
    isAuthenticated: boolean;
}

const initialState: InitialState = {
    user: {} as AuthenticatedUserType,
    isAuthenticated: false,
};

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        logout: () => {
            return initialState
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addMatcher(authApi.endpoints.current.matchFulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            });
    },
});

export const { setUser, logout } = slice.actions;
export default slice.reducer;

export const selectIsAuthenticated = (state: RootState) =>
    state.auth.isAuthenticated;

export const selectUser = (state: RootState) =>
    state.auth.user;