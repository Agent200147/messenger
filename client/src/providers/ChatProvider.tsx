'use client'
import {ReactNode, useEffect, useRef, useState} from "react";
import {useGetChatsMutation} from "@/api/chats/chatsApi";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
// import {socket} from "@/socket/socket";
import {
    addNewChat,
    addUnreadMessageToCurrentChat,
    addUnreadMessageToRecipient, markChatMessagesAsRead, markRecipientMessagesAsRead,
    selectCurrentChat, selectNewChat,
    selectOnlineUsers, selectUserChats, setCurrentChat,
    setLastMessage,
    setOnlineUsers
} from "@/store/slices/chatSlice";
import {useParams, useSearchParams} from "next/navigation";
import { addMessage, selectNewMessage } from "@/store/slices/messageSlice";
// import {Socket} from "node:net";
import {io, Socket} from "socket.io-client";
import {isEmpty} from "@/utils/ClientServices";
const readChatMessages = async (chatId: number, recipientId: number) => {
    const response = await fetch(`${process.env.API_URL}/chats/read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId, recipientId }),
        // cache: 'no-store'
        credentials: 'include',
    })
    // const resul
    return response.status === 200
}
let x = 0

const ChatProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
    const dispatch = useDispatch()
    const user = useSelector(selectUser)
    const params = useParams()
    const newMessage = useSelector(selectNewMessage)
    const currentChat = useSelector(selectCurrentChat)
    const onlineUsers = useSelector(selectOnlineUsers)
    const onlineUsersRef = useRef<number[]>()

    const newChat = useSelector(selectNewChat)
    onlineUsersRef.current = onlineUsers
    // console.log('onlineUsersRef', onlineUsersRef)
    // const { slug: currentChatId } = params
    const currentChatId = currentChat.chatId
    // console.log(currentChatId)
    // const [getChats] = useGetChatsMutation()
    //
    // useEffect(() => {
    //     if (!user) return
    //     getChats(user?.id)
    // }, [user]);



    const [socket, setSocket] = useState<Socket>()
    // useEffect(() => {
    //     if (!user) return
    //     // console.log('changes')
    //     // socket.connect()
    //     return () => {
    //         console.log('disconnect')
    //         socket.disconnect()
    //     }
    // }, [user])
    //
    useEffect(() => {
        if (isEmpty(user)) return
        // console.log(user)
        const newSocket = io('http://localhost:8001')
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user])


    useEffect(() => {
        if (isEmpty(user) || !socket || isEmpty(currentChat)) return
        const recipient = currentChat?.recipientInfo.user
        if(isEmpty(newMessage)) return
        socket.emit('send-message', {message: newMessage, recipient})
        dispatch(addUnreadMessageToCurrentChat(null))
        // console.log({message: newMessage, recipient})
        // dispatch(setLastMessage(newMessage))
    }, [socket, newMessage])


    useEffect(() => {
        if (isEmpty(user) || !socket) {
            return
        }

        socket.emit('newUser', user.id)
        socket.on('onlineUsers', (users) => {
            // console.log(user)
            dispatch(setOnlineUsers(users))
        })

        socket.on('get-new-chat', (newChat) => {
            // console.log(user)
            dispatch(addNewChat(newChat))
        })

        return () => {
            socket.off('onlineUsers')
            socket.off('get-new-chat')
        }
    }, [user, socket])

    useEffect(() => {
        if (!user || !socket) return
        socket.on('get-message', (response) => {
            const message = response.message
            console.log(response)
            // console.log('response', response)
            dispatch(setLastMessage(message))

            if (currentChatId != message.chatId) {
                console.log(currentChatId, currentChatId)
                console.log('true')
                // console.log('НЕ РАВНО')
                dispatch(addUnreadMessageToRecipient(Number(message.chatId)))
                // dispatch(addUnreadMessageToRecipient(Number(message.chatId)))
                return
            }

            dispatch(addMessage(message));
            // (async () => {
            //     const recipientId = currentChat?.recipientInfo.user.id
            //     // console.log(currentChat?.recipientInfo.user)
            //     const readChatResponse = await readChatMessages(currentChat.chatId, recipientId)
            //     dispatch(markRecipientMessagesAsRead(currentChat.chatId))
            //
            //     if (readChatResponse && onlineUsers.find(userId => userId === recipientId)) {
            //         console.log('РАВНО')
            //         socket.emit('read-messages', { chatId: Number(currentChatId), recipientId })
            //     }
            // })()

            (async () => {
                // console.log(currentChat)
                if (!currentChatId) return
                console.log('readChatResponse');

                const recipientId = currentChat?.recipientInfo.user.id
                // console.log(currentChat?.recipientInfo.user)
                // console.log(recipientId)
                // x++
                // console.log(socket)
                const readChatResponse = await readChatMessages(currentChatId, recipientId)
                // console.log(recipientId)
                if (readChatResponse) {
                    dispatch(markRecipientMessagesAsRead(currentChatId))
                    socket.emit('read-messages', { chatId: Number(currentChatId), recipientId })

                    // if (onlineUsersRef.current.find(userId => userId === recipientId)) {
                    // }
                }
            })()
        });


        (async () => {
            if (!currentChatId || currentChat?.recipientInfo.unReadMessages === 0) return
            const recipientId = currentChat?.recipientInfo.user.id
            // console.log(currentChat?.recipientInfo.user)
            // console.log(recipientId)
            // console.log(socket)
            const readChatResponse = await readChatMessages(currentChat.chatId, recipientId)
            // console.log(recipientId)
            if (readChatResponse) {
                dispatch(markRecipientMessagesAsRead(currentChatId))
                socket.emit('read-messages', { chatId: Number(currentChatId), recipientId })
                // console.log(onlineUsersRef.current)
                // if (onlineUsersRef.current.find(userId => userId === recipientId)) {
                //
                // }
            }
        })()


        socket.on('mark-read-messages', chatId => {
            // currentChat
            console.log('mark-read-messages')
            dispatch(markChatMessagesAsRead(chatId))
            // console.log('mark-read-messages in chat', chatId)
        })
        // socket.on('get-notification', response => {
        //     const isChatOpened = currentChat?.members.some(id => id == response.senderId)
        //     if (isChatOpened) {
        //         dispatch(setNotifications([{...response, isRead: true}, ...notifications]))
        //     } else {
        //         dispatch(setNotifications([response, ...notifications]))
        //     }
        // })
        return () => {
            socket.off('get-message')
            socket.off('mark-read-messages')
            // socket.off('get-notification')
        }
    }, [socket, currentChatId])


    useEffect(() => {
        if (isEmpty(newChat) || !socket) return
        const recipientId = newChat?.recipientInfo.user.id
        const updatedChat = { ...newChat, recipientInfo: { ...newChat.recipientInfo, user: user } }
        // chat.recipientInfo.user = user
        // console.log(recipientId)
        socket.emit('create-new-chat', { newChat: updatedChat, recipientId })
    }, [socket, newChat]);


    return <> {children}</>
}

export default ChatProvider;