'use client'

import styles from './chatBox.module.css'

import {FC, useEffect, useLayoutEffect, useRef, useState} from 'react';
import { useSearchParams } from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentChat, selectUserChats} from "@/store/slices/chatSlice";
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
import Moment from "react-moment";
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
    const recipient = recipients[0]

    const dispatch = useDispatch()
    const currentChat = useSelector(selectCurrentChat)
    const messagesStore = useSelector(selectMessages)
    const newMessage = useSelector(selectNewMessage)
    const scrollSmoothFlag = useSelector(selectMessagesScrollSmoothFlag)

    const unReadMessagesStore = currentChat?.unReadMessages

    const [hasAdditionalMessages, setHasAdditionalMessages] = useState(true);
    const [additionalMessages, setAdditionalMessages] = useState<MessageType[]>()

    const [getAdditionalMessagesMutation] = useGetAdditionalMessagesMutation()

    const firstMessageRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const scrollRefContainer = useRef<HTMLDivElement>(null)
    const offset = useRef(20)
    const prevMessageStore = useRef(20)

    const messages = messagesStore?.length ? messagesStore : messagesFromServer
    const unReadMessages = unReadMessagesStore || unReadMessagesFromServer

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

    useEffect(() => {
        dispatch(setMessages(messagesFromServer))

        lastMessageRef.current?.scrollIntoView({ behavior: "instant" })
        console.log('scrollIntoView')
    }, [currentChatId])


    useEffect(() => {
        if (!additionalMessages || !scrollRefContainer.current) return
        scrollRefContainer.current.scrollTop = scrollRefContainer.current.scrollTop + (scrollRefContainer.current.scrollHeight / messagesStore.length) * ( messagesStore.length - (prevMessageStore.current))
        console.log('длина',  messagesStore.length , (prevMessageStore.current))
        prevMessageStore.current = messagesStore.length
    }, [messagesStore]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })

        if(!newMessage) return
        prevMessageStore.current++
        offset.current++
        console.log('scrollSmoothFlag')
        console.log(prevMessageStore.current, offset.current)
    }, [scrollSmoothFlag]);

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
                    <div className={styles.lastOnline}>
                        был в сети 18 минут назад
                    </div>
                </div>
            </div>

            <div className={styles.messages} ref={scrollRefContainer}>
                <div className={styles.messagesWrapper}>
                    {messages?.map((msg, index) => {
                        const { id, senderId, text, createdAt } = msg;
                        const messageNumberReverse = messages.length - (index + 1)
                        const selfMessage = senderId !== recipient.id
                        const ref = index === messages.length - 1 ? lastMessageRef : (index === 5 ? firstMessageRef : null)
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