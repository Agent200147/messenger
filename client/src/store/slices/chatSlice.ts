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
    recipientCanvas: any,
    typingTrigger: boolean,
    isDrawingRecipient: boolean
}

const initialState: InitialState = {
    chats: [],
    currentChat: null,
    newChat: null,
    onlineUsers: [],
    notifications: [],
    recipientCanvas: null,
    typingTrigger: false,
    isDrawingRecipient: false
}

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

        removeOnlineUser: (state, action) => {
            state.onlineUsers = state.onlineUsers.filter(userId => userId !== action.payload)
            if (state.currentChat && state.currentChat.recipientInfo.user.id === action.payload) {
                state.currentChat.recipientInfo.user.lastOnline = (new Date()).toString()
                console.log('removeOnlineUser')
            }

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

        sendTypingTrigger: (state, action) => {
            return
        },

        getTypingTrigger: (state) => {
            state.typingTrigger = !state.typingTrigger
        },

        setRecipientCanvas: (state, action) => {
            state.recipientCanvas = action.payload
        },

        drawToRecipient: (state, action) => {
            return
        },

        endDrawToRecipient: (state, action) => {
            return
        },

        setIsRecipientDrawing: (state, action) => {
            state.isDrawingRecipient = action.payload
        }
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

export const { setChats, setCurrentChat, setNewChat, addNewChat, setOnlineUsers, addNewOnlineUser, removeOnlineUser, setLastMessage, setNotifications, addUnreadMessageToRecipient, markRecipientMessagesAsRead, addUnreadMessageToCurrentChat, markChatMessagesAsRead, setRecipientCanvas, sendTypingTrigger, getTypingTrigger, drawToRecipient, endDrawToRecipient, setIsRecipientDrawing } = slice.actions;

export const selectUserChats = (state: RootState) => state.chats.chats
export const selectCurrentChat = (state: RootState) => state.chats.currentChat
export const selectNewChat = (state: RootState) => state.chats.newChat
export const selectOnlineUsers = (state: RootState) => state.chats.onlineUsers
export const selectRecipientCanvas = (state: RootState) => state.chats.recipientCanvas
export const selectIsDrawingRecipient = (state: RootState) => state.chats.isDrawingRecipient
export const selectTypingTrigger = (state: RootState) => state.chats.typingTrigger
export const selectNotifications = (state: RootState) => state.chats.notifications
