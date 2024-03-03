import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { api } from "@/api/api";
import auth from '@/store/slices/authSlice'
import chats from '@/store/slices/chatSlice'
import messages from '@/store/slices/messageSlice'
import { listenerMiddleware } from "@/middleware/auth";
import socketMiddleware from "@/store/middleware/socket.middleware";
import {Middleware} from "redux";

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        auth,
        chats,
        messages,

    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([api.middleware, socketMiddleware]).prepend(listenerMiddleware.middleware),
});



export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type storeType = typeof store
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>

export type CustomStore = {
    dispatch: AppDispatch;
    getState: () => RootState;
}