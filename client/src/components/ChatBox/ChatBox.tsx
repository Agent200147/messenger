'use client';

import styles from './chatBox.module.css';

import {FC, useEffect, useLayoutEffect, useRef, useState, Fragment} from 'react';
import {useRouter, useSearchParams } from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import Moment from "react-moment";
import 'moment-timezone';
import 'moment/locale/ru';

import { selectCurrentChat } from "@/store/slices/chat.slice";
import Image from "next/image";
import avatarImg from '@/public/img/avatar.svg'
import MessageInput from "@/components/MessageInput/MessageInput";
import {ChatTypeWithFullInfo} from "@/Models/Chat/chat";
import {MessageType} from "@/Models/Message/message";
import {
    selectMessages,
    selectMessagesScrollSmoothFlag,
    setMessages
} from "@/store/slices/message.slice";
import {useGetAdditionalMessagesMutation, useGetMessagesMutation} from "@/api/messages/messgesApi";
import type { UserTypeWithoutPassword} from "@/Models/User/userModel";
import {isEmpty} from "@/utils/ClientServices";
import ReadCheckMarkSvg from "@/components/SvgComponents/ReadCheckMarkSvg";
import cn from "classnames";
import useCustomObserver, {useCustomObservers} from "@/hooks/useCustomObserver";
import ChatBoxRecipient from "@/components/ChatBoxRecipient/ChatBoxRecipient";
import {throttle} from "@/utils/throttle";
import {debounce} from "@/utils/debounce";
import {toast} from "react-toastify";
import CustomToast from "@/components/CustomToast/CustomToast";
import {revalidatePath} from "next/cache";
import {useGetChatsMutation} from "@/api/chats/chatsApi";

type CurrentChatProps = {
    currentChatId: string,
    serverSideMessagesAndRecipient: {
        unReadMessages: number,
        messages: MessageType[],
        recipients: UserTypeWithoutPassword[]
    }
}

const MESSAGES_LIMIT = 30

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
    const [isLayoutEffectRunning, setIsLayoutEffectRunning] = useState(false)

    //SSR
    // const messages = !!messagesStore?.length ? messagesStore : messagesFromServer

    //Usual
    const messages = messagesStore

    const unReadMessages = unReadMessagesStore !== undefined ? unReadMessagesStore : unReadMessagesFromServer

    const [getAdditionalMessagesMutation] = useGetAdditionalMessagesMutation()
    const [getMessages, { isLoading, isSuccess }] = useGetMessagesMutation()

    const firstMessageRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    const offset = useRef(messagesFromServer.length)
    const prevContainerHeightRef = useRef<number>(0)
    const messageDates = useRef<string[]>([])
    const router = useRouter()

    useEffect(() => {
        if (!scrollContainerRef.current || !messagesContainerRef.current) return
        const containerTop = scrollContainerRef.current.getBoundingClientRect().top
        const divElements = messagesContainerRef.current.querySelectorAll(`.${styles.messageDate}`)
        let timeout: ReturnType<typeof setTimeout>
        const handleScroll = () => {
            if (isLayoutEffectRunning) return
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
    }, [messages, isLayoutEffectRunning])

    useCustomObserver(firstMessageRef,  async () => {
        if (!hasAdditionalMessages) {
            return
        }

        try {
            const response = await getAdditionalMessagesMutation({chatId: Number(currentChatId), limit: MESSAGES_LIMIT, offset: offset.current}).unwrap()
            setAdditionalMessages(response)

            if (isEmpty(response)) {
                setHasAdditionalMessages(false)
                return
            }

            offset.current = offset.current + MESSAGES_LIMIT
        } catch (e) {
            console.log('hasAdditionalMessages:', hasAdditionalMessages)
            setHasAdditionalMessages(false)
            toast.error(<CustomToast text={'Ошибка загрузки сообщений'} />)
        }
    })

    useLayoutEffect(() => {
        // router.refresh()
        messageDates.current = Array.from(new Set(messagesFromServer.map(m => m.createdAt)))
        const loadMessages = async () => {
            try {
                await getMessages(Number(currentChatId)).unwrap()
            } catch (e) {

            }
        }
        loadMessages()
    }, [currentChatId])

    //SSR
    // useLayoutEffect(() => {
    //     messageDates.current = Array.from(new Set(messagesFromServer.map(m => m.createdAt)))
    //     dispatch(setMessages(messagesFromServer))
    // }, [currentChatId])

    //SSR
    // useEffect(() => {
    //     if (scrollContainerRef.current)
    //         prevContainerHeightRef.current = scrollContainerRef.current.scrollHeight
    // }, [scrollContainerRef.current])

    useLayoutEffect(() => {
        if(!isSuccess) return
        console.log('scrollIntoView')
        if (scrollContainerRef.current)
            prevContainerHeightRef.current = scrollContainerRef.current.scrollHeight
        lastMessageRef.current?.scrollIntoView({ behavior: "instant" })
    }, [isSuccess])

    // SSR
    // useLayoutEffect(() => {
    //     setIsLayoutEffectRunning(true)
    //     lastMessageRef.current?.scrollIntoView({ behavior: "instant" })
    //     setTimeout(() => setIsLayoutEffectRunning(false))
    // }, [scrollContainerRef.current])

    useLayoutEffect(() => {
        if (!additionalMessages || !scrollContainerRef.current) return
        const heightDifference = scrollContainerRef.current.scrollHeight - prevContainerHeightRef.current
        console.log('heightDifference', scrollContainerRef.current.scrollHeight, prevContainerHeightRef.current)

        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollTop + heightDifference

        prevContainerHeightRef.current = scrollContainerRef.current.scrollHeight

        console.log('ChatBox:', messages, additionalMessages )
    }, [additionalMessages, scrollContainerRef.current])

    useLayoutEffect(() => {
        setIsLayoutEffectRunning(true)
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
        setTimeout(() => setIsLayoutEffectRunning(false), 400)
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
                <div className={ cn([styles.chatDate, isCurrentDateShow && styles.chatDateShow]) }>{currentDate}</div>
                {
                    isSuccess &&
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
                                        <div className={styles.messageText}>
                                            {
                                                text.split('\n').map((line, index) => (
                                                    <Fragment key={index}>
                                                        {line}
                                                        {index !== text.split('\n').length - 1 && <br />}
                                                    </Fragment>
                                                ))
                                            }
                                        </div>
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
                }
            </div>

           <MessageInput currentChatId={currentChatId}/>
        </div>
    )
}

export default ChatBox;