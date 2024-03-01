// 'use client'

import Image from "next/image";
import styles from "../../../page.module.css";
import {useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
import {useRouter, useSearchParams} from "next/navigation";
// import {useEffect} from "react";
import AsideChats from "@/components/AsideChats/AsideChats";
import ChatBox from "@/components/ChatBox/ChatBox";
import Chats from "@/components/Chats/Chats";
import {getAuthCookie, getChatMessagesAndRecipient, getUserChats} from "@/utils";


export const dynamic = 'force-dynamic'
// export const dynamicParams = false
// export const fetchCache = 'force-no-store'

export default async function Home({ params } : {
    params: { slug: string }
}) {

    const chatId = params.slug
    // if(!chatId)
    const serverSideMessagesAndRecipient = await getChatMessagesAndRecipient(chatId)
    // console.log('rrrrrrr: ', user)


    // console.log(result)
    // console.log(serverSideMessages)

    // console.log(serverSideMessages)

    // const userChats = await getUserChats()
    // const chatMessages = await getChatMessages(chatId as string)
    // const currentChat = userChats.find(chat => chat.id === Number(chatId)) || null
    return (
        <>
            {/*<Chats preloadedChats={userChats}/>*/}
            <ChatBox currentChatId={chatId} serverSideMessagesAndRecipient={serverSideMessagesAndRecipient} />
        </>
    );
}
