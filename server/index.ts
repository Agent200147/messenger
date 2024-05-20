import type { Express } from "express";

import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from "path";
import { fileURLToPath } from "url";

import userRoute from './Routes/User.route.js';
import chatRoute from './Routes/Chat.route.js';
import messageRoute from './Routes/Message.route.js';

import db from './Models/index.js';

const { sequelize } = db
const { MessageModel, UserChatModel } = db.models

const app: Express = express()
dotenv.config({ path: './.env'})
app.use(cookieParser())

app.use(express.json())
app.use(cors({
    // origin: ['http://localhost:3000', 'http://192.168.0.82:3000'],
    origin: [process.env.CLIENT_URL || ''],
    credentials: true
}))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log(__dirname)

app.use('/userAvatarPhotos', express.static(path.join(__dirname, 'userAvatarPhotos')))
app.use('/canvas', express.static(path.join(__dirname, 'canvas')))
app.use('/api/users', userRoute)
app.use('/api/chats', chatRoute)
app.use('/api/messages', messageRoute)

// User_Chat.sync({ alter: true })
// sequelize.sync({ alter: true })

const PORT = process.env.PORT

const initial = async () => {
    const canvas = await UserChatModel.findAll()
    canvas.forEach(canvas => canvas.update({ canvasImage: null }))
}

// initial()
// app.get('/', (req, res) => {
//     res.send('Hi')
// })

app.listen(PORT, () => {
    console.log('Server is running with TS!')
})
