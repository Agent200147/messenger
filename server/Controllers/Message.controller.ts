import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "./types.js";

import { Op } from "sequelize";

import db from '../Models/index.js';
const { MessageModel, ChatModel, UserModel, UserChatModel } = db.models
import { ERROR_CHAT_NOT_FOUND, ERROR_INVALID_OPTIONS, ERROR_SERVER_ERROR } from "./ErrorTexts.js";

export const createMessage = async (req: Request, res: Response) => {
    const { chatId, senderId, text } = req.body
    if(!chatId || !senderId || !text) return res.status(400).json(ERROR_INVALID_OPTIONS)

    try {
        const message = await MessageModel.create({ chatId, senderId, text })
        if(!message) return res.status(400).json( ERROR_INVALID_OPTIONS)

        const user_chat = await UserChatModel.findOne({ where: { chatId, userId: senderId } })
        if(!user_chat) return res.status(400).json(ERROR_CHAT_NOT_FOUND)

        user_chat.update({ unReadMessages: user_chat.unReadMessages + 1 })
        res.status(200).json(message)
    } catch (error) {
        console.log(error)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

const MESSAGES_LIMIT = 30

export const getChatMessagesAndRecipient = async (req: Request, res: Response) => {
    const { chatId } = req.params
    const userId = (req as AuthenticatedRequest).user.id
    // console.log('-----------------')
    try {
        const user_chat = await UserChatModel.findOne({
            where: {
                userId,
                chatId
            }
        })
        // console.log(user_chat)

        if (!user_chat) {
            return res.status(400).json(ERROR_CHAT_NOT_FOUND)
        }
        const chat = await ChatModel.findOne( {
            attributes: {exclude: ['createdAt', 'user_chats']},
            // nested: false,

            where: {
                id: chatId,
                // '$user_chats.userId$': user.id
            },
            include: [
                {
                    model: UserChatModel,
                    where: { userId },
                    attributes: [],
                },
                {
                    model: MessageModel,
                    // offset: 0,
                    order: [['createdAt', 'DESC']],
                    limit: MESSAGES_LIMIT,
                },
                {
                    model: UserModel,
                    as: 'recipients',
                    attributes: {exclude: ['password', 'user_chat']},
                    where: { id: { [Op.not]: userId }},

                },
            ],
        })

        if (!chat) return res.status(400).json(ERROR_CHAT_NOT_FOUND)

        chat.messages.reverse()
        const chatWithFullInfo = { unReadMessages: user_chat.unReadMessages, ...chat.dataValues }
        res.status(200).json(chatWithFullInfo)
    } catch (error) {
        console.log(error)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}


export const getChatAdditionalMessages = async (req: Request, res: Response) => {
    const { chatId } = req.params
    const { limit, offset } = req.query
    if(!limit || !offset || typeof limit !== 'string' || typeof offset !== 'string') return res.status(400).json( ERROR_INVALID_OPTIONS)
    try {
        const messages = await MessageModel.findAll({
            where: { chatId },
            limit: parseInt(limit), // Количество сообщений для загрузки
            offset: parseInt(offset), // Сдвиг загрузки сообщений
            order: [['createdAt', 'DESC']],
        });
        messages.reverse()
        res.status(200).json(messages)
    } catch (error) {
        console.log(error)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}