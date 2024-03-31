import type { UserInChatType } from "@/Models/User/userModel";
import type { MessageType } from "@/Models/Message/messageModel";
import {Nullable} from "@/utils/typeUtils";

// export type ChatType = {
//     id: number,
//     members: string[],
//     createdAt: string,
// }

export type ChatTypeWithFullInfo =  {
    chatId: number,
    unReadMessages: number,
    canvasImage: Nullable<string>
    chat: {
        createdAt: string,
    }
    recipientInfo: {
        unReadMessages: number,
        canvasImage: Nullable<string>,
        user: UserInChatType
    },
    lastMessage: Nullable<MessageType>
}