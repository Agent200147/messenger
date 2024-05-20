import type { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";

import type { ModelStaticAssoc } from "./index.js";
import type { Nullable } from "../Controllers/types.js";

import SequelizeObject, { Model } from "sequelize";
import { z } from "zod";
import validator from "validator";

export interface IUserModel extends Model<InferAttributes<IUserModel>, InferCreationAttributes<IUserModel>> {
    id: CreationOptional<number>,
    email: string,
    name: string,
    secondName: string,
    avatar: CreationOptional<Nullable<string>>,
    password: string,
    lastOnline: CreationOptional<string>,
}

const UserModel = (sequelize: Sequelize, DataTypes: typeof SequelizeObject.DataTypes) => {
    const User = sequelize.define<IUserModel>('user', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [4, 50]
            },
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        secondName: {
            type: DataTypes.STRING,
            allowNull: false
        },

        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        lastOnline: DataTypes.DATE,
    }, {
        createdAt: true,
        updatedAt: false
    }) as ModelStaticAssoc<IUserModel>

    User.associate = (models) => {
        User.hasMany(models.MessageModel, {
            foreignKey: 'senderId'
        })
        User.hasMany(models.UserChatModel)
        User.belongsToMany(models.ChatModel, { through: 'user_chat', onDelete: 'CASCADE' })
    }
    return User
}

export default UserModel

export const userZodSchema = z.object({
    email: z.string().min(1, {message: 'Заполните email'}).email('Введите корректный email'),
    name: z.string().min(1, {message: 'Заполните Имя'}),
    secondName: z.string().min(1, {message: 'Заполните Фамилию'}),
    password: z.string().min(6, {message: 'Пароль должен быть от 6 символов'}),
}).refine((data) => validator.isStrongPassword(data.password), {
    path: ['password'],
    message: 'Пароль должен содержать заглавную букву, специальный символ и цифру',
})