// import messageModel from '../Models/messageModel.js'
// import chatModel from "../Models/chatModel.js";
import models from '../Models/index.js';
import {Op} from "sequelize";

const {MessageModel, ChatModel, UserModel, User_ChatModel, Sequelize} = models
export const createMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body

    try {
        const message = await MessageModel.create({chatId, senderId, text})
        if (message) {
            const user_chat = await User_ChatModel.findOne({ where: { chatId, userId: senderId } })
            user_chat.update({ unReadMessages: user_chat.unReadMessages + 1 })
            return res.status(200).json(message)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const getChatMessagesAndRecipient = async (req, res) => {
    const { chatId } = req.params
    const user = req.user
    try {
        const user_chat = await User_ChatModel.findOne({
            where: {
                userId: user.id,
                chatId
            }
        })
        // console.log(user_chat)

        if (!user_chat) {
            return res.status(400).json({ message: 'Чат не найден' })
        }
        const chat = await ChatModel.findOne( {
            attributes: {exclude: ['createdAt', 'user_chats']},
            nested: false,

            where: {
                id: chatId,
                // '$user_chats.userId$': user.id
            },
            include: [
                {
                    model: User_ChatModel,
                    where: {
                        userId: user.id
                    },
                    attributes: [],
                },
                {
                    model: MessageModel,
                    // offset: 0,
                    order: [['createdAt', 'DESC']],
                    limit: 20,
                },
                {
                    model: UserModel,
                    as: 'recipients',
                    attributes: {exclude: ['password', 'user_chat']},
                    subquery: false,
                    where: { id: { [Op.not]: user.id }},

                },
            ],
        })

        if (!chat)
            return res.status(400).json({ message: 'Чат не найден' })

        // const result = await User_ChatModel.findOne({
        //     where: {
        //         chatId,
        //         userId: user.id,
        //     },
        //     include: [
        //         {
        //             model: ChatModel,
        //             include: [
        //                 {
        //                     model: UserModel,
        //                     as: 'recipients',
        //                     attributes: {exclude: ['password', 'user_chat']},
        //                     where: { id: { [Op.not]: user.id }},
        //
        //                 },
        //
        //                 {
        //                     model: MessageModel,
        //                     // offset: 0,
        //                     order: [['createdAt', 'DESC']],
        //                     limit: 20,
        //                 },
        //             ]
        //         }
        //     ]
        // })


        // const response = await User_ChatModel.findOne({
        //     where: {
        //         chatId: chatId,
        //         userId: user.id
        //     },
        //     include: [{
        //         model: ChatModel,
        //         // as: 'chat',
        //         include: [{
        //             model: UserModel,
        //             as: 'recipients'
        //         },
        //             {
        //                 model: MessageModel,
        //             }
        //         ]
        //     }]
        // });

        // const recipientId = chat?.get('members').find(member => member !== user.id.toString())
        // const recipient = await UserModel.findByPk(recipientId)
        // res.status(200).json({messages, recipient})
        chat.messages.reverse()
        chat.dataValues.unReadMessages = user_chat.unReadMessages
        // const result = { unReadMessages: user_chat.unReadMessages, ...chat.dataValues }
        res.status(200).json(chat)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}


export const getChatAdditionalMessages = async (req, res) => {
    const { chatId } = req.params
    const { limit, offset } = req.query;
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
        res.status(500).json(error)
    }
}