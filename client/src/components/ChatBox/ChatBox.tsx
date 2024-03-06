'use client'

import styles from './chatBox.module.css'

import {FC, useEffect, useLayoutEffect, useRef, useState} from 'react';
import { useSearchParams } from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import Moment from "react-moment";
import 'moment-timezone';
import 'moment/locale/ru';

import {selectCurrentChat, selectOnlineUsers, selectUserChats} from "@/store/slices/chatSlice";
import Image from "next/image";
import avatarImg from '@/public/img/avatar.svg'
import MessageInput from "@/components/MessageInput/MessageInput";
import {ChatTypeWithFullInfo} from "@/Models/Chat/chatModel";
import {MessageType} from "@/Models/Message/messageModel";
import {
    selectMessages,
    selectMessagesScrollSmoothFlag,
    selectNewMessage,
    setMessages
} from "@/store/slices/messageSlice";
import {useGetAdditionalMessagesMutation, useGetMessagesMutation} from "@/api/messages/messgesApi";
import {UserInChatType} from "@/Models/User/userModel";
import {isEmpty} from "@/utils/ClientServices";
import ReadCheckMarkSvg from "@/components/SvgComponents/ReadCheckMarkSvg";
import cn from "classnames";
import useCustomObserver from "@/hooks/useCustomObserver";

type CurrentChatProps = {
    currentChatId: string,
    serverSideMessagesAndRecipient: {
        unReadMessages: number,
        messages: MessageType[],
        recipients: UserInChatType[]
    }
}
const ChatBox: FC<CurrentChatProps> = ({ currentChatId, serverSideMessagesAndRecipient }) => {
    const { unReadMessages: unReadMessagesFromServer, messages: messagesFromServer, recipients } = serverSideMessagesAndRecipient

    const dispatch = useDispatch()
    const currentChat = useSelector(selectCurrentChat)
    const messagesStore = useSelector(selectMessages)
    const scrollSmoothFlag = useSelector(selectMessagesScrollSmoothFlag)
    const onlineUsers = useSelector(selectOnlineUsers)

    const recipient = currentChat ? currentChat.recipientInfo.user : recipients[0]

    const isOnlineRecipient = onlineUsers.find(userId => userId === recipient.id)

    const unReadMessagesStore = currentChat?.unReadMessages

    const [hasAdditionalMessages, setHasAdditionalMessages] = useState(true);
    const [additionalMessages, setAdditionalMessages] = useState<MessageType[]>()

    const [getAdditionalMessagesMutation] = useGetAdditionalMessagesMutation()

    const firstMessageRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const scrollRefContainer = useRef<HTMLDivElement>(null)
    const offset = useRef(20)

    const messages = !!messagesStore?.length ? messagesStore : messagesFromServer
    const unReadMessages = unReadMessagesStore !== undefined ? unReadMessagesStore : unReadMessagesFromServer
    const prevContainerHeightRef = useRef<number>(0)

    useCustomObserver(firstMessageRef,  async () => {
        if (!hasAdditionalMessages) {
            return
        }
        const response = await getAdditionalMessagesMutation({chatId: Number(currentChatId), limit: 20, offset: offset.current}).unwrap()
        setAdditionalMessages(response)

        if (isEmpty(response)) {
            setHasAdditionalMessages(false)
        }
        offset.current = offset.current + 20
    })

    useLayoutEffect(() => {
        dispatch(setMessages(messagesFromServer))
    }, [currentChatId])

    useEffect(() => {
        if (scrollRefContainer.current)
            prevContainerHeightRef.current = scrollRefContainer.current.scrollHeight
    }, [scrollRefContainer.current])

    useLayoutEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "instant" })
    }, [scrollRefContainer.current])


    useLayoutEffect(() => {
        if (!additionalMessages || !scrollRefContainer.current) return
        const heightDifference = scrollRefContainer.current.scrollHeight - prevContainerHeightRef.current
        scrollRefContainer.current.scrollTop = scrollRefContainer.current.scrollTop + heightDifference
        prevContainerHeightRef.current = scrollRefContainer.current.scrollHeight

    }, [messagesStore])

    useEffect(() => {
        console.log('scrollSmoothFlag', offset.current)
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
        if (scrollRefContainer.current)
            prevContainerHeightRef.current = scrollRefContainer.current.scrollHeight
        return () => {
            offset.current++
        }

    }, [scrollSmoothFlag])

    const calendarStrings = {
        lastDay : '[вчера, в] LT',
        sameDay : '[сегодня, в] LT',
        lastWeek: '[в] dddd, [в] LT',
        sameElse : 'DD MMMM, [в] LT',

    }
    return (
        <div className={styles.wrapper}>
            <div className={styles.recipientInfo}>
                <div className={styles.avatarWrapper}>
                    <Image className={styles.avatar} fill src={recipient.avatar ? `http://localhost:8000/${recipient.avatar}` : avatarImg} alt='Аватарка' />
                </div>
                <div className={styles.recipient}>
                    <div className={styles.recipientFullName}>
                        {recipient.name} {recipient.secondName}
                    </div>
                    {
                        !!onlineUsers.length
                            ? (
                                <div className={styles.lastOnline}>
                                    {isOnlineRecipient
                                        ? <div className={styles.messageTime}>Онлайн</div>
                                        : <>Был(-а) в сети <Moment calendar={calendarStrings}
                                                                   className={styles.lastOnlineTime}
                                                                   fromNowDuring={1000 * 60 * 60}
                                                                   locale="ru">{recipient.lastOnline}</Moment></>
                                    }
                                </div>
                            )
                            : <div className={styles.lastOnline__skeleton}></div>
                    }

                </div>
            </div>

            <div className={styles.messages} ref={scrollRefContainer}>
                <div className={styles.messagesWrapper}>
                    {messages?.map((msg, index) => {
                        const {id, senderId, text, createdAt} = msg;
                        const messageNumberReverse = messages.length - (index + 1)
                        const selfMessage = senderId !== recipient.id
                        const ref = index === messages.length - 1 ? lastMessageRef : (index === 7 ? firstMessageRef : null)
                        return (
                            <div key={id}
                                 ref={ref}
                                 className={ cn([selfMessage ? styles.selfMessage : styles.otherMessage, unReadMessages > messageNumberReverse ? styles.unReadMessage : ''])}>
                                <div className={styles.messageText}>{text}</div>
                                <div className={styles.messageInfo}>

                                    <Moment className={styles.messageTime} format="HH:mm">{createdAt}</Moment>
                                    {/*{selfMessage && <div className={styles.readCheckMarkWrapper}><ReadCheckMarkSvg isRead={true}/></div> }*/}
                                </div>
                            </div>

                        )
                    })}
                </div>

            </div>
           <MessageInput currentChatId={currentChatId}/>
        </div>
    );
};

export default ChatBox;