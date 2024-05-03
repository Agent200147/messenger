import type { FC } from 'react';
import { getUserChats, getPotentialUsersToChat } from "@/utils";
import PotentialChats from "@/components/PotentialChats/PotentialChats";

const PotentialChatsServer: FC = async () => {
    const potentialChats = await getPotentialUsersToChat()
    const userChats = await getUserChats()
    // const userChats2 = await getUserChats()
    return (
        <PotentialChats userChatsServer={userChats} potentialChats={potentialChats}/>
    );
};

export default PotentialChatsServer;