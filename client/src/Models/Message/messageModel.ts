export type MessageType = {
    id: number,
    chatId: number,
    senderId: number,
    text: string,
    createdAt: string
}

export type NewMessageType = Omit<MessageType, 'id' | 'createdAt'>