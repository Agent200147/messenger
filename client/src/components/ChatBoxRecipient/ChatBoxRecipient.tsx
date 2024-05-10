import styles from "./chatBoxRecipient.module.css";

import type { FC } from 'react';

import type { UserInChatType } from "@/Models/User/userModel";

import { useEffect, useState } from 'react';
import Image from "next/image";
import avatarImg from "@/public/img/avatar.svg";
import Moment from "react-moment";
import { useSelector } from "react-redux";

import { selectCurrentChat, selectOnlineUsers } from "@/store/slices/chatSlice";
import { SocketOnEvent } from "@/store/middleware/socket.middleware";
import SocketFactory from "@/socket/socket";

type ChatBoxRecipientProps = {
    recipient: UserInChatType
}
const ChatBoxRecipient: FC<ChatBoxRecipientProps> = ({ recipient }) => {
    const [isTyping, setIsTyping] = useState(false)
    const onlineUsers = useSelector(selectOnlineUsers)
    const currentChat = useSelector(selectCurrentChat)
    const isOnlineRecipient = onlineUsers.find(userId => userId === recipient.id)
    const { socket } = SocketFactory.create()

    const calendarStrings = {
        lastDay : '[вчера, в] LT',
        sameDay : '[сегодня, в] LT',
        lastWeek: '[в] dddd, [в] LT',
        sameElse : 'DD MMMM, [в] LT',
    }

    useEffect(() => {
        if(!currentChat) return
        let timeout: ReturnType<typeof setTimeout>
        socket.on(SocketOnEvent.GetTypingTrigger, (chatId) => {
            if (chatId !== currentChat.chatId) return
            setIsTyping(true)
            if (timeout) {
                clearTimeout(timeout)
            }

            timeout = setTimeout(() => setIsTyping(false), 1500)
        })

        return () => {
            socket.off(SocketOnEvent.GetTypingTrigger)
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [currentChat])
    return (
        <div className={styles.recipientInfo}>
            <div className={styles.avatarWrapper}>
                <Image className={styles.avatar} fill
                       src={recipient.avatar ? `http://localhost:8000/${recipient.avatar}` : avatarImg} alt='Аватарка'/>
            </div>
            <div className={styles.recipient}>
                <div className={styles.recipientFullName}>
                    {recipient.name} {recipient.secondName}
                </div>
                {
                    !!onlineUsers.length
                        ? (
                            <div className={styles.lastOnline}>
                                {
                                    isTyping
                                        ?  <div className={styles.typingStatus}>
                                                Печатает
                                                <div className={styles.typingAnimation}>
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            </div>
                                        : ( isOnlineRecipient
                                                ? <div className={styles.lastOnlineTime}>Онлайн</div>
                                                : <>Был(-а) в сети <Moment calendar={calendarStrings}
                                                                           className={styles.lastOnlineTime}
                                                                           fromNowDuring={1000 * 60 * 60}
                                                                           locale="ru">{recipient.lastOnline}</Moment></>
                                        )
                                }

                            </div>
                        )
                        : <div className={styles.lastOnline__skeleton}></div>
                }
            </div>
        </div>
    )
}

export default ChatBoxRecipient