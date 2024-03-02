'use client'
// 'use server'
import {memo, useEffect, useLayoutEffect} from "react";
import type {FC} from "react";

import styles from "@/components/ChatItem/chatItem.module.css";
import avatarImg from "@/public/img/avatar.svg";
import Image from "next/image";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
import type {ChatTypeWithFullInfo} from "@/Models/Chat/chatModel";
import {AuthenticatedUserType} from "@/Models/User/userModel";
import ChatItemSkeleton from "@/components/ChatItem/ChatItemSkeleton";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import cn from "classnames";
import {selectCurrentChat, selectOnlineUsers, setCurrentChat, setLastMessage} from "@/store/slices/chatSlice";
import ReadCheckMarkSvg from "@/components/SvgComponents/ReadCheckMarkSvg";
import {setNewMessage} from "@/store/slices/messageSlice";
import {Routes} from "@/Routes/routes";

type ChatItemProps = {
    chat: ChatTypeWithFullInfo,
    isActiveChat: boolean,
}

const ChatItem: FC<ChatItemProps> = ({ chat, isActiveChat }) => {
    const dispatch = useDispatch()
    // const router = useRouter()
    const { recipientInfo, lastMessage } = chat
    const { user: recipient } = recipientInfo
    const onlineUsers = useSelector(selectOnlineUsers)
    const isSelfMessage = lastMessage?.senderId !== recipient?.id
    const isOnlineRecipient = onlineUsers.find(userId => userId === recipient.id)

    useLayoutEffect(() => {
        if (isActiveChat) {
            dispatch(setCurrentChat(chat))
            dispatch(setNewMessage(null))
        }
    }, [isActiveChat])

    return (
        // <Link href={`?chatId=${chat.id}`}  className={cn([styles.chatItem, isActiveChat && styles.chatItemActive]) } >
        <Link href={`${Routes.CHATS}/${chat.chatId}`} className={cn([styles.chatItem, isActiveChat && styles.chatItemActive])}>
            <div className={styles.avatarWrapper}>
                <Image fill className={styles.avatar} src={ recipient.avatar ? `http://localhost:8000/${recipient.avatar}` : avatarImg}
                       alt={'Аватарка'}/>
                <div className={isOnlineRecipient ? (isActiveChat ? styles.onlineStatusActive : styles.onlineStatus) : ''}></div>
            </div>

            <div className={styles.chatMain}>
                <div className={styles.recipientUser}>
                    {recipient?.name} {recipient?.secondName}
                </div>
                {
                    lastMessage
                        ? (
                            <div className={styles.lastMessage}>
                                {isSelfMessage
                                    ? (<>
                                        <div className={styles.yourMessage}>Вы:</div>
                                        <div className={styles.messageText}>{lastMessage?.text}</div>
                                    </>)
                                    : <div className={styles.messageText}>{lastMessage?.text}</div>
                                }
                            </div>
                        )
                        : <div className={styles.firstMessage}>Напишите первое сообщение!</div>
                }

            </div>
            {
                lastMessage && isSelfMessage
                    ? (
                        <div className={chat.unReadMessages === 0 ? styles.readCheckMarkWrapper : styles.notReadCheckMarkWrapper}>
                            <ReadCheckMarkSvg isRead={chat.unReadMessages === 0}/>
                        </div>
                    )
                    :
                    (
                        !!recipientInfo.unReadMessages && <div className={styles.notification}>{recipientInfo.unReadMessages}</div>

                    )
            }
        </Link>
    )
};

export default memo(ChatItem);

//
// 'use server'
