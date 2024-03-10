import type { FC } from "react";
import styles from './messageInput.module.css'
import SendButtonSvg from "@/components/SvgComponents/sendButton.svg";
import cn from "classnames";

type SvgSendIconProps = {
    active: boolean,
    onClick: () => void
}
const SendButton: FC<SvgSendIconProps> = ({ active, onClick }) => {
    return (
        <button className={cn([styles.sendButton, active ? styles.active : '']) } disabled={!active} onClick={onClick}>
           <SendButtonSvg/>
        </button>
    )
}

export default SendButton;