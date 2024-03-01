import chatModel from '../Models/chatModel.js';
import {Op, Sequelize} from "sequelize";
import userModel from "../Models/userModel.js";
import messageModel from "../Models/messageModel.js";
import user_ChatModel from "../Models/user_ChatModel.js";
import models from '../Models/index.js';

const {ChatModel, UserModel, MessageModel, User_ChatModel} = models
export const createChat = async (req, res) => {
    const { recipientId } = req.body
    const userId = req.user.id
    // console.log(recipientId)
    try {
        // const chat = await ChatModel.findAll({
        //     include: [
        //         {
        //             model: UserModel,
        //             as: 'recipients',
        //             where: { id: {
        //                 [Op.and]: [
        //                     {
        //                         [Op.not]: firstId
        //                     },
        //                     {
        //                         [Op.not]: secondId
        //                     }]
        //             }
        //             },
        //         },
        //         ]
        // })




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

        // const recipient = await UserModel.findByPk(recipientId, {
        //     attributes: {exclude: ['password']}
        // });
        //
        // if (chat) {
        //     const lastMessage = await MessageModel.findOne({
        //         where: {
        //             chatId: chat.get('id'),
        //         },
        //         order: [['createdAt', 'DESC']],
        //     })
        //     return res.status(200).json({...chat.dataValues, recipient, lastMessage})
        // }

        const newChat = await ChatModel.create()
        await newChat.addRecipients([userId, recipientId])
        const recipient = await UserModel.findByPk(recipientId)
        // res.status(200).json({...newChat.dataValues, recipient, lastMessage: {}})
        res.status(200).json({ chatId: newChat.get('id'), lastMessage: null, unReadMessages: 0, chat: newChat, recipientInfo: { unReadMessages: 0, user: recipient}})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const findUserChats = async (req, res) => {
    const userId = req.params.userId
    try {
        const chats = await ChatModel.findAll({where: {members: {[Op.like]: '%' + userId + '%'}}})
        res.status(200).json(chats)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const findChat = async (req, res) => {
    const {firstId, secondId} = req.params
    try {
        const chat = await ChatModel.findOne({where: {members: {[Op.substring]: firstId + ";" + secondId}}})
        res.status(200).json(chat)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const findUserChatsAndRecipients = async (req, res) => {
    const userId = req.params.userId
    try {
        // const chats = await chatModel.findAll({where: {members: {[Op.like]: '%' + userId + '%'}}})

        const chats = await User_ChatModel.findAll({
            where: { userId },
            attributes: {exclude: ['userId']},
            include: [
                {
                    model: ChatModel,
                    attributes: {exclude: ['id']},
                },
                // {
                //     model: UserModel,
                // }
            ]
        })

        const result = await Promise.all(chats.map(async (chat) => {
            const chatId = chat.get('chatId')
            const recipientInfo = await User_ChatModel.findOne({
                where: { chatId, userId: {[Op.not]: userId} },
                attributes: ['unReadMessages'],
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

        // console.log('chats', chats)
        // const result = await Promise.all(chats.map(async (chat) => {
        //     const recipientId = chat.get('members').find(u => u !== userId);
        //
        //     const recipient = await userModel.findByPk(recipientId, {
        //         attributes: {exclude: ['password']}
        //     });
        //     const chatId = chat.get('id')
        //     const lastMessage = await messageModel.findOne({
        //         where: {
        //             chatId: chatId,
        //         },
        //         order: [['createdAt', 'DESC']],
        //     })
        //     return {...chat.dataValues, recipient, lastMessage};
        // }));
        // // console.log(recipients)
        // res.status(200).json(result)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const findUserPotentialChats = async (req, res) => {
    const userId = req.user.id
    console.log(userId)
    try {
        const users = await UserModel.findAll({
            where: { id: {[Op.not]: userId} },
        })
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const readChatMessages = async (req, res) => {
    const { chatId, recipientId } = req.body
    console.log('-----------------------------------------------------------------------------------------------------------------------------------------------------------------')
    console.log({ chatId, recipientId })
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