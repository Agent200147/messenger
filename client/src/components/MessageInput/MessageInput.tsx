import styles from './messageInput.module.css'
import {KeyboardEventHandler, useState} from "react";
import type { FC, ChangeEvent } from "react";
import SendButton from "@/components/MessageInput/SendButton";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "@/store/slices/authSlice";
import {useSendMessageMutation} from "@/api/messages/messgesApi";
import {selectCurrentChat, sendTypingTrigger} from "@/store/slices/chatSlice";
type MessageInputProps = {
    currentChatId: string,
}
const MessageInput: FC<MessageInputProps> = ({ currentChatId }) => {
    const dispatch = useDispatch()
    const [messageText, setMessageText] = useState<string>('')
    const [active, setActive] = useState<boolean>(false)
    const currentChat = useSelector(selectCurrentChat)
    const recipientId = currentChat?.recipientInfo.user.id
    const user = useSelector(selectUser)
    const onChangeMessageInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) setActive(false)
        else setActive(true)
        setMessageText(e.target.value)
        if (recipientId) dispatch(sendTypingTrigger(recipientId))
    }



    const [sendTextMessage] = useSendMessageMutation()
    const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === "Enter" && active) {
            sendMessage()
        }
    }
    const sendMessage = () => {
        if(!user || !messageText) return
        const message = {text: messageText, chatId: Number(currentChatId), senderId: user.id }

        sendTextMessage(message)
        setMessageText('')
        setActive(false)
    }
    return (
        <div className={styles.inputWrapper}>
            <input value={messageText} onKeyUp={handleKeyPress} onChange={onChangeMessageInput} type="text" placeholder='Напишите сообщение...'/>
            <SendButton onClick={sendMessage} active={active} />
        </div>
    );
};

export default MessageInput;