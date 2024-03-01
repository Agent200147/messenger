// 'use server';
import {cookies} from "next/headers";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chatModel";
import {AuthenticatedUserType} from "@/Models/User/userModel";
import {deleteUserCookies} from "@/app/actions";
import jwt from 'jsonwebtoken'
import {isEmpty} from "@/utils/ClientServices";

export async function getIsAuth() {
    const authCookie = cookies().get('auth')?.value
    if (!authCookie) return
    // const resultCookies = encodeURIComponent(authCookie)

    try {
        const response = await fetch('http://localhost:8000/api/users/checkAuth', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Cookie: `auth=${authCookie};`
            },
            // credentials: 'include',
        })
        // console.log('response', response)
        const result = await response.json()
        return result.message === 'Ок'
    } catch (e) {
        return false
    }

    // console.log('result ', result)
    // if (result.message !== 'Ок') {
    //     const response = await fetch('http://localhost:3000/api/cookie', {
    //         method: 'POST'
    //     })
    //     const result = await response.json()
    //     return false
    // }
    // return false
}

export function getAuthCookie() {
    const authCookie = cookies().get('auth')?.value as string
    if (!authCookie) return
    return encodeURIComponent(authCookie)
}

export function getUserFromCookies(): AuthenticatedUserType | undefined {
    const authCookie = cookies().get('auth')?.value as string
    if (!authCookie) return
    try {
        const user = jwt.verify(authCookie, 'key404203230') as AuthenticatedUserType
        return user

    } catch (e) {
        return
    }
}

export async function getUserChats(): Promise<ChatTypeWithFullInfo[] | undefined> {
    const authCookie = getAuthCookie()
    const user = getUserFromCookies()
    // console.log(authCookie, user)
    if(!authCookie || !user) return
    // console.log('rrrrrrr: ', user)
    const response = await fetch(`http://localhost:8000/api/chats/${user.id}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Cookie: `auth=${authCookie};`
        },
        cache: 'no-store'
        // credentials: 'include',
    })
    // console.log(result)
    return await response.json()
}

export async function getUserPotentialChats(): Promise<ChatTypeWithFullInfo[] | undefined> {
    const authCookie = getAuthCookie()
    console.log('getUserPotentialChats')
    // const user = getUserFromCookies()
    // console.log(authCookie, user)
    if(!authCookie) return
    const response = await fetch(`http://localhost:8000/api/chats/potential`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Cookie: `auth=${authCookie};`
        },
        cache: 'no-store'
        // credentials: 'include',
    })
    // console.log(result)
    return await response.json()
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
    const authCookie = getAuthCookie()

    // console.log('rrrrrrr: ', user)
    const response = await fetch(`http://localhost:8000/api/messages/${chatId}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Cookie: `auth=${authCookie};`
        },
        // cache: 'no-store'
        credentials: 'include',
    })
    const result = await response.json()

    return result
}
