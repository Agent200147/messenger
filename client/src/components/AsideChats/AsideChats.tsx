import Chats from "@/components/Chats/Chats";
import { getUserChats } from "@/utils";
import {redirect} from "next/navigation";

export default async function AsideChats () {
    const userChats = await getUserChats()
    console.log('AsideChats render')

    if(!userChats || 'error' in userChats) {
        throw 'AsideChats: Ошибка'
    }

    return <Chats preloadedChats={userChats}/>
}