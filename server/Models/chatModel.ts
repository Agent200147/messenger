import { DataTypes } from 'sequelize';
import sequelize from '../Sequelize/secuelize.js';
import User from "./userModel.js";
import User_Chat from "./user_ChatModel.js";
import Message from "./messageModel.js";

// const Chat = sequelize.define('chats', {
//     // Model attributes are defined here
//     members: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         get() {
//             return this.getDataValue('members').split(';')
//         },
//         set(val) {
//             this.setDataValue('members', val.join(';'));
//         },
//     },
// }, {
//     sequelize,
//     createdAt: true,
//     updatedAt: false,
// });


const ChatModel = (sequelize, DataTypes) => {
    const Chat = sequelize.define('chat', {
        // Model attributes are defined here
        // members: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     get() {
        //         return this.getDataValue('members').split(';')
        //     },
        //     set(val) {
        //         this.setDataValue('members', val.join(';'));
        //     },
        // },
    }, {
        sequelize,
        createdAt: true,
        updatedAt: false,
    })
    Chat.associate = (models) => {
        // Chat.belongsToMany(models.User, { through: models.user_chat })
        Chat.hasMany(models.MessageModel, {
            foreignKey: 'chatId'
        })
        Chat.hasMany(models.User_ChatModel)
        Chat.belongsToMany(models.UserModel, { through: 'user_chat', as: 'recipients', onDelete: 'CASCADE' })
    }

    return Chat;
}

export default ChatModel