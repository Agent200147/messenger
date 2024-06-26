'use client'

import styles from './chats.module.css'

import { useEffect, useState} from "react";
import type { FC } from "react";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chat";
import ChatItem from "@/components/ChatItem/ChatItem";
import {useDispatch, useSelector} from "react-redux";
import {selectUserChats, setChats, setCurrentChat} from "@/store/slices/chat.slice";
import SearchInput from "@/components/SearchInput/SearchInput";
import {useParams} from "next/navigation";
import cn from 'classnames';

type ChatsProps = {
    preloadedChats: ChatTypeWithFullInfo[]
}

const Chats: FC<ChatsProps> = ({ preloadedChats }) => {
    const dispatch = useDispatch()
    const userChatsStore = useSelector(selectUserChats)

    const params = useParams()
    const { slug: currentChatId } = params
    const [userChats, setUserChats] = useState<ChatTypeWithFullInfo[]>([])
    const [isEmptySearchResult, setIsEmptySearchResult] = useState<boolean>(false)

    // console.log('preloadedChats',preloadedChats)
    const chats = !!userChats?.length || isEmptySearchResult ? userChats : !!preloadedChats?.length && preloadedChats

    useEffect(() => {
        dispatch(setChats(preloadedChats))
    }, [dispatch, preloadedChats])

    useEffect(() => {
        setUserChats(userChatsStore)
    }, [userChatsStore])

    useEffect(() => {
        if (!currentChatId) dispatch(setCurrentChat(null))
    }, [dispatch, currentChatId]);

    const handleSearchInput = (value: string) => {
        if (!value) {
            setUserChats(userChatsStore)
            return
        }
        const filteredChats = userChatsStore?.filter(chat => {
            const fullName = chat.recipientInfo.user.name.toLowerCase() + ' ' + chat.recipientInfo.user.secondName.toLowerCase()
            return fullName.includes(value.toLowerCase())
        })
        if (!filteredChats.length)  {
            setIsEmptySearchResult(true)
        }
        setUserChats(filteredChats)
    }
    return (
        <div className={cn([styles.wrapper, !currentChatId && styles.closed])}>
            <SearchInput closed={!currentChatId} onChange={handleSearchInput}/>
            {
                // !!userChats?.length || isEmptySearchResult ? userChats.map(chat => <ChatItem key={chat.chatId} chat={chat} />)
                //     : !!preloadedChats?.length && preloadedChats.map(chat => <ChatItem key={chat.chatId} chat={chat} />)

                chats && chats?.toSorted((a, b) => {
                    if (!a?.lastMessage) return -1
                    if (!b?.lastMessage) return 1
                    return +new Date(b?.lastMessage?.createdAt) - +new Date(a?.lastMessage?.createdAt)
                }).map(chat => <ChatItem key={chat.chatId} closed={!currentChatId} isActiveChat={Number(currentChatId) === chat.chatId} chat={chat} />)

                // userChats?.map((chat, index) => <ChatItem key={chat.id} chat={chat} />)


                // !!userChats?.length ? userChats.map((chat, index) => <ChatItem key={chat.id} chat={chat} />)
                //     : <ChatsSkeleton chatsLength={chatsLength}/>
                // <ChatsSkeleton chatsLength={chatsLength}/>
            }
        </div>
    )
}

export default Chats;