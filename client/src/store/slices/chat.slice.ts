import type { Draft, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/store/store";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chat";
import type { NotificationType } from "@/Models/Notification/notificationModel";
import type { Nullable } from "@/utils/typeUtils";
import type { MessageType } from "@/Models/Message/message";

import { createSlice } from "@reduxjs/toolkit";

import { chatApi } from "@/api/chats/chatsApi";
import { messagesApi } from "@/api/messages/messgesApi";

interface InitialState {
    chats: ChatTypeWithFullInfo[],
    currentChat: Nullable<ChatTypeWithFullInfo>,
    onlineUsers: number[],
    notifications: NotificationType[],
    recipientCanvas: Nullable<{ chatId: number, x: number, y: number }>,
    isDrawingRecipient: boolean,
}

const initialState: InitialState = {
    chats: [],
    currentChat: null,
    onlineUsers: [],
    notifications: [],
    recipientCanvas: null,
    isDrawingRecipient: false,
}

const findChatById = (state:  Draft<InitialState>, chatId: number) => state.chats?.find(chat => chat.chatId === chatId)

const slice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        setChats: (state, action: PayloadAction<ChatTypeWithFullInfo[]>) => {
            state.chats = action.payload
        },
        setCurrentChat: (state, action: PayloadAction<Nullable<ChatTypeWithFullInfo>>) => {
            state.currentChat = action.payload
        },

        addNewChat: (state, action: PayloadAction<ChatTypeWithFullInfo>) => {
            state.chats.push(action.payload)
        },

        setOnlineUsers: (state, action: PayloadAction<number[]>) => {
            state.onlineUsers = action.payload
        },

        addNewOnlineUser: (state, action: PayloadAction<number>) => {
            state.onlineUsers.push(action.payload)
            // console.log('addNewOnlineUser')
        },

        removeOnlineUser: (state, action: PayloadAction<number>) => {
            state.onlineUsers = state.onlineUsers.filter(userId => userId !== action.payload)
            if (state.currentChat && state.currentChat.recipientInfo.user.id === action.payload) {
                state.currentChat.recipientInfo.user.lastOnline = (new Date()).toString()
                // console.log('removeOnlineUser')
            }
        },

        setLastMessage: (state, action: PayloadAction<MessageType>) => {
            const chat = findChatById(state, action.payload.chatId)
            if(!chat) return
            chat.lastMessage = action.payload
        },

        setNotifications: (state, action: PayloadAction<NotificationType[]>) => {
            state.notifications = action.payload
        },

        markRecipientMessagesAsRead: (state, action: PayloadAction<number>) => {
            const chat = findChatById(state, action.payload)
            if (!chat) return
            chat.recipientInfo.unReadMessages = 0
        },

        addUnreadMessageToRecipient: (state, action: PayloadAction<number>) => {
            const chat = findChatById(state, action.payload)
            // console.log(chat)
            if (!chat) return
            chat.recipientInfo.unReadMessages++
        },

        markChatMessagesAsRead: (state, action: PayloadAction<number>) => {
            // state.currentChat.unReadMessages = 0
            const chat = findChatById(state, action.payload)
            if (!chat) return
            chat.unReadMessages = 0
            if (chat.chatId === state.currentChat?.chatId)
                state.currentChat && (state.currentChat.unReadMessages = 0)
        },

        addUnreadMessageToCurrentChat: (state) => {
            state.currentChat && state.currentChat.unReadMessages++
            const chat = state.chats.find(chat => chat.chatId === state.currentChat?.chatId)
            if (!chat) return
            chat.unReadMessages++
        },
    },

    extraReducers: (builder) => {
        builder
            .addMatcher(chatApi.endpoints.getChats.matchFulfilled, (state, action: PayloadAction<ChatTypeWithFullInfo[]>) => {
                state.chats = action.payload
            })

            .addMatcher(chatApi.endpoints.createChat.matchFulfilled, (state, action: PayloadAction<ChatTypeWithFullInfo>) => {
                state.chats.push(action.payload)
                state.currentChat = action.payload
            })

            .addMatcher(messagesApi.endpoints.sendMessage.matchFulfilled, (state, action: PayloadAction<MessageType>) => {
                const chatToRefresh = findChatById(state, action.payload.chatId)
                if(chatToRefresh) chatToRefresh.lastMessage = action.payload
            })
    },
})

export default slice.reducer
export const { setChats, setCurrentChat, addNewChat, setOnlineUsers, addNewOnlineUser, removeOnlineUser, setLastMessage, setNotifications, addUnreadMessageToRecipient, markRecipientMessagesAsRead, addUnreadMessageToCurrentChat, markChatMessagesAsRead } = slice.actions

export const selectUserChats = (state: RootState) => state.chats.chats
export const selectCurrentChat = (state: RootState) => state.chats.currentChat
export const selectOnlineUsers = (state: RootState) => state.chats.onlineUsers
export const selectNotifications = (state: RootState) => state.chats.notifications
