import sequelize from "../Sequelize/secuelize.js";
import {DataTypes} from "sequelize";
import User from "./userModel.js";
import Chat from "./chatModel.js";



const User_ChatModel = (sequelize, DataTypes) => {
    const User_Chat = sequelize.define('user_chat', {
        // Model attributes are defined here
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: sequelize.models.UserModel, // 'Movies' would also work
                key: 'id'
            }
        },
        chatId: {
            type: DataTypes.INTEGER,
            references: {
                model: sequelize.models.ChatModel, // 'Movies' would also work
                key: 'id'
            }
        },
        unReadMessages: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        canvasImage: {
            type: DataTypes.STRING,
            required: false,
            allowNull: true
        },
    }, {
        sequelize,
        createdAt: true,
        updatedAt: false,
    })

    User_Chat.associate = (models) => {
        User_Chat.belongsTo(models.ChatModel, {foreignKey: 'chatId', onDelete: 'CASCADE'})
        User_Chat.belongsTo(models.UserModel, {foreignKey: 'userId', onDelete: 'CASCADE'})
    }
    return User_Chat

    // User_Chat.associate = (models) => {
    //     User_Chat.belongsToMany(models.chat, {
    //         through: 'user_chat'
    //     })
    // }
}

// User.belongsToMany(Chat, { through: 'user_chat' })
// Chat.belongsToMany(User, { through: 'user_chat' })

export default User_ChatModel