import { FC } from 'react';
import {getUserPotentialChats} from "@/utils";
import PotentialChats from "@/components/PotintialChats/PotentialChats";

const PotentialChatsServer: FC = async () => {
    const potentialChats = await getUserPotentialChats()
    return (
        <PotentialChats potentialChats={potentialChats}/>
    );
};

export default PotentialChatsServer;