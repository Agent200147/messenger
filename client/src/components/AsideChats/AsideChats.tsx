import styles from './asideChats.module.css'
import { type FC, useEffect } from 'react';
import { useSelector } from "react-redux";
import Image from "next/image";

import { selectUser } from "@/store/slices/authSlice";
import { useGetChatsMutation } from "@/api/chats/chatsApi";
import {selectUserChats, setChats} from "@/store/slices/chatSlice";
import avatarImg from '@/public/img/avatar.svg'
import Chats from "@/components/Chats/Chats";
import {getAuthCookie, getUserChats, getUserFromCookies} from "@/utils";
import {store} from "@/store/store";
// import {getUserChats} from "@/app/utils";





export default async function AsideChats () {
    // const user = useSelector(selectUser)
    // const userChats = useSelector(selectUserChats)
    // console.log('render')
    //
    // const [getUserChatsTriggerMutation, { isLoading: isLoadingUserChats }]  = useGetChatsMutation()
    // useEffect(() => {
    //     if (user) {
    //         getUserChatsTriggerMutation(user?.id)
    //     }
    // }, [user]);

    // const userChats = await getUserChats()
    const userChats = await getUserChats()
    console.log('AsideChats render')
    // const user = getUserFromCookies()
    // store.dispatch(setChats(userChats))
    // console.log(store.getState())
    return (
        <Chats preloadedChats={userChats}/>
    )
}

// export default AsideChats;