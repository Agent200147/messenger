// import {useEffect, useState} from "react";
// import {useSelector} from "react-redux";
// import {getChatMessages} from "@/utils/ClientServices";
//
// export const useFetchLatestMessage = (chatId) => {
//     // const notifications = useSelector(selectUserNotifications)
//     // const newMessage = useSelector(selectNewMessage)
//     const [latestMessage, setLatestMessage] = useState()
//     useEffect( () => {
//         (async () => {
//             const response = await getChatMessages(chatId)
//             const lastMessage = response[response?.length - 1]
//             setLatestMessage(lastMessage)
//         })()
//     }, [])
//
//     return latestMessage
// }