// import {useEffect, useRef, useState} from "react";
// import {getUserById} from "@/utils/ClientServices";
//
// export const useFetchRecipient = (chat, user) => {
//     const [recipientUser, setRecipientUser] = useState(null)
//     const [error, setError] = useState(null)
//     const recipientId = chat?.members.find((id) => id !== user?.id.toString())
//     useEffect(() => {
//         if (!chat || !user) return
//
//         (async () => {
//             const response = await getUserById(recipientId)
//             setRecipientUser(response)
//         }) ()
//
//     }, [user])
//
//     return recipientUser
// }