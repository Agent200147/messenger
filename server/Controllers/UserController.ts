import { userZodSchema } from '../Models/userModel.js'

import models from '../Models/index.js';
const { UserModel } = models
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {serialize} from "cookie";
import type { CookieOptions, Response } from "express";
import fs from "fs";
import {nanoid} from "nanoid";

const MAX_AGE = 30 * 24 * 60 * 60 * 1000
// const createToken = (id) => {
//     const jwtkey = process.env.JWT_SECRET_KEY || 'secret-key-key'
//
//     return jwt.sign({ id }, jwtkey, {expiresIn: MAX_AGE})
// }

const createToken = (user) => {
    const jwtkey = process.env.JWT_SECRET_KEY || 'secret-key-key'

    return jwt.sign(user, jwtkey, {expiresIn: MAX_AGE})
}

const options: CookieOptions =  {
    httpOnly: true,
    // secure: true,
    maxAge: MAX_AGE,
    sameSite: true,
    path: '/'
}
export const registerUser = async (req, res) => {
    try {
        // res.send('Index!')
        const { name, secondName, email, password } = req.body

        try {
            await userZodSchema.parseAsync({ name, secondName, email, password })

        }
        catch (e) {
            return res.status(400).json(e)
        }

        // console.log('username ', username, ' email ', email, ' password ', password)
        // if(!name || !email || !password) return res.status(400).json('Все поля обязательны')

        let user = await UserModel.findOne({ where: { email: email } })
        // console.log(user)
        if (user) return res.status(400).json('Пользователь уже существует!')

        // if (!validator.isEmail(email)) return res.status(400).json('Неверно указан email')
        // if (!validator.isStrongPassword(password)) return res.status(400).json('Неверно указан пароль')
        const salt = await bcrypt.genSalt(10)
        user = UserModel.build({ name, secondName, email, password })
        user.password = await bcrypt.hash(user.password, salt)

        // console.log(user._id)
        await user.save()

        const token = createToken(user.dataValues)

        res.cookie('auth', token, options)
        res.status(200).json({id: user.id, name, secondName, email})
    } catch (e) {
        console.log(e)
        res.status(500).json('Непредвиденная ошибка на сервере')
    }
}

export const loginUser = async (req, res: Response) => {
    const { email, password } = req.body
    console.log(email, password)
    try {
        let user = await UserModel.findOne({ where: { email: email } })
        if (!user) return res.status(400).json('Неверный логин или пароль')
        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword) return res.status(400).json('Неверный логин или пароль')

        const token = createToken(user.dataValues)

        res.cookie('auth', token, options)
        res.status(200).json({id: user.id, name: user.name, secondName: user.secondName, email, avatar: user.avatar})
    } catch (e) {
        console.log(e)
        res.status(500).json('Непредвиденная ошибка на сервере')
    }
}

export const findUser = async (req, res) => {
    const userId = req.params.userId
    // console.log('TOKEN:', req.headers)
    try {
        const user = await UserModel.findByPk(userId)
        res.status(200).json(user)
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await UserModel.findAll({
            attributes: {exclude: ['password']},
        })
        res.status(200).json(users)
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }
}

export const currentUser = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(" ")[1];
        // let token = req.cookies?.auth

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await UserModel.findByPk(decoded.id, {
            attributes: {exclude: ['password']}
        });
        if (!user) {
            res.status(401).json({ message: 'Не авторизован' });
        }
        res.status(200).json({...user.dataValues, token})
        next()
    } catch (error) {
        res.status(401).json({ message: 'Не авторизован' });
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.auth
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await UserModel.findByPk(decodedUser.id, {
            attributes: {exclude: ['password']}
        })

        if (!user) {
            res.status(401).json({ message: 'Не авторизован' })
        }
        if (user.avatar !== decodedUser.avatar) {
            console.log('miss')
            const token = createToken(user.dataValues)
            res.cookie('auth', token, options)
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ message: 'Не авторизован' })
    }
};

export const checkAuth2 = async (req, res, next) => {
    try {
        // const token = req.cookies?.auth
        // console.log(req.cookies)
        const token = req.cookies?.auth
        // console.log(token)
        // console.log('checkAuth2:', token)
        // console.log(req.cookies?.auth)
        // console.log(req.cookies, token, 'f')
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY || '');
        // console.log(decodedUser)
        const user = await UserModel.findByPk(decodedUser?.id);

        if (!user) {
            // res.clearCookie('auth')
            res.status(401).json({ message: 'Не авторизован' });
            return
        }

        if (user.avatar !== decodedUser.avatar) {
            console.log('miss')
            const token = createToken(user.dataValues)
            res.cookie('auth', token, options)
        }
        res.status(200).json({message: 'Ок'})
    } catch (error) {
        // res.status(500).json({ message: 'Непредвиденная ошибка на сервере' });
        res.status(500).json({ message: 'Непредвиденная ошибка на сервере' });
    }
};

export const userAvatarUpload = async (req, res) => {
    try {
        // const token = req.cookies?.auth
        const { path } = req.file;
        const user = await UserModel.findByPk(req.user.id)
        // const fileName = nanoid() + file.type
        // const path = `${directory}\\${fileName}`
        // file.mv(path)

        user.update({ avatar: path })

        // file.mv
        // console.log(token)
        // console.log('checkAuth2:', token)
        // console.log(req.cookies?.auth)
        // console.log(req.cookies, token, 'f')
        // const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || '');
        // console.log(decoded)
        // const user = await UserModel.findByPk(decoded?.id);

        // if (!user) {
        //     // res.clearCookie('auth')
        //     res.status(401).json({ message: 'Не авторизован' });
        //     return
        // }

        const token = createToken(user.dataValues)
        res.cookie('auth', token, options)
        res.status(200).json({message: 'Ок'})
    } catch (error) {
        // res.status(500).json({ message: 'Непредвиденная ошибка на сервере' });
        res.status(500).json({ message: 'Непредвиденная ошибка на сервере' });
    }
}

export const setLastOnline = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.user.id)
        user.update({ lastOnline: new Date() })
        // console.log(user)
        res.status(200).json({message: 'Ок'})
    } catch (error) {
        // res.status(500).json({ message: 'Непредвиденная ошибка на сервере' });
        res.status(500).json({ message: 'Непредвиденная ошибка на сервере' });
    }
}



