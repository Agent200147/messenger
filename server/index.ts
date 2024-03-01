import express, { type Express, type Request, type Response} from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser'
import {Server} from "socket.io";
import mysql from 'mysql';
import {Sequelize} from 'sequelize';
// import sequelize from './Sequelize/secuelize.js';
// const { createServer } = require("http");
import dotenv from 'dotenv'

// const { instrument } = require("@socket.io/admin-ui");
// -------------------------------------
import userRoute from './Routes/userRoute.js';
import chatRoute from './Routes/chatRoute.js';
import messageRoute from './Routes/messageRoute.js';
import fileUoload from 'express-fileupload'
import User_Chat from "./Models/user_ChatModel.js";
import models from './Models/index.js';
import path from "path";
import {fileURLToPath} from "url";
const { MessageModel, sequelize } = models
// -------------------------------------
const app: Express = express()
// const { sequelize } = models
dotenv.config({ path: './.env'})
app.use(cookieParser())
// app.use(fileUoload())

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.0.82:3000'],
    credentials: true
}))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)

app.use('/userAvatarPhotos', express.static(path.join(__dirname, 'userAvatarPhotos')));
app.use('/api/users', userRoute)
app.use('/api/chats', chatRoute)
app.use('/api/messages', messageRoute)

// User_Chat.sync({ alter: true })
// sequelize.sync({ alter: true })

const PORT = process.env.PORT


// app.get('/', (req, res) => {
//     res.send('Hi')
// })

app.listen(PORT, () => {
    console.log('Server is running with TS!')
})
