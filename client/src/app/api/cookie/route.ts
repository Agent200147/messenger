import {getAuthCookie, getUserFromCookies} from "@/utils";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";

// export async function GET() {
//     const authCookie = getAuthCookie()
//     const user = getUserFromCookies()
//     if (!user) return Response.json('Не авторизован')
//
//     // console.log('rrrrrrr: ', user)
//     const response = await fetch(`http://localhost:8000/api/chats/${user.id}`, {
//         method: 'POST',
//         headers: {
//             Accept: 'application/json',
//             Cookie: `auth=${authCookie};`
//         },
//         // credentials: 'include',
//     })
//     const result = await response.json()
//     console.log(result)
//     return Response.json(result)
// }

// export async function GET(request: Request, { params }: { params: { slug: string } }) {
//     const authCookie = getAuthCookie()
//     const chatId = params.slug
//     // console.log('rrrrrrr: ', user)
//     const response = await fetch(`http://localhost:8000/api/messages/${chatId}`, {
//         method: 'GET',
//         headers: {
//             Accept: 'application/json',
//             Cookie: `auth=${authCookie};`
//         },
//         cache: 'no-store'
//         // credentials: 'include',
//     })
//     // console.log('getChatMessagesAndRecipient')
//     // return NextResponse.json(response)
//     // console.log(result)
//     // return await response.json()
//
//     const data = await response.json()
//
//     return Response.json({ data })
// }
export async function POST(request: Request, { params }: { params: { slug: string } }) {
    cookies().delete('auth')
    console.log('clear')
    return Response.json('Ок')
}

