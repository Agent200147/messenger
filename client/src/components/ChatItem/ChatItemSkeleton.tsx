import styles from "@/components/ChatItem/chatItem.module.css";
import Image from "next/image";
import avatarImg from "@/public/img/avatar.svg";
import cn from "classnames";

const ChatItemSkeleton = ({  }) => {
    return (
        <div className={styles.chatItem__skeleton}>
            <Image className={styles.avatar__skeleton} src={avatarImg} alt={'Аватарка'}/>
            <div className={cn([styles.chatMain__skeleton, styles.skeleton]) }>
                <div className={cn([styles.recipientUser]) }></div>
                <div className={cn([styles.lastMessage])}></div>
            </div>
            <div className={cn([styles.notification__skeleton, styles.skeleton])}></div>
        </div>
    );
};

export default ChatItemSkeleton;