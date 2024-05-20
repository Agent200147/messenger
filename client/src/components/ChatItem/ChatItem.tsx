'use client';

import type { FC } from "react";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chat";

import styles from "@/components/ChatItem/chatItem.module.css";

import { memo, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import cn from "classnames";
import Link from "next/link";
import Image from "next/image";

import avatarImg from "@/public/img/avatar.svg";
import { selectOnlineUsers, setCurrentChat } from "@/store/slices/chat.slice";
import ReadCheckMarkSvg from "@/components/SvgComponents/ReadCheckMarkSvg";
import { Routes } from "@/Routes/routes"
import {log} from "util";

type ChatItemProps = {
    closed: boolean,
    chat: ChatTypeWithFullInfo,
    isActiveChat: boolean,
}

const ChatItem: FC<ChatItemProps> = ({ closed, chat, isActiveChat }) => {
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
        }
    }, [isActiveChat])

    return (
        // <Link href={`?chatId=${chat.id}`}  className={cn([styles.chatItem, isActiveChat && styles.chatItemActive]) } >
        <Link href={`${Routes.CHATS}/${chat.chatId}`} className={cn([styles.chatItem, isActiveChat && styles.chatItemActive, closed && styles.closed])}>
            <div className={styles.avatarWrapper}>
                <Image fill className={styles.avatar} src={ recipient.avatar ? `${process.env.SERVER_URL}/${recipient.avatar}` : avatarImg}
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
}

export default memo(ChatItem)