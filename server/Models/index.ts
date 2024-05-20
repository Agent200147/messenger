import type { Sequelize, ModelStatic } from 'sequelize';

import SequelizeObject, { Model } from 'sequelize';

import sequelize from '../Sequelize/secuelize.js';

import userModel, { IUserModel } from "./User.model.js";
import chatModel, { IChatModel } from "./Chat.model.js";
import messageModel, { IMessageModel } from "./Message.model.js";
import userChatModel, { IUserChatModel } from "./UserChat.model.js";

export type AssociateType = {
    associate: (models: DbModels) => void
}

export type ModelStaticAssoc<T extends Model<any, any>> = ModelStatic<T> & AssociateType

export type DbModels = {
    UserModel: ModelStaticAssoc<IUserModel>,
    ChatModel: ModelStaticAssoc<IChatModel>,
    MessageModel: ModelStaticAssoc<IMessageModel>,
    UserChatModel: ModelStaticAssoc<IUserChatModel>
}

type dbType = {
    sequelize: Sequelize,
    sequelizeObject: typeof SequelizeObject,
    models: DbModels
}

const db: dbType = {
    sequelize: {} as Sequelize,
    sequelizeObject: {} as typeof SequelizeObject,
    models: {} as DbModels
}

db.models.UserModel = userModel(sequelize, SequelizeObject.DataTypes)
db.models.ChatModel = chatModel(sequelize, SequelizeObject.DataTypes)
db.models.MessageModel = messageModel(sequelize, SequelizeObject.DataTypes)
db.models.UserChatModel = userChatModel(sequelize, SequelizeObject.DataTypes)

Object.keys(db.models).forEach((modelName) => {
    const key = modelName as keyof DbModels
    db.models[key].associate(db.models)
})

db.sequelize = sequelize
db.sequelizeObject = SequelizeObject

export default db