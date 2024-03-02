'use client'

import styles from './chats.module.css'

import { type ChangeEvent, useEffect, useState} from "react";
import type { FC } from "react";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chatModel";
import ChatItem from "@/components/ChatItem/ChatItem";
import {useDispatch, useSelector} from "react-redux";
import {selectUserChats, setChats, setCurrentChat} from "@/store/slices/chatSlice";
import {selectUser} from "@/store/slices/authSlice";
import {AuthenticatedUserType} from "@/Models/User/userModel";
import SearchInput from "@/components/SearchInput/SearchInput";
import {useGetChatsMutation} from "@/api/chats/chatsApi";
import {useParams} from "next/navigation";
import {log} from "node:util";

type ChatsProps = {
    preloadedChats: ChatTypeWithFullInfo[]
}

const Chats: FC<ChatsProps> = ({ preloadedChats }) => {
    const userChatsStore = useSelector(selectUserChats)

    // const user = useSelector(selectUser)
    const params = useParams()
    const dispatch = useDispatch()
    const { slug: currentChatId } = params
    const [userChats, setUserChats] = useState<ChatTypeWithFullInfo[]>([])
    const [isEmptySearchResult, setIsEmptySearchResult] = useState<boolean>(false)

    const chats = !!userChats?.length || isEmptySearchResult ? userChats : !!preloadedChats?.length && preloadedChats
    // console.log(chats)
    useEffect(() => {
        dispatch(setChats(preloadedChats))
    }, [dispatch, preloadedChats]);

    useEffect(() => {
        setUserChats(userChatsStore)
    }, [userChatsStore]);

    useEffect(() => {
        if (!currentChatId) dispatch(setCurrentChat(null))
    }, [dispatch, currentChatId]);

    const handleSearchInput = (value: string) => {
        if (!value) {
            setUserChats(userChatsStore)
            return
        }
        const filteredChats = userChatsStore?.filter(chat => {
            const fullname = chat.recipientInfo.user.name + ' ' + chat.recipientInfo.user.secondName
            return fullname.includes(value)
        })
        if (!filteredChats.length)  {
            setIsEmptySearchResult(true)
        }
        setUserChats(filteredChats)
    }
    return (
        <div className={styles.wrapper}>
            <SearchInput onChange={handleSearchInput}/>
            {
                // !!userChats?.length || isEmptySearchResult ? userChats.map(chat => <ChatItem key={chat.chatId} chat={chat} />)
                //     : !!preloadedChats?.length && preloadedChats.map(chat => <ChatItem key={chat.chatId} chat={chat} />)

                chats && chats?.toSorted((a, b) => {
                    if (!a?.lastMessage) return -1
                    if (!b?.lastMessage) return 1
                    return new Date(b?.lastMessage?.createdAt) - new Date(a?.lastMessage?.createdAt)
                }).map(chat => <ChatItem key={chat.chatId} isActiveChat={Number(currentChatId) === chat.chatId} chat={chat} />)

                // userChats?.map((chat, index) => <ChatItem key={chat.id} chat={chat} />)


                // !!userChats?.length ? userChats.map((chat, index) => <ChatItem key={chat.id} chat={chat} />)
                //     : <ChatsSkeleton chatsLength={chatsLength}/>
                // <ChatsSkeleton chatsLength={chatsLength}/>
            }
        </div>
    );
};

export default Chats;