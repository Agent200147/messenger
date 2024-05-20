import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { api } from "@/api/api";
import auth, {setUser} from '@/store/slices/auth.slice'
import chats from '@/store/slices/chat.slice'
import messages from '@/store/slices/message.slice'
import socket, {initSocket} from '@/store/slices/socket.slice'
import { listenerMiddleware } from "@/middleware/auth";
import socketMiddleware from "@/store/middleware/socket.middleware";
import {Middleware} from "redux";

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        auth,
        chats,
        messages,
        socket

    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([api.middleware, socketMiddleware]).prepend(listenerMiddleware.middleware),
})

// store.dispatch(initSocket())

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