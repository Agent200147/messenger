// "use client";
import {createSlice, Draft} from "@reduxjs/toolkit";
import { chatApi } from "@/api/chats/chatsApi";
import { messagesApi } from "@/api/messages/messgesApi";
import type { RootState } from "@/store/store";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chatModel";
import type { UserType } from "@/Models/User/userModel";
import type { NotificationType } from "@/Models/Notification/notificationModel";
import type {Nullable} from "@/utils/typeUtils";




interface InitialState {
    chats: ChatTypeWithFullInfo[];
    currentChat: Nullable<ChatTypeWithFullInfo>,
    newChat: Nullable<ChatTypeWithFullInfo>,
    onlineUsers: number[],
    notifications: NotificationType[],
}

const initialState: InitialState = {
    chats: [],
    currentChat: null,
    newChat: null,
    onlineUsers: [],
    notifications: [],
};

const findChatById = (state:  Draft<InitialState>, chatId: number) => state.chats?.find(chat => chat.chatId === chatId)


const slice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload

        },
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload
        },

        setNewChat: (state, action) => {
            state.newChat = action.payload
        },


        addNewChat: (state, action) => {
            state.chats.push(action.payload)
        },

        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload
        },

        addNewOnlineUser: (state, action) => {
            state.onlineUsers.push(action.payload)
            console.log('addNewOnlineUser')
        },

        setLastMessage: (state, action) => {
            const chat = findChatById(state, action.payload.chatId)
            if(!chat) return
            chat.lastMessage = action.payload
        },

        setNotifications: (state, action) => {
            state.notifications = action.payload
        },

        markRecipientMessagesAsRead: (state, action) => {
            const chat = findChatById(state, action.payload)
            if (!chat) return
            chat.recipientInfo.unReadMessages = 0
        },

        addUnreadMessageToRecipient: (state, action) => {
            const chat = findChatById(state, action.payload)
            // console.log(chat)
            if (!chat) return
            chat.recipientInfo.unReadMessages++
        },

        markChatMessagesAsRead: (state, action) => {
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
            .addMatcher(chatApi.endpoints.getChats.matchFulfilled, (state, action) => {
                state.chats = action.payload;
            })

            .addMatcher(chatApi.endpoints.createChat.matchFulfilled, (state, action) => {
                state.chats.push(action.payload)
                state.currentChat = action.payload
                state.newChat = action.payload
            })

            .addMatcher(messagesApi.endpoints.sendMessage.matchFulfilled, (state, action) => {
                const chatToRefresh = findChatById(state, action.payload.chatId)
                if(chatToRefresh) chatToRefresh.lastMessage = action.payload
            })
    },
});

export default slice.reducer;

export const { setChats, setCurrentChat, setNewChat, addNewChat, setOnlineUsers, addNewOnlineUser, setLastMessage, setNotifications, addUnreadMessageToRecipient, markRecipientMessagesAsRead, addUnreadMessageToCurrentChat, markChatMessagesAsRead } = slice.actions;

export const selectUserChats = (state: RootState) => state.chats.chats
export const selectCurrentChat = (state: RootState) => state.chats.currentChat
export const selectNewChat = (state: RootState) => state.chats.newChat
export const selectOnlineUsers = (state: RootState) => state.chats.onlineUsers
export const selectNotifications = (state: RootState) => state.chats.notifications
