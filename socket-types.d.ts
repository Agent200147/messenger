import type { MessageType } from "./client/src/Models/Message/message";
import {ChatTypeWithFullInfo} from "./client/src/Models/Chat/chat";

export type SocketChatData = {
    chatId: number,
    recipientId: number
}

export type ClientToServerEvents = {
    newUser: (data: number) => void,
    sendMessage: (data: { message: MessageType, recipientId: number }) => void,
    readMessages: (data: SocketChatData) => void,
    createNewChat: (data: { newChat: ChatTypeWithFullInfo, recipientId: number }) => void,
    removeOnlineUser: (data: number) => void,
    drawToRecipient: (data: SocketChatData & { x: number, y: number }) => void,
    endDrawToRecipient: (data: SocketChatData) => void,
    typingTrigger: (data: SocketChatData) => void,
    clearCanvasToRecipient: (data: SocketChatData) => void,
}

export type ServerToClientEvents = {
    getOnlineUsers: (data: number[]) => void,
    getMessage: (data: { message: MessageType, recipientId: number }) => void,
    getReadMessages: (data: number) => void,
    getNewChat: (data: ChatTypeWithFullInfo) => void,
    getRemoveOnlineUser: (data: number) => void,
    getRecipientDraw: (data: { chatId: number, x: number, y: number }) => void,
    getEndDrawToRecipient: (data: number) => void,
    getTypingTrigger: (data: number) => void,
    getClearRecipientCanvas: (data: number) => void,
}

// export enum SocketEmitEvent {
//     newUser = 'newUser',
//     SendMessage = 'send-message',
//     ReadMessages = 'read-messages',
//     CreateNewChat = 'create-new-chat',
//     RemoveOnlineUser = 'remove-online-user',
//     DrawToRecipient = 'draw-to-recipient',
//     EndDrawToRecipient = 'end-draw-to-recipient',
//     TypingTrigger = 'typing-trigger',
//     ClearCanvasToRecipient = 'clear-canvas',
// }
//
export enum SocketOnEvent {
    OnlineUsers = 'onlineUsers',
    GetMessage = 'get-message',
    MarkReadMessages = 'mark-read-messages',
    GetNewChat = 'get-new-chat',
    GetRemoveOnlineUser = 'get-remove-online-user',
    GetRecipientDraw = 'get-recipient-draw',
    GetEndRecipientDraw = 'get-end-recipient-draw',
    GetTypingTrigger = 'get-typing-trigger',
    GetClearRecipientCanvas = 'get-clear-canvas',
}