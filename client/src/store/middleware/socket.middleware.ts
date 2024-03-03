import { Middleware } from "redux";
import {
    connectionEstablished,
    initSocket,
    connectionLost, disconnectSocket,
} from "@/store/slices/socket.slice";
import SocketFactory from "@/socket/socket";
import type { SocketInterface } from "@/socket/socket";
import {addNewOnlineUser, addUnreadMessageToRecipient, setLastMessage, setOnlineUsers} from "@/store/slices/chatSlice";
import {messagesApi} from "@/api/messages/messgesApi";
import {CustomStore, RootState, storeType} from "@/store/store";
import {addMessage} from "@/store/slices/messageSlice";

enum SocketNativeOnEvent {
    Connect = "connect",
    Disconnect = "disconnect",
    Error = "err",
}

enum SocketEmitEvent {
    NewUser = "newUser",
    SendMessage = "send-message",
}

enum SocketOnEvent {
    OnlineUsers = "onlineUsers",
    GetMessage = "get-message",
}


const socketMiddleware: Middleware = (store) => {
    let socket: SocketInterface
    const getState = () => store.getState() as RootState


    return (next) => (action) => {
        if (initSocket.match(action)) {
            if (!socket && typeof window !== "undefined") {
                socket = SocketFactory.create()

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
                    console.log('SocketEvent.OnlineUsers', onlineUsers)
                })

                socket.socket.on(SocketOnEvent.GetMessage, (response) => {
                    const message = response.message
                    const currentChatId = getState().chats.currentChat?.chatId
                    store.dispatch(setLastMessage(message))
                    if (currentChatId != message.chatId) {
                        store.dispatch(addUnreadMessageToRecipient(Number(message.chatId)))
                        return
                    }
                    store.dispatch(addMessage(message))
                })
            }
        }

        if (addNewOnlineUser.match(action) && socket) {
            socket.socket.emit(SocketEmitEvent.NewUser, action.payload)
            // console.log('SocketEvent.NewUser', action.payload)
        }

        if(messagesApi.endpoints.sendMessage.matchFulfilled(action)) {
            const recipientId = getState().chats.currentChat?.recipientInfo.user.id
            if(!recipientId) return
            // console.log('SocketEvent.SendMessage', { ...action.payload, recipientId})
            socket.socket.emit(SocketEmitEvent.SendMessage, {message: action.payload, recipientId})
            // console.log('SocketEvent.SendMessage', action.payload)
        }

        if(disconnectSocket.match(action) && socket) {
            for (let socketOnEventKey in SocketOnEvent) {
                socket.socket.off(socketOnEventKey)
            }
            socket.socket.disconnect()
        }

        next(action)
    }
}

export default socketMiddleware