import chatModel from '../Models/chatModel.js';
import {Op, Sequelize} from "sequelize";
import userModel from "../Models/userModel.js";
import messageModel from "../Models/messageModel.js";
import user_ChatModel from "../Models/user_ChatModel.js";
import models from '../Models/index.js';
import fs from "fs";

const {ChatModel, UserModel, MessageModel, User_ChatModel} = models
export const createChat = async (req, res) => {
    const { recipientId } = req.body
    const userId = req.user.id
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
            res.status(400).json({ message: 'Чат уже существует'})
            return
        }

        const newChat = await ChatModel.create()
        await newChat.addRecipients([userId, recipientId])
        const recipient = await UserModel.findByPk(recipientId)
        res.status(200).json({ chatId: newChat.get('id'), lastMessage: null, unReadMessages: 0, chat: newChat, recipientInfo: { unReadMessages: 0, user: recipient}})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const saveCanvas = async (req, res) => {
    const userId = req.user.id
    const { chatId, image } = req.body

    const base64Data = image.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    console.log({userId,
        chatId})
    const user_chat = await User_ChatModel.findOne({
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
            res.status(500).json()
        } else {
            !user_chat.canvasImage && user_chat.update({ canvasImage: `${uniqueSuffix}.png` })
            res.status(200).json('Изображение успешно сохранено на сервере')
        }
    })
}

export const findUserChatsAndRecipients = async (req, res) => {
    const userId = req.user.id
    // console.log('---------------')
    try {
        const chats = await User_ChatModel.findAll({
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
            const recipientInfo = await User_ChatModel.findOne({
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
        res.status(500).json()
    }
}

export const findUserPotentialUsersToChat = async (req, res) => {
    const userId = req.user.id
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

export const readChatMessages = async (req, res) => {
    const { chatId, recipientId } = req.body
    // console.log('-----------------------------------------------------------------------------------------------------------------------------------------------------------------')
    try {
        const user_chat = await User_ChatModel.findOne({where: {chatId, userId: recipientId}})
        // console.log(user_chat)
        if (!user_chat) return res.status(400).json()
        user_chat.update({ unReadMessages: 0 })
        res.status(200).json()
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}