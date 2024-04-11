'use client'

import styles from './chatBox.module.css'

import {FC, useEffect, useLayoutEffect, useRef, useState, Fragment} from 'react';
import {useRouter, useSearchParams } from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import Moment from "react-moment";
import 'moment-timezone';
import 'moment/locale/ru';

import { selectCurrentChat } from "@/store/slices/chatSlice";
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
import useCustomObserver, {useCustomObservers} from "@/hooks/useCustomObserver";
import ChatBoxRecipient from "@/components/ChatBoxRecipient/ChatBoxRecipient";
import {throttle} from "@/utils/throttle";
import {debounce} from "@/utils/debounce";

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

    const recipient = currentChat ? currentChat.recipientInfo.user : recipients[0]

    const unReadMessagesStore = currentChat?.unReadMessages

    const [hasAdditionalMessages, setHasAdditionalMessages] = useState(true);
    const [additionalMessages, setAdditionalMessages] = useState<MessageType[]>()
    const [currentDate, setCurrentDate] = useState<string>()
    const [isCurrentDateShow, setIsCurrentDateShow] = useState<boolean>(false)

    const [getAdditionalMessagesMutation] = useGetAdditionalMessagesMutation()

    const firstMessageRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const offset = useRef(20)

    const messages = !!messagesStore?.length ? messagesStore : messagesFromServer
    const unReadMessages = unReadMessagesStore !== undefined ? unReadMessagesStore : unReadMessagesFromServer
    const prevContainerHeightRef = useRef<number>(0)
    const messageDates = useRef<string[]>([])

    useEffect(() => {
        if (!scrollContainerRef.current || !messagesContainerRef.current) return
        const containerTop = scrollContainerRef.current.getBoundingClientRect().top
        const divElements = messagesContainerRef.current.querySelectorAll(`.${styles.messageDate}`)
        let timeout: ReturnType<typeof setTimeout>
        const handleScroll = () => {
            if(timeout) clearTimeout(timeout)
            if (!scrollContainerRef.current) return
            let counter = 0
            divElements.forEach((message) => {
                if (message.getBoundingClientRect().top - 30 <= containerTop) {
                    counter++
                }
            })
            setCurrentDate(divElements[counter - 1]?.innerHTML)
            setIsCurrentDateShow(true)
            timeout = setTimeout(() => setIsCurrentDateShow(false), 1500)
        }

        const throttledHandleScroll = throttle(handleScroll, 100)
        scrollContainerRef.current.addEventListener('scroll', throttledHandleScroll)
        return () => {
            if(timeout) clearTimeout(timeout)

            if (!scrollContainerRef.current) return
            scrollContainerRef.current.removeEventListener('scroll', throttledHandleScroll)
        }
    }, [messages])


    useCustomObserver(firstMessageRef,  async () => {
        if (!hasAdditionalMessages) {
            return
        }
        const response = await getAdditionalMessagesMutation({chatId: Number(currentChatId), limit: 20, offset: offset.current}).unwrap()
        setAdditionalMessages(response)

        if (isEmpty(response)) {
            setHasAdditionalMessages(false)
            return
        }
        offset.current = offset.current + 20
    })

    useLayoutEffect(() => {
        // console.log('router.refresh()')
        messageDates.current = Array.from(new Set(messagesFromServer.map(m => m.createdAt)))
        // console.log(messageDates.current)
        dispatch(setMessages(messagesFromServer))
    }, [currentChatId])


    useEffect(() => {
        if (scrollContainerRef.current)
            prevContainerHeightRef.current = scrollContainerRef.current.scrollHeight
    }, [scrollContainerRef.current])

    useLayoutEffect(() => {
        // console.log('{ behavior: "instant" }')
        lastMessageRef.current?.scrollIntoView({ behavior: "instant" })
        // scrollContainerRef.current?.scroll({ behavior: 'smooth', inline: 'end' })

        // if (scrollContainerRef.current) {
        //     const { scrollHeight, clientHeight } = scrollContainerRef.current;
        //     scrollContainerRef.current.scrollTop = scrollHeight - clientHeight;
        // }
    }, [scrollContainerRef.current])


    useLayoutEffect(() => {
        if (!additionalMessages || !scrollContainerRef.current) return
        const heightDifference = scrollContainerRef.current.scrollHeight - prevContainerHeightRef.current
        // console.log('heightDifference', scrollContainerRef.current.scrollTop, scrollContainerRef.current.scrollHeight)

        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollTop + heightDifference

        prevContainerHeightRef.current = scrollContainerRef.current.scrollHeight

    }, [additionalMessages, scrollContainerRef.current])

    useLayoutEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
        if (scrollContainerRef.current)
            prevContainerHeightRef.current = scrollContainerRef.current.scrollHeight
        return () => {
            offset.current++
        }

    }, [scrollSmoothFlag])


    return (
        <div className={styles.wrapper}>
            <ChatBoxRecipient recipient={recipient} />

            <div className={styles.messages} ref={scrollContainerRef}>
                {/*<Moment className={styles.chatDate} format="D MMMM">{currentDate}</Moment>*/}
                <div className={ cn([styles.chatDate, isCurrentDateShow && styles.chatDateShow]) }>{currentDate}</div>
                <div className={styles.messagesWrapper} ref={messagesContainerRef}>
                    {messages?.map((msg, index, arr) => {
                        // if(index === 0) console.log('messages render')
                        const { id, senderId, text, createdAt } = msg
                        const date = new Date(createdAt)
                        const nexMsg = arr[index + 1]
                        const nextDate = nexMsg && new Date(nexMsg.createdAt)
                        let isDateShow = false
                        if(nextDate && (date.getDate() !== nextDate.getDate() || date.getMonth() !== nextDate.getMonth()))
                            isDateShow = true

                        const messageNumberReverse = messages.length - (index + 1)
                        const selfMessage = senderId !== recipient.id
                        const ref = index === messages.length - 1 ? lastMessageRef : (index === 7 ? firstMessageRef : null)
                        return (
                            <Fragment key={id}>
                                {index === 0 ? <div className={styles.messageDateWrapper}> <span></span> <Moment className={styles.messageDate} format="D MMMM">{msg.createdAt}</Moment> <span></span></div> : null}
                                <div ref={ref}
                                     className={ cn([selfMessage ? styles.selfMessage : styles.otherMessage, unReadMessages > messageNumberReverse ? styles.unReadMessage : ''])}>
                                    <div className={styles.messageText}>{text}</div>
                                    <div className={styles.messageInfo}>

                                        <Moment className={styles.messageTime} format="HH:mm">{createdAt}</Moment>
                                        {/*{selfMessage && <div className={styles.readCheckMarkWrapper}><ReadCheckMarkSvg isRead={true}/></div> }*/}
                                    </div>
                                </div>

                                { isDateShow && <div className={styles.messageDateWrapper}> <span></span> <Moment className={styles.messageDate} format="D MMMM">{nexMsg.createdAt}</Moment> <span></span></div>  }
                                {/*{ isDateShow && <span>Информация</span> }*/}
                            </Fragment>
                        )
                    })}
                </div>

            </div>
           <MessageInput currentChatId={currentChatId}/>
        </div>
    );
};

export default ChatBox;