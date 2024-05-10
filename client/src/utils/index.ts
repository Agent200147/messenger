import { cookies } from "next/headers";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chatModel";
import type { AuthenticatedUserType, UserInChatType } from "@/Models/User/userModel";
import type { MessageType } from "@/Models/Message/messageModel";


type FetchFailedType = {
    error: true,
} | {
    unauthorized: true
}

type CustomResponseType =  {
    user: AuthenticatedUserType
}

type ChatMessagesAndRecipientType = {
    unReadMessages: number,
    messages:MessageType[],
    recipients: UserInChatType[]
} | null

const myFetch = async <T>(url: string, method: string) : Promise<T | FetchFailedType> => {
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
    if ('unauthorized' in response) return false
    if ('error' in response) return response

    if ('user' in response) return response
}

export function getAuthCookie() {
    const authCookie = cookies().get('auth')?.value
    if (!authCookie) return
    return encodeURIComponent(authCookie)
}

export function getUserFromCookies(): boolean {
    const authCookie = cookies().get('auth')?.value
    return !!authCookie
}

export async function getUserChats() {
    return await myFetch<ChatTypeWithFullInfo[]>(`/chats`, 'GET')
}

export async function getPotentialUsersToChat() {
    return await myFetch<UserInChatType[]>('/chats/potential', 'GET')
}

export async function getChatMessagesAndRecipient(chatId: string) {
    return await myFetch<ChatMessagesAndRecipientType>(`/messages/${chatId}`, 'GET')
}