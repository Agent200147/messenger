import { createListenerMiddleware } from '@reduxjs/toolkit'
import { chatApi } from '@/api/chats/chatsApi'
import {listenerMiddleware} from "@/middleware/auth"
import {addMessage} from "@/store/slices/messageSlice"
import {RootState} from "@/store/store";

listenerMiddleware.startListening({
    actionCreator: addMessage,
    effect: async (action, listenerApi) => {
        listenerApi.cancelActiveListeners();
        const state = listenerApi.getState() as RootState
        // const chat = state.chats.chats.find(chat => chat.id == action.payload.chatId)
        console.log(state)
    },
})