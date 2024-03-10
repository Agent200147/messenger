import { DataTypes } from 'sequelize';
import sequelize from '../Sequelize/secuelize.js';
import { z } from "zod";
import validator from "validator";
import Chat from "./chatModel.js";
import User_Chat from "./user_ChatModel.js";



// const userCreate = async (username) => {
//     await User.create({ username: username });
// }
//
// const userGetAll = async (username) => {
//     return await User.findAll();
// }

// module.exports = User

const UserModel = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        // Model attributes are defined here
        // id: {
        //     type: DataTypes.INTEGER,
        //     autoIncrement: true,
        //     primaryKey: true
        // },

        email: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false,
            minLength: 4,
            unique: true
        },

        name: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },

        secondName: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false
        },

        avatar: {
            type: DataTypes.STRING,
            required: false,
            allowNull: true
        },

        password: {
            type: DataTypes.STRING,
            required: true,
            allowNull: false,
            minLength: 8,
        },

        lastOnline: DataTypes.DATE,
    }, {
        sequelize,
        createdAt: true,
        updatedAt: false
    })
    User.associate = (models) => {
        User.hasMany(models.MessageModel, {
            foreignKey: 'senderId'
        })
        User.hasMany(models.User_ChatModel)
        User.belongsToMany(models.ChatModel, { through: 'user_chat', onDelete: 'CASCADE' })
    }
    return User;
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