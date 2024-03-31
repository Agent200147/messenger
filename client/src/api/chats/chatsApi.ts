import { api } from "@/api/api";
import type { ChatTypeWithFullInfo } from "@/Models/Chat/chatModel";
export const chatApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getChats: builder.mutation<ChatTypeWithFullInfo[], number>({
            query: (userId) => ({
                url: `/chats/${userId}`,
                method: "POST",
            }),
        }),
        createChat: builder.mutation<ChatTypeWithFullInfo, number>({
            query: (recipientId) => ({
                url: `/chats/create`,
                method: "POST",
                body: { recipientId }
            })
        }),

        setCanvasImage: builder.mutation<unknown, {image: string, chatId: number}>({
            query: ({image, chatId}) => ({
                url: `/chats/canvas`,
                method: "POST",
                body: { image, chatId }
            })
        }),
    }),
});

export const { useGetChatsMutation, useCreateChatMutation, useSetCanvasImageMutation } = chatApi;