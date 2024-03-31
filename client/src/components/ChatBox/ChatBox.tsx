'use client'

import styles from './chatBox.module.css'

import {FC, useEffect, useLayoutEffect, useRef, useState} from 'react';
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
import useCustomObserver from "@/hooks/useCustomObserver";
import ChatBoxRecipient from "@/components/ChatBoxRecipient/ChatBoxRecipient";

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

    const [getAdditionalMessagesMutation] = useGetAdditionalMessagesMutation()

    const firstMessageRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const scrollRefContainer = useRef<HTMLDivElement>(null)
    const offset = useRef(20)

    const messages = !!messagesStore?.length ? messagesStore : messagesFromServer
    const unReadMessages = unReadMessagesStore !== undefined ? unReadMessagesStore : unReadMessagesFromServer
    const prevContainerHeightRef = useRef<number>(0)

    // console.log('typingTrigger: ChatBox')

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
        dispatch(setMessages(messagesFromServer))
    }, [currentChatId])


    useEffect(() => {
        if (scrollRefContainer.current)
            prevContainerHeightRef.current = scrollRefContainer.current.scrollHeight
    }, [scrollRefContainer.current])

    useLayoutEffect(() => {
        // console.log('{ behavior: "instant" }')
        lastMessageRef.current?.scrollIntoView({ behavior: "instant" })
        // scrollRefContainer.current?.scroll({ behavior: 'smooth', inline: 'end' })

        // if (scrollRefContainer.current) {
        //     const { scrollHeight, clientHeight } = scrollRefContainer.current;
        //     scrollRefContainer.current.scrollTop = scrollHeight - clientHeight;
        // }
    }, [scrollRefContainer.current])


    useLayoutEffect(() => {
        if (!additionalMessages || !scrollRefContainer.current) return
        const heightDifference = scrollRefContainer.current.scrollHeight - prevContainerHeightRef.current
        // console.log('heightDifference', scrollRefContainer.current.scrollTop, scrollRefContainer.current.scrollHeight)

        scrollRefContainer.current.scrollTop = scrollRefContainer.current.scrollTop + heightDifference

        prevContainerHeightRef.current = scrollRefContainer.current.scrollHeight

    }, [additionalMessages, scrollRefContainer.current])

    useLayoutEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
        if (scrollRefContainer.current)
            prevContainerHeightRef.current = scrollRefContainer.current.scrollHeight
        return () => {
            offset.current++
        }

    }, [scrollSmoothFlag])


    return (
        <div className={styles.wrapper}>
            <ChatBoxRecipient recipient={recipient} />

            <div className={styles.messages} ref={scrollRefContainer}>
                <div className={styles.messagesWrapper}>
                    {messages?.map((msg, index) => {
                        // if(index === 0) console.log('messages render')
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