import styles from './messageInput.module.css'
import {KeyboardEventHandler, useEffect, useRef, useState} from "react";
import type { FC, ChangeEvent } from "react";
import SendButton from "@/components/MessageInput/SendButton";
import { useSelector } from "react-redux";
import {selectUser} from "@/store/slices/auth.slice";
import {useSendMessageMutation} from "@/api/messages/messgesApi";
import { selectCurrentChat } from "@/store/slices/chat.slice";
import SocketFactory from "@/socket/socket";
import {toast} from "react-toastify";
import CustomToast from "@/components/CustomToast/CustomToast";

type MessageInputProps = {
    currentChatId: string,
}

const MessageInput: FC<MessageInputProps> = ({ currentChatId }) => {
    const [messageText, setMessageText] = useState<string>('')
    const [isTextAreaScroll, setIsTextAreaScroll] = useState<boolean>(false)
    const [active, setActive] = useState<boolean>(false)
    const currentChat = useSelector(selectCurrentChat)
    const user = useSelector(selectUser)

    const textAreaDivRef = useRef<HTMLDivElement>(null)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const newLine = useRef<boolean>(false)
    const lineHeight = useRef<number>(0)

    const [sendTextMessage] = useSendMessageMutation()

    const recipientId = currentChat?.recipientInfo.user.id
    const { socket } = SocketFactory.create()
    const onChangeMessageInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
        let newStr = e.target.value.replace(/(\rn|\n|\r)/gm, '')
        if (!newStr) {
            setActive(false)
            setMessageText(newStr)
        }
        else {
            setActive(true)
            setMessageText(e.target.value)
        }
    }

    useEffect(() => {
        if(!textAreaRef.current) return
        lineHeight.current = textAreaRef.current.offsetHeight
    }, [textAreaRef.current])


    useEffect(() => {
        if(!textAreaDivRef.current || !textAreaRef.current) return
        if(messageText && recipientId) socket.emit('typingTrigger', { chatId: currentChat.chatId, recipientId })

        const textArea = textAreaRef.current
        textAreaDivRef.current.style.width = textArea.clientWidth + 'px'
        textAreaDivRef.current.innerHTML = messageText.replace(/(\rn|\n|\r)/gm, '</br>') + '</br>'
        let divHeight = textAreaDivRef.current.offsetHeight

        if (divHeight < lineHeight.current)
            divHeight = lineHeight.current

        if(divHeight / lineHeight.current > 3) {
            textArea.style.height = (lineHeight.current * 3) + 'px'
            setIsTextAreaScroll(true)
            return
        }
        setIsTextAreaScroll(false)
        textArea.style.height = divHeight + 'px'

    }, [messageText])


    const handleKeyPress: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        if (event.key === "Enter" && event.ctrlKey) {
            if(!messageText) return

            const currentValue = event.currentTarget.value;
            const selectionStart = event.currentTarget.selectionStart;

            const newValue = currentValue.substring(0, selectionStart) + "\n" + currentValue.substring(selectionStart);
            event.currentTarget.selectionStart = event.currentTarget.selectionEnd = selectionStart + 1
            setMessageText(newValue)

            newLine.current = true
        }

        else if (event.key === "Enter" && active) {
            event.preventDefault()
            if(active) sendMessage()
            newLine.current = false
        }
    }
    const sendMessage = async () => {
        if(!user || !messageText || !textAreaDivRef.current || !textAreaRef.current) return
        const message = {text: messageText, chatId: Number(currentChatId), senderId: user.id }

        try {
            await sendTextMessage(message).unwrap()
        } catch (e) {
            console.log(e)
            toast.error(<CustomToast text={'Ошибка отправки сообщения'} />)
            return
        }

        setMessageText('')
        setActive(false)
        setIsTextAreaScroll(false)
        textAreaDivRef.current.innerHTML = ''
        textAreaRef.current.style.height = 'auto'
    }
    return (
        <div className={styles.inputWrapper}>
            <div className={styles.textAreaDiv} ref={textAreaDivRef}></div>
            <textarea className={isTextAreaScroll ? styles.scroll : ''} ref={textAreaRef} rows={1} value={messageText} onKeyDown={handleKeyPress} onChange={(e) => onChangeMessageInput(e)} placeholder='Напишите сообщение...'/>
            <SendButton onClick={sendMessage} active={active} />
        </div>
    )
}

export default MessageInput;