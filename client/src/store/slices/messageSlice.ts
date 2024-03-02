// "use client";
import { createSlice } from "@reduxjs/toolkit";
import { messagesApi } from "@/api/messages/messgesApi";
import type { RootState } from "@/store/store";
import type { MessageType } from "@/Models/Message/messageModel";
import {Nullable} from "@/utils/typeUtils";

interface InitialState {
    messages: MessageType[],
    newMessage: Nullable<MessageType>,
    messagesScrollSmoothFlag: boolean
}

const initialState: InitialState = {
    messages: [],
    newMessage: null,
    messagesScrollSmoothFlag: false
}

const slice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload
        },

        addMessage: (state, action) => {
            state.messages.push(action.payload)
            state.messagesScrollSmoothFlag = !state.messagesScrollSmoothFlag
        },

        setNewMessage: (state, action) => {
            state.newMessage = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(messagesApi.endpoints.getMessages.matchFulfilled, (state, action) => {
                // state.messages = action.payload
                console.log(action.payload)
            })

            .addMatcher(messagesApi.endpoints.getAdditionalMessages.matchFulfilled, (state, action) => {
                if (!action.payload) return
                state.messages = [...action.payload, ...state.messages]
                // console.log(action.payload)
            })

            .addMatcher(messagesApi.endpoints.sendMessage.matchFulfilled, (state, action) => {
                state.newMessage = action.payload
                state.messages.push(action.payload)
                state.messagesScrollSmoothFlag = !state.messagesScrollSmoothFlag
            })
    },
})

export default slice.reducer;

export const { setMessages, addMessage, setNewMessage } = slice.actions;

export const selectMessages = (state: RootState) => state.messages.messages
export const selectNewMessage = (state: RootState) => state.messages.newMessage
export const selectMessagesScrollSmoothFlag = (state: RootState) => state.messages.messagesScrollSmoothFlag
// export const selectSocket = (state: RootState) => state.chat.socket