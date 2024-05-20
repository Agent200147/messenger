import type { InferAttributes, InferCreationAttributes, CreationOptional, Sequelize } from "sequelize";

import type { ModelStaticAssoc } from "./index.js";

import SequelizeObject, { Model } from "sequelize";

export interface IMessageModel extends Model<InferAttributes<IMessageModel>, InferCreationAttributes<IMessageModel>> {
    id: CreationOptional<number>,
    chatId: number,
    senderId: number,
    text: string,
}

const MessageModel = (sequelize: Sequelize, DataTypes: typeof SequelizeObject.DataTypes) => {
    const Message = sequelize.define<IMessageModel>('message', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        chatId: DataTypes.INTEGER,
        senderId: DataTypes.INTEGER,
        text: DataTypes.TEXT,

    }, {
        createdAt: true,
        updatedAt: false,
    }) as ModelStaticAssoc<IMessageModel>

    Message.associate = (models) => {
        Message.belongsTo(models.ChatModel, {foreignKey: 'chatId', onDelete: 'CASCADE'})
    }
    return Message
}

export default MessageModel