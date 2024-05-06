import type { FC } from 'react';
import { getUserChats, getPotentialUsersToChat } from "@/utils";
import PotentialChats from "@/components/PotentialChats/PotentialChats";
import {Metadata} from "next";
import {redirect} from "next/navigation";
import {Routes} from "@/Routes/routes";

export const metadata: Metadata = {
    title: "Потенциальные чаты",
}

const PotentialChatsPage: FC = async () => {
    const potentialChats = await getPotentialUsersToChat()
    const userChats = await getUserChats()

    if((!userChats || 'error' in userChats) || (!potentialChats || 'error' in potentialChats))
        throw 'PotentialChatsPage: Ошибка'

    if('redirect' in userChats || 'redirect' in potentialChats) {
        redirect(Routes.LOGIN)
    }

    return (
        <PotentialChats userChatsServer={userChats} potentialChats={potentialChats}/>
    )
}

export default PotentialChatsPage