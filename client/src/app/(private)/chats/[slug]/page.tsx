import { redirect } from "next/navigation";
import ChatBox from "@/components/ChatBox/ChatBox";
import { getChatMessagesAndRecipient } from "@/utils";
import {Metadata, ResolvingMetadata} from "next";

export const dynamic = 'force-dynamic'

type Props = {
    params: { slug: string }
}

export const metadata: Metadata = {
    title: 'Чат',
}

export default async function Home({ params } : Props) {
    const chatId = params.slug
    if (!(/^\d+$/.test(chatId))) redirect('/')

    const serverSideMessagesAndRecipient = await getChatMessagesAndRecipient(chatId)
    if (!serverSideMessagesAndRecipient || 'error' in serverSideMessagesAndRecipient)
        throw Error('ChatBox: Ошибка')

    if('unauthorized' in serverSideMessagesAndRecipient) {
        redirect('/login')
        return
    }

    return (
        <>
            {/*<Chats preloadedChats={userChats}/>*/}
            <ChatBox currentChatId={chatId} serverSideMessagesAndRecipient={serverSideMessagesAndRecipient} />
        </>
    )
}
