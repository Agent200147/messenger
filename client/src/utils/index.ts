import {cookies} from "next/headers";
import type {ChatTypeWithFullInfo} from "@/Models/Chat/chatModel";
import {AuthenticatedUserType, UserInChatType} from "@/Models/User/userModel";
import jwt from 'jsonwebtoken'
import {MessageType} from "@/Models/Message/messageModel";


type FetchFailedType = {
    error: true,
} | {
    unauthorized: true
}

type CustomResponseType =  {
    message: string
}

type ChatMessagesAndRecipientType = {
    unReadMessages: number,
    messages:MessageType[],
    recipients: UserInChatType[]
} | null

const myFetch = async <T>(url: string, method: string) : Promise<T | FetchFailedType | undefined> => {
    const authCookie = cookies().get('auth')?.value
    if (!authCookie) return { unauthorized: true }
    try {
        const response = await fetch(`${process.env.API_URL + url}`, {
            method,
            headers: {
                Accept: 'application/json',
                Cookie: `auth=${authCookie};`
            },
        })
        console.log('myFetch:', url, response.status)
        if (!response.ok)
        {
            if(response.status === 401) {
                return { unauthorized: true }
            }
            return { error: true }
        }

        const result = await response.json()
        return result as T
    } catch (error) {
        return { error: true }
    }
}

export async function getIsAuth() {
    const response = await myFetch<CustomResponseType>('/users/checkAuth', 'GET')
    console.log('getIsAuth:', response)
    if (!response) return false
    if ('error' in response)  return response
    if ('message' in response)  return response?.message === 'Ок'
}

export function getAuthCookie() {
    const authCookie = cookies().get('auth')?.value
    if (!authCookie) return
    return encodeURIComponent(authCookie)
}

export function getUserFromCookies(): AuthenticatedUserType | undefined {
    const authCookie = cookies().get('auth')?.value
    if (!authCookie) return
    try {
        const user = jwt.verify(authCookie, 'key404203230') as AuthenticatedUserType
        return user

    } catch (e) {
        return
    }
}

export async function getUserChats() {
    return await myFetch<ChatTypeWithFullInfo[]>(`/chats`, 'GET')
}

export async function getPotentialUsersToChat() {
    return await myFetch<UserInChatType[]>('/chats/potential', 'GET')
}

// export async function getChatMessages(chatId) {
//     const authCookie = getAuthCookie()
//
//     // console.log('rrrrrrr: ', user)
//     const response = await fetch(`http://localhost:8000/api/messages/${chatId}`, {
//         method: 'GET',
//         headers: {
//             Accept: 'application/json',
//             Cookie: `auth=${authCookie};`
//         },
//         // credentials: 'include',
//     })
//     // console.log(result)
//     return await response.json()
// }


export async function getChatMessagesAndRecipient(chatId: string) {
    return await myFetch<ChatMessagesAndRecipientType>(`/messages/${chatId}`, 'GET')
}
