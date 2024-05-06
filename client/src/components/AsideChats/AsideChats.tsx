import Chats from "@/components/Chats/Chats";
import { getUserChats } from "@/utils";
import {redirect} from "next/navigation";
import {Routes} from "@/Routes/routes";

export default async function AsideChats () {
    const userChats = await getUserChats()
    console.log('AsideChats render')

    if(!userChats || 'error' in userChats) {
        throw 'AsideChats: Ошибка'
    }

    if('unauthorized' in userChats) {
        redirect(Routes.LOGIN)
    }

    return <Chats preloadedChats={userChats}/>
}