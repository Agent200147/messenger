import type { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";

import type { ModelStaticAssoc } from "./index.js";
import type { Nullable } from "../Controllers/types.js";

import SequelizeObject, { Model } from "sequelize";

export interface IUserChatModel extends Model<InferAttributes<IUserChatModel>, InferCreationAttributes<IUserChatModel>> {
    id: number,
    userId: number,
    chatId: number,
    unReadMessages: number,
    canvasImage: CreationOptional<Nullable<string>>
}

const UserChatModel = (sequelize: Sequelize, DataTypes: typeof SequelizeObject.DataTypes) => {
    const UserChat = sequelize.define<IUserChatModel>('user_chat', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: sequelize.models.UserModel,
                key: 'id'
            }
        },
        chatId: {
            type: DataTypes.INTEGER,
            references: {
                model: sequelize.models.ChatModel,
                key: 'id'
            }
        },
        unReadMessages: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        canvasImage: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        createdAt: true,
        updatedAt: false,
    }) as ModelStaticAssoc<IUserChatModel>

    UserChat.associate = (models) => {
        UserChat.belongsTo(models.ChatModel, {foreignKey: 'chatId', onDelete: 'CASCADE'})
        UserChat.belongsTo(models.UserModel, {foreignKey: 'userId', onDelete: 'CASCADE'})
    }
    return UserChat
}

export default UserChatModel