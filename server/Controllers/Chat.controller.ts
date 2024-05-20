import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "./types.js";

import { Op } from "sequelize";
import fs from "fs";

import db from '../Models/index.js';
const { ChatModel, UserModel, MessageModel, UserChatModel } = db.models
import { ERROR_CHAT_NOT_FOUND, ERROR_INVALID_OPTIONS, ERROR_SERVER_ERROR } from "./ErrorTexts.js";

export const createChat = async (req: Request, res: Response) => {
    const { recipientId } = req.body
    if(!recipientId) return res.status(400).json( ERROR_INVALID_OPTIONS)

    const userId = (req as AuthenticatedRequest).user.id
    // console.log(recipientId)
    try {
        const chats = await ChatModel.findAll({
            include: [
                {
                    model: UserModel,
                    as: 'recipients',
                    through: {
                        attributes: []
                    },
                    where: {
                        id: {
                            [Op.in]: [userId, recipientId]
                        }
                    },
                    attributes: ['id'],
                }
            ],
        })

        const chat = chats.find(c => c.recipients.length === 2)
        if(chat) {
            res.status(400).json(ERROR_CHAT_NOT_FOUND)
            return
        }

        const newChat = await ChatModel.create()
        await newChat.addRecipients([userId, recipientId])
        const recipient = await UserModel.findByPk(recipientId)
        res.status(200).json({ chatId: newChat.get('id'), lastMessage: null, unReadMessages: 0, chat: newChat, recipientInfo: { unReadMessages: 0, user: recipient }})
    } catch (error) {
        console.log(error)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

export const saveCanvas = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.id
    const { chatId, image } = req.body
    if(!chatId || !image) return res.status(400).json(ERROR_INVALID_OPTIONS)

    const base64Data = image.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

    const user_chat = await UserChatModel.findOne({
        where: {
            userId,
            chatId
        }

    })
    if(!user_chat) return res.status(400).json()
    const path = user_chat.canvasImage ? `canvas/${user_chat.canvasImage}` : `canvas/${uniqueSuffix}.png`
    fs.writeFile(path, buffer, 'base64', (err) => {
        if (err) {
            console.error('Ошибка при сохранении изображения:', err)
            res.status(500).json(ERROR_SERVER_ERROR)
        } else {
            !user_chat.canvasImage && user_chat.update({ canvasImage: `${uniqueSuffix}.png` })
            res.status(200).json('Изображение успешно сохранено на сервере')
        }
    })
}

export const findUserChatsAndRecipients = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.id
    // console.log('---------------')
    try {
        const chats = await UserChatModel.findAll({
            where: { userId },
            attributes: {exclude: ['userId']},
            include: [
                {
                    model: ChatModel,
                    attributes: {exclude: ['id']},
                },
            ]
        })

        const result = await Promise.all(chats.map(async (chat) => {
            const chatId = chat.get('chatId')
            const recipientInfo = await UserChatModel.findOne({
                where: { chatId, userId: {[Op.not]: userId} },
                attributes: ['unReadMessages', 'canvasImage'],
                include: [
                    {
                        model: UserModel,
                        attributes: { exclude: ['password']}
                    }
                ],
            })

            const lastMessage = await MessageModel.findOne({
                where: {
                    chatId,
                },
                order: [['createdAt', 'DESC']],
            })
            return {...chat.dataValues, recipientInfo, lastMessage};
        }))

        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

export const findUserPotentialUsersToChat = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user.id
    // console.log(userId)
    try {
        const users = await UserModel.findAll({
            where: { id: {[Op.not]: userId} },
            attributes: { exclude: ['password'] },
        })
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const readChatMessages = async (req: Request, res: Response) => {
    const { chatId, recipientId } = req.body
    if(!chatId || !recipientId) return res.status(400).json(ERROR_INVALID_OPTIONS)
    // console.log('-----------------------------------------------------------------------------------------------------------------------------------------------------------------')
    try {
        const user_chat = await UserChatModel.findOne({where: {chatId, userId: recipientId}})
        // console.log(user_chat)
        if (!user_chat) return res.status(400).json()
        user_chat.update({ unReadMessages: 0 })
        res.status(200).json()
    } catch (error) {
        console.log(error)
        return res.status(500).json(ERROR_SERVER_ERROR)
    }
}