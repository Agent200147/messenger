import type { PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store/store";
import type { MessageType } from "@/Models/Message/message";
import type { Nullable } from "@/utils/typeUtils";

import { createSlice } from "@reduxjs/toolkit";

import { messagesApi } from "@/api/messages/messgesApi";

interface InitialState {
    messages: MessageType[],
    messagesScrollSmoothFlag: boolean
}

const initialState: InitialState = {
    messages: [],
    messagesScrollSmoothFlag: false
}

const slice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<MessageType[]>) => {
            state.messages = action.payload
        },

        addMessage: (state, action: PayloadAction<MessageType>) => {
            state.messages.push(action.payload)
            state.messagesScrollSmoothFlag = !state.messagesScrollSmoothFlag
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(messagesApi.endpoints.getMessages.matchFulfilled, (state, action: PayloadAction<MessageType[]>) => {
                state.messages = action.payload.messages
                // console.log(action.payload)
                // console.log(action.payload)
            })

            .addMatcher(messagesApi.endpoints.getAdditionalMessages.matchFulfilled, (state, action: PayloadAction<MessageType[]>) => {
                if (!action.payload) return
                state.messages = [...action.payload, ...state.messages]
                // console.log(action.payload)
            })

            .addMatcher(messagesApi.endpoints.sendMessage.matchFulfilled, (state, action: PayloadAction<MessageType>) => {
                // console.log('sendMessage:', state.messages, action.payload)
                state.messagesScrollSmoothFlag = !state.messagesScrollSmoothFlag
                state.messages.push(action.payload)
            })
    },
})

export default slice.reducer
export const { setMessages, addMessage } = slice.actions

export const selectMessages = (state: RootState) => state.messages.messages
export const selectMessagesScrollSmoothFlag = (state: RootState) => state.messages.messagesScrollSmoothFlag
