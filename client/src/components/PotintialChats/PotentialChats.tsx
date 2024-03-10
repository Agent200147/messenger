'use client';

import styles from './potentialChats.module.css'
import {useSelector} from "react-redux";
import {selectOnlineUsers, selectUserChats} from "@/store/slices/chatSlice";
import {isEmpty} from "@/utils/ClientServices";
import Image from "next/image";
import avatarImg from "@/public/img/avatar.svg";
import {useCreateChatMutation} from "@/api/chats/chatsApi";
import {toast} from "react-toastify";
import CustomToast from "@/components/CustomToast/CustomToast";
import {selectUser} from "@/store/slices/authSlice";
import {useEffect, useLayoutEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Routes} from "@/Routes/routes";
import SendButtonSvg from "@/components/SvgComponents/sendButton.svg";
import Moment from "react-moment";
import TestParentcomponent from "@/components/testParentcomponent";
const PotentialChats = ({ userChatsServer, potentialChats }) => {
    const user = useSelector(selectUser)
    const router = useRouter()
    const userChatsStore = useSelector(selectUserChats)
    const userChats = !!userChatsStore.length ? userChatsStore : userChatsServer
    // const [filteredPotentialChats, setFilteredPotentialChats] = useState(null)

    // useLayoutEffect(() => {
    //     const existingUserIds = new Set(userChats?.map(userChat => userChat.recipientInfo.user.id))
    //     setFilteredPotentialChats(potentialChats.filter(user => !existingUserIds.has(user.id)))
    // }, [userChats])
    const existingUserIds = new Set(userChats?.map(userChat => userChat.recipientInfo.user.id))
    // setFilteredPotentialChats(potentialChats.filter(user => !existingUserIds.has(user.id)))
    const filteredPotentialChats = potentialChats.filter(user => !existingUserIds.has(user.id))
    const onlineUsers = useSelector(selectOnlineUsers)
    const [ createChat ] = useCreateChatMutation()
    const createNewChat = async (recipientId: number ) => {
        try {
            const response = await createChat(recipientId).unwrap()
            // console.log(response)
            router.push(`${Routes.CHATS}/${response.chatId}`)
            // toast.success(<CustomToast text="Фото профиля успешно обновлено" />)
        } catch (error: any) {
            // console.log(error?.data)
            toast.error(<CustomToast text={error?.data?.message || 'Непредвиденная ошибка'} />)
            // setError(error?.message || 'Непредвиденная ошибка')
        }
    }
    return (
        <div className={styles.potentialChatsWrapper}>
            {filteredPotentialChats
                    ? filteredPotentialChats?.map(potentialUser => {
                        const isOnlineUser = onlineUsers.find(userId => userId === potentialUser.id)
                        return (
                            <div className={styles.potentialChat} key={potentialUser?.id}>
                                <div className={styles.avatarWrapper}>
                                    <Image fill className={styles.avatar}
                                           src={potentialUser.avatar ? `http://localhost:8000/${potentialUser.avatar}` : avatarImg}
                                           alt={'Аватарка'}/>
                                    <div className={isOnlineUser ? styles.onlineStatus : ''}></div>
                                </div>
                                <div className={styles.chatMain}>
                                    <div className={styles.user}>{potentialUser?.name} {potentialUser?.secondName}</div>
                                    {/*<button className={styles.writeBtn} onClick={() => createNewChat(potentialUser.id)}>Написать</button>*/}
                                    <div className={styles.registerTimeWrapper}>С нами с <Moment className={styles.registerTime} format="DD.MM.yy">{potentialUser?.createdAt}</Moment></div>
                                </div>
                                <hr className={styles.hr}/>
                                <button className={styles.writeBtn} onClick={() => createNewChat(potentialUser.id)}>
                                    <SendButtonSvg/>
                                </button>
                            </div>
                        )
                    })
                    : 'Загрузка'
            }
        </div>
    );
};

export default PotentialChats;