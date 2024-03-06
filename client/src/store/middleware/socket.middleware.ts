import type { RootState } from "@/store/store";
import type { SocketInterface } from "@/socket/socket";

import { Middleware } from "redux";

import {
    connectionEstablished,
    initSocket,
    connectionLost, disconnectSocket,
} from "@/store/slices/socket.slice";
import SocketFactory from "@/socket/socket";
import {
    addNewChat,
    addNewOnlineUser, addUnreadMessageToCurrentChat,
    addUnreadMessageToRecipient, markChatMessagesAsRead,
    markRecipientMessagesAsRead, removeOnlineUser, setCurrentChat,
    setLastMessage,
    setOnlineUsers
} from "@/store/slices/chatSlice";
import { messagesApi } from "@/api/messages/messgesApi";
import { addMessage } from "@/store/slices/messageSlice";
import { chatApi } from "@/api/chats/chatsApi";
import { readChatMessages, setLastOnline } from "@/utils/ClientServices";

enum SocketNativeOnEvent {
    Connect = "connect",
    Disconnect = "disconnect",
    Error = "err",
}

enum SocketEmitEvent {
    NewUser = 'newUser',
    SendMessage = 'send-message',
    ReadMessages = 'read-messages',
    CreateNewChat = 'create-new-chat',
    RemoveOnlineUser = 'remove-online-user',
}

enum SocketOnEvent {
    OnlineUsers = 'onlineUsers',
    GetMessage = 'get-message',
    MarkReadMessages = 'mark-read-messages',
    GetNewChat = 'get-new-chat',
    GetRemoveOnlineUser = 'get-remove-online-user',

}

const socketMiddleware: Middleware = (store) => {
    let socket: SocketInterface

    const markChatMessagesAsReadAndEmit = async (currentChatId: number, recipientId: number) => {
        const response = await readChatMessages(currentChatId, recipientId)
        if (response) {
            store.dispatch(markRecipientMessagesAsRead(currentChatId))
            socket.socket.emit(SocketEmitEvent.ReadMessages, { chatId: Number(currentChatId), recipientId })
        }
    }

    return (next) => (action) => {
        const getState = () => store.getState() as RootState

        if (initSocket.match(action)) {
            if (!socket && typeof window !== "undefined") {
                socket = SocketFactory.create()

                const currentChat = getState().chats.currentChat
                const currentChatId = currentChat?.chatId
                const recipientId = currentChat?.recipientInfo.user.id

                if (currentChatId && recipientId && currentChat?.recipientInfo.unReadMessages !== 0) {
                    console.log('markChatMessagesAsReadAndEmit', currentChatId, recipientId)
                    markChatMessagesAsReadAndEmit(currentChatId, recipientId)
                }

                socket.socket.on(SocketNativeOnEvent.Connect, () => {
                    store.dispatch(connectionEstablished())
                })

                socket.socket.on(SocketNativeOnEvent.Error, (message) => {
                    console.error(message)
                })

                socket.socket.on(SocketNativeOnEvent.Disconnect, (reason) => {
                    store.dispatch(connectionLost())
                })

                socket.socket.on(SocketOnEvent.OnlineUsers, (onlineUsers) => {
                    store.dispatch(setOnlineUsers(onlineUsers))
                })

                socket.socket.on(SocketOnEvent.GetMessage, (response) => {
                    const message = response.message
                    const currentChat = getState().chats.currentChat
                    const currentChatId = currentChat?.chatId
                    const recipientId = currentChat?.recipientInfo.user.id

                    store.dispatch(setLastMessage(message))
                    if (currentChatId != message.chatId) {
                        store.dispatch(addUnreadMessageToRecipient(Number(message.chatId)))
                        return
                    }
                    store.dispatch(addMessage(message))

                    if (!currentChatId || !recipientId) return
                    markChatMessagesAsReadAndEmit(currentChatId, recipientId)

                })

                socket.socket.on(SocketOnEvent.MarkReadMessages, (chatId) => {
                    store.dispatch(markChatMessagesAsRead(chatId))
                })

                socket.socket.on(SocketOnEvent.GetNewChat, (newChat) => {
                    store.dispatch(addNewChat(newChat))
                })

                socket.socket.on(SocketOnEvent.GetRemoveOnlineUser, (userId) => {
                    console.log('SocketOnEvent.GetRemoveOnlineUser', userId)
                    store.dispatch(removeOnlineUser(userId))
                })
            }
        }

        if (addNewOnlineUser.match(action) && socket) {
            socket.socket.emit(SocketEmitEvent.NewUser, action.payload)
        }

        if(setCurrentChat.match(action) && socket) {
            // console.log(action.payload)
            const currentChat = action.payload
            const currentChatId = currentChat?.chatId
            const recipientId = currentChat?.recipientInfo.user.id
            if (!currentChatId || !recipientId || currentChat?.recipientInfo.unReadMessages === 0) {
                next(action)
                return
            }
            markChatMessagesAsReadAndEmit(currentChatId, recipientId)
        }

        if(messagesApi.endpoints.sendMessage.matchFulfilled(action)) {
            const recipientId = getState().chats.currentChat?.recipientInfo.user.id
            if(!recipientId) return
            store.dispatch(addUnreadMessageToCurrentChat())
            socket.socket.emit(SocketEmitEvent.SendMessage, {message: action.payload, recipientId})
        }

        if(chatApi.endpoints.createChat.matchFulfilled(action)) {
            const newChat = action.payload
            const recipientId = newChat.recipientInfo.user.id
            const user = getState().auth.user
            const updatedChat = { ...newChat, recipientInfo: { ...newChat.recipientInfo, user }}
            console.log('SocketEmitEvent.CreateNewChat', { newChat: updatedChat, recipientId })

            if(!recipientId || !user) return
            socket.socket.emit(SocketEmitEvent.CreateNewChat, { newChat: updatedChat, recipientId })
        }

        if(disconnectSocket.match(action) && socket) {
            setLastOnline()
            const user = getState().auth.user
            if (user) socket.socket.emit(SocketEmitEvent.RemoveOnlineUser, user.id)
            for (let socketOnEventKey in SocketOnEvent) {
                socket.socket.off(socketOnEventKey)
            }
            socket.socket.disconnect()
        }
        next(action)
    }
}

export default socketMiddleware