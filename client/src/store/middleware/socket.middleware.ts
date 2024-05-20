import type { RootState } from "@/store/store";
import type { SocketInterface } from "@/socket/socket";

import { Middleware } from "redux";

import {
    connectionEstablished,
    initSocket,
    connectionLost,
    disconnectSocket,
} from "@/store/slices/socket.slice";
import SocketFactory from "@/socket/socket";
import {
    addNewChat,
    addNewOnlineUser,
    addUnreadMessageToCurrentChat,
    addUnreadMessageToRecipient,
    markChatMessagesAsRead,
    markRecipientMessagesAsRead,
    removeOnlineUser,
    setCurrentChat,
    setLastMessage,
    setOnlineUsers,
} from "@/store/slices/chat.slice";
import { messagesApi } from "@/api/messages/messgesApi";
import { addMessage } from "@/store/slices/message.slice";
import { chatApi } from "@/api/chats/chatsApi";
import { readChatMessages, setLastOnline } from "@/utils/ClientServices";

// enum SocketNativeOnEvent {
//     Connect = "connect",
//     Disconnect = "disconnect",
//     Error = "err",
// }

// export enum SocketEmitEvent {
//     NewUser = 'newUser',
//     SendMessage = 'send-message',
//     ReadMessages = 'readMessages',
//     CreateNewChat = 'create-new-chat',
//     RemoveOnlineUser = 'remove-online-user',
//     DrawToRecipient = 'draw-to-recipient',
//     EndDrawToRecipient = 'end-draw-to-recipient',
//     TypingTrigger = 'typing-trigger',
//     ClearCanvasToRecipient = 'clear-canvas',
// }
//
// export enum SocketOnEvent {
//     OnlineUsers = 'onlineUsers',
//     GetMessage = 'get-message',
//     MarkReadMessages = 'mark-read-messages',
//     GetNewChat = 'get-new-chat',
//     GetRemoveOnlineUser = 'get-remove-online-user',
//     GetRecipientDraw = 'get-recipient-draw',
//     GetEndRecipientDraw = 'get-end-recipient-draw',
//     GetTypingTrigger = 'get-typing-trigger',
//     GetClearRecipientCanvas = 'get-clear-canvas',
// }

const socketMiddleware: Middleware = (store) => {
    let socketFactory: SocketInterface
    const markChatMessagesAsReadAndEmit = async (currentChatId: number, recipientId: number) => {
        const response = await readChatMessages(currentChatId, recipientId)
        if (response) {
            store.dispatch(markRecipientMessagesAsRead(currentChatId))
            socketFactory.socket.emit('readMessages', { chatId: currentChatId, recipientId })
        }
    }

    return (next) => (action) => {
        const getState = () => store.getState() as RootState

        if (initSocket.match(action)) {
            if (!socketFactory && typeof window !== "undefined") {
                socketFactory = SocketFactory.create()
                const { socket } = socketFactory

                const currentChat = getState().chats.currentChat
                const currentChatId = currentChat?.chatId
                const recipientId = currentChat?.recipientInfo.user.id

                if (currentChatId && recipientId && currentChat?.recipientInfo.unReadMessages !== 0) {
                    console.log('markChatMessagesAsReadAndEmit', currentChatId, recipientId)
                    markChatMessagesAsReadAndEmit(currentChatId, recipientId)
                }

                socket.on('connect', () => {
                    store.dispatch(connectionEstablished())
                })

                socket.on('connect_error', (message) => {
                    console.error(message)
                })

                socket.on('disconnect', (reason) => {
                    store.dispatch(connectionLost())
                    console.log(reason)
                })

                socket.on('getOnlineUsers', (onlineUsers) => {
                    store.dispatch(setOnlineUsers(onlineUsers))
                    console.log('getOnlineUsers:', onlineUsers)
                })

                socket.on('getMessage', (response) => {
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

                socket.on('getReadMessages', (chatId) => {
                    store.dispatch(markChatMessagesAsRead(chatId))
                })

                socket.on('getNewChat', (newChat) => {
                    store.dispatch(addNewChat(newChat))
                })

                socket.on('getRemoveOnlineUser', (userId) => {
                    console.log('SocketOnEvent.GetRemoveOnlineUser', userId)
                    store.dispatch(removeOnlineUser(userId))
                })

                // socket.socket.on(SocketOnEvent.GetRecipientDraw, (data) => {
                //     if(data.chatId !== getState().chats.currentChat?.chatId) return
                //     store.dispatch(setRecipientCanvas(data))
                //     store.dispatch(setIsRecipientDrawing(true))
                // })

                // socket.socket.on(SocketOnEvent.GetEndRecipientDraw, (chatId) => {
                //     if(chatId !== getState().chats.currentChat?.chatId) return
                //     store.dispatch(setIsRecipientDrawing(false))
                // })

                // socket.socket.on(SocketOnEvent.GetTypingTrigger, () => {
                //     store.dispatch(setRecipientTypingTrigger(!getState().chats.typingTrigger))
                // })

                // socket.socket.on(SocketOnEvent.GetClearCanvasToRecipient, () => {
                //     store.dispatch(setClearRecipientCanvasFlag(!getState().chats.clearRecipientCanvasFlag))
                // })
            }
        }

        if (addNewOnlineUser.match(action) && socketFactory) {
            socketFactory.socket.emit('newUser', action.payload)
        }

        if(setCurrentChat.match(action) && socketFactory) {
            const currentChat = action.payload
            const currentChatId = currentChat?.chatId
            const recipientId = currentChat?.recipientInfo.user.id
            if (!currentChatId || !recipientId || currentChat?.recipientInfo.unReadMessages === 0) {
                next(action)
                return
            }
            markChatMessagesAsReadAndEmit(currentChatId, recipientId)
        }

        if(messagesApi.endpoints.sendMessage.matchFulfilled(action) && socketFactory) {
            const recipientId = getState().chats.currentChat?.recipientInfo.user.id
            if(!recipientId) return
            store.dispatch(addUnreadMessageToCurrentChat())
            socketFactory.socket.emit('sendMessage', { message: action.payload, recipientId })
        }

        if(chatApi.endpoints.createChat.matchFulfilled(action) && socketFactory) {
            const newChat = action.payload
            const recipientId = newChat.recipientInfo.user.id
            const user = getState().auth.user

            if(!recipientId || !user) return

            const updatedChat = { ...newChat, recipientInfo: { ...newChat.recipientInfo, user }}

            socketFactory.socket.emit('createNewChat', { newChat: updatedChat, recipientId })
        }

        // if(drawToRecipient.match(action)) {
        //     // console.log('sendMyCanvas:', action.payload)
        //     socket.socket.emit(SocketEmitEvent.DrawToRecipient, action.payload)
        // }
        //
        // if(endDrawToRecipient.match(action)) {
        //     // console.log('sendMyCanvas:', action.payload)
        //     socket.socket.emit(SocketEmitEvent.EndDrawToRecipient, action.payload)
        // }

        // if(sendTypingTrigger.match(action)) {
        //     // console.log('sendTypingTrigger:', action.payload)
        //     socket.socket.emit(SocketEmitEvent.TypingTrigger, action.payload)
        // }
        //
        // if(clearRecipientCanvas.match(action)) {
        //     socket.socket.emit(SocketEmitEvent.ClearCanvasToRecipient, action.payload)
        // }


        if(disconnectSocket.match(action) && socketFactory) {
            setLastOnline()
            const user = getState().auth.user
            if (user) socketFactory.socket.emit('removeOnlineUser', user.id)
            console.log('disconnectSocket')
            socketFactory.socket.off()
            socketFactory.socket.disconnect()
        }
        next(action)
    }
}

export default socketMiddleware