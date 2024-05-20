import type {
    BelongsToManyAddAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    NonAttribute,
    CreationOptional,
    Sequelize
} from "sequelize";

import type { ModelStaticAssoc } from "./index.js";
import type { IUserModel } from "./User.model.js";
import type { IMessageModel } from "./Message.model.js";

import SequelizeObject, { Model } from "sequelize";

export interface IChatModel extends Model<InferAttributes<IChatModel>, InferCreationAttributes<IChatModel>> {
    id: CreationOptional<number>,
    recipients: NonAttribute<IUserModel[]>,
    messages: NonAttribute<IMessageModel[]>
    addRecipients: BelongsToManyAddAssociationMixin<IUserModel, number[]>,
}

const ChatModel = (sequelize: Sequelize, DataTypes: typeof SequelizeObject.DataTypes) => {
    const Chat = sequelize.define<IChatModel>('chat', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
    }, {
        createdAt: true,
        updatedAt: false,
    }) as ModelStaticAssoc<IChatModel>

    Chat.associate = (models) => {
        Chat.hasMany(models.MessageModel, {
            foreignKey: 'chatId'
        })
        Chat.hasMany(models.UserChatModel)
        Chat.belongsToMany(models.UserModel, { through: 'user_chat', as: 'recipients', onDelete: 'CASCADE' })
    }

    return Chat
}

export default ChatModel