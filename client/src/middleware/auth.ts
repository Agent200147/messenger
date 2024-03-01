import { createListenerMiddleware } from '@reduxjs/toolkit'
import { authApi } from '@/api/auth/authApi'
import { logout } from "@/store/slices/authSlice";
import {addMessage} from "@/store/slices/messageSlice";
import {RootState} from "@/store/store";

export const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
    matcher: authApi.endpoints.login.matchFulfilled,
    effect: async (action, listenerApi) => {
        listenerApi.cancelActiveListeners()
        if (action.payload.token) {
            localStorage.setItem('user', JSON.stringify(action.payload));
        }
    },
})

listenerMiddleware.startListening({
    matcher: authApi.endpoints.register.matchFulfilled,
    effect: async (action, listenerApi) => {
        listenerApi.cancelActiveListeners()
        localStorage.setItem('user', JSON.stringify(action.payload));
    },
});

listenerMiddleware.startListening({
    actionCreator: logout,
    effect: async (action, listenerApi) => {
        listenerApi.cancelActiveListeners();
        localStorage.removeItem('user');
    },
});

// listenerMiddleware.startListening({
//     actionCreator: addMessage,
//     effect: async (action, listenerApi) => {
//         listenerApi.cancelActiveListeners();
//         const state = listenerApi.getState() as RootState
//         const chat = state.chats.chats.find(chat => chat.id == action.payload.chatId)
//         if (!chat) return
//         chat.lastMessage = action.payload
//     },
// })