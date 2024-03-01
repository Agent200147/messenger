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
        messages:MessageType[],
        recipients: UserInChatType[]
    }
}
const ChatBox: FC<CurrentChatProps> = ({ currentChatId, serverSideMessagesAndRecipient }) => {
    const dispatch = useDispatch()
    const { unReadMessages: unReadMessagesServer, messages: messagesFromServer, recipients } = serverSideMessagesAndRecipient
    const recipient = recipients[0]
    const currentChat = useSelector(selectCurrentChat)
    const { unReadMessages: unReadMessagesStore } = currentChat

    // console.log(currentChat)
    // console.log(recipient)
    // console.log(serverSideMessages)
    // const userChats = useSelector(selectUserChats)
    // const currentChatId = Number(params.get('chatId'))
    // const userChatsStore = useSelector(selectUserChats)
    // const currentChat = userChatsStore?.find(chat => chat.chatId === currentChatId)
    const messagesStore = useSelector(selectMessages)
    const newMessage = useSelector(selectNewMessage)
    const firstMessageRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const scrollRefContainer = useRef<HTMLDivElement>(null)
    const scrollSmoothFlag = useSelector(selectMessagesScrollSmoothFlag)
    // const [messages, setMessages] = useState(messagesFromServer)
    const [getAdditionalMessagesMutation] = useGetAdditionalMessagesMutation()
    const offset = useRef(20)
    const [hasAdditionalMessages, setHasAdditionalMessages] = useState(true);
    const [additionalMessages, setAdditionalMessages] = useState()
    // const currentChat = userChats?.find(chat => chat.id === currentChatId)

    const messages = messagesStore?.length ? messagesStore : messagesFromServer
    const unReadMessages = unReadMessagesStore ? unReadMessagesStore : unReadMessagesServer
    // const messages = chatMessages
    const prevMessageStore = useRef(20)

    // useEffect(() => {
    //     // getMessagesMutation(currentChatId)
    // }, [currentChatId])

    useEffect(() => {
        dispatch(setMessages(messagesFromServer))

        scrollRef.current?.scrollIntoView({ behavior: "instant" })
        console.log('scrollIntoView')
        // if(!isEmpty(newMessage)) return
        // if (isEmpty(additionalMessages)) scrollRef.current?.scrollIntoView({ behavior: "instant" })
    }, [currentChatId])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [scrollSmoothFlag])


    useCustomObserver(firstMessageRef,  async () => {
        if (!hasAdditionalMessages) {
            return
        }
        const currentScrollPosition = scrollRefContainer.current.scrollTop;
        // console.log(scrollRefContainer.current.scrollTop)
        // console.log(firstMessageRef.current.offsetTop, scrollRef.current.offsetTop)
        // scrollRef.current.offsetTop = 500
        // scrollRef.current.scrollIntoView()
        // console.log(initialScrollHeight)
        // firstMessageRef.current?.scrollIntoView({ behavior: "instant" })
        const response = await getAdditionalMessagesMutation({chatId: currentChatId, limit: 20, offset: offset.current}).unwrap()
        setAdditionalMessages(response)

        if (isEmpty(response)) {
            setHasAdditionalMessages(false)
        }
        offset.current = offset.current + 20
    })

    useEffect(() => {

        // console.log(scrollRef.current.offsetTop, scrollRefContainer.current.scrollTop)
        // console.log(scrollRefContainer.current.scrollTop)
        // console.log(scrollRefContainer.current.scrollHeight)

        if (isEmpty(additionalMessages)) return
        // console.log(additionalMessages?.length)
        // console.log((scrollRefContainer.current.scrollHeight / messagesStore.length), firstMessageRef.current.scrollHeight)
        // scrollRefContainer.current.scrollTop = scrollRefContainer.current.scrollTop + firstMessageRef.current.scrollHeight * 20
        scrollRefContainer.current.scrollTop = scrollRefContainer.current.scrollTop + (scrollRefContainer.current.scrollHeight / messagesStore.length) * ( messagesStore.length - (prevMessageStore.current))
        console.log('длина',  messagesStore.length - (prevMessageStore.current))
        // scrollRefContainer.current.scrollTop = scrollRefContainer.current.scrollHeight - (scrollRefContainer.current.scrollHeight / messagesStore.length) * 20
        // scrollRefContainer.current.scrollTop = 1500
        prevMessageStore.current = messagesStore.length

    }, [messagesStore]);

    useEffect(() => {
        if (isEmpty(newMessage)) return
        prevMessageStore.current = prevMessageStore.current + 1
        offset.current++
    }, [newMessage]);

    // useCustomObserver(firstMessageRef, () => {
    //     if (!hasAdditionalMessages) {
    //         return
    //     }
    //     const currentScrollPos = scrollRef.current ? firstMessageRef.current.offsetTop : 0;
    //     const currentScrollHeight = scrollRefContainer.current.scrollHeight;
    //
    //     getAdditionalMessagesMutation({ chatId: currentChatId, limit: 20, offset: offset.current })
    //         .then((data) => {
    //             const newScrollHeight = scrollRefContainer.current.scrollHeight;
    //             const scrollDifference = newScrollHeight - currentScrollHeight;
    //             if (scrollDifference > 0) {
    //                 scrollRefContainer.current.scrollTop = currentScrollPos + scrollDifference;
    //             } else {
    //                 scrollRefContainer.current.scrollTop = currentScrollPos;
    //             }
    //             if (isEmpty(data?.data)) {
    //                 setHasAdditionalMessages(false)
    //             }
    //         });
    //     offset.current = offset.current + 20;
    // });


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
                        const messageNumberReverse = messages.length - (index + 1)
                        const selfMessage = msg.senderId !== recipient.id
                        const { id, text, createdAt } = msg;
                        const ref = index === messages.length - 1 ? scrollRef : (index === 5 ? firstMessageRef : null)
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