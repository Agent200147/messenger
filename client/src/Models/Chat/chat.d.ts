import type { MessageType } from "@/Models/Message/message";
import type { Nullable } from "@/utils/typeUtils";
import type { UserTypeWithoutPassword } from "@/Models/User/userModel";

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
        user: UserTypeWithoutPassword
    },
    lastMessage: Nullable<MessageType>
}