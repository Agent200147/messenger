import type { MessageType, NewMessageType } from "@/Models/Message/message";

import { api } from "@/api/api";

export const messagesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.mutation<MessageType[], number>({
            query: (chatId) => ({
                url: `/messages/${chatId}`,
                method: "GET",
            })
        }),

        getAdditionalMessages: builder.mutation<MessageType[], { chatId: number, limit: number, offset: number }>({
            query: ({ chatId, limit, offset }) => ({
                url: `/messages/additional/${chatId}`,
                method: "GET",
                params: {
                    limit,
                    offset,
                }
            })
        }),

        sendMessage: builder.mutation<MessageType, NewMessageType>({
            query: ({ text, chatId, senderId }) => ({
                url: `/messages`,
                method: "POST",
                body: { text,  chatId, senderId },
            })
        })
    })
})

export const { useGetMessagesMutation, useSendMessageMutation, useGetAdditionalMessagesMutation } = messagesApi