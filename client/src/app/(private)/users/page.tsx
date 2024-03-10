import type { FC } from 'react';
import { getUserChats, getUserPotentialChats } from "@/utils";
import PotentialChats from "@/components/PotintialChats/PotentialChats";

const PotentialChatsServer: FC = async () => {
    const potentialChats = await getUserPotentialChats()
    const userChats = await getUserChats()
    // const userChats2 = await getUserChats()
    return (
        <PotentialChats userChatsServer={userChats} potentialChats={potentialChats}/>
    )
}

export default PotentialChatsServer;