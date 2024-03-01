import { DataTypes } from 'sequelize';
import sequelize from '../Sequelize/secuelize.js';
import chatModel from './chatModel.js';
import userModel from './userModel.js';



const MessageModel = (sequelize, DataTypes) => {
    const Message = sequelize.define('message', {
        // Model attributes are defined here
        chatId: DataTypes.INTEGER,
        senderId: DataTypes.INTEGER,
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        text: DataTypes.TEXT,

    }, {
        sequelize,
        createdAt: true,
        updatedAt: false,
    })
    Message.associate = (models) => {
        Message.belongsTo(models.ChatModel, {foreignKey: 'chatId', onDelete: 'CASCADE'})
    }
    return Message
}

export default MessageModel