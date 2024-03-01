import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import sequelize from '../Sequelize/secuelize.js';

import userModel from "./userModel.js";
import chatModel from "./chatModel.js";
import messageModel from "./messageModel.js";
import userChatModel from "./user_ChatModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {
    sequelize: {},
    Sequelize: {},
};


// fs
//     .readdirSync(__dirname)
//     .filter(file => {
//         return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.ts');
//     })
//     .forEach(file => {
//         console.log(file)
//         // const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
//         // db[model.name] = model
//
//         // const { default: model } = await import(path.join(__dirname, file))
//         // db[model.name] = model
//     });

db[userModel.name] = userModel(sequelize, Sequelize.DataTypes)
db[chatModel.name] = chatModel(sequelize, Sequelize.DataTypes)
db[messageModel.name] = messageModel(sequelize, Sequelize.DataTypes)
db[userChatModel.name] = userChatModel(sequelize, Sequelize.DataTypes)
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
export default db