import type { CookieOptions, Request, Response } from "express";

import type { IUserModel } from '../Models/User.model.js'
import type { AuthenticatedRequest } from "./types.js";

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ZodError } from "zod";

import db from '../Models/index.js';
const { UserModel } = db.models
import { userZodSchema } from '../Models/User.model.js'
import { ERROR_INVALID_CREDENTIALS, ERROR_SERVER_ERROR, ERROR_UNAUTHORIZED, ERROR_USER_EXIST } from "./ErrorTexts.js";

const MAX_AGE = 30 * 24 * 60 * 60 * 1000

const createToken = (idObj: { id: number }) => {
    const jwtKey = process.env.JWT_SECRET_KEY || 'secret-key-key'
    return jwt.sign(idObj, jwtKey, { expiresIn: MAX_AGE })
}

const options: CookieOptions =  {
    httpOnly: true,
    // secure: true,
    maxAge: MAX_AGE,
    sameSite: true,
    path: '/'
}
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, secondName, email, password } = req.body

        try {
            await userZodSchema.parseAsync({ name, secondName, email, password })
        }
        catch (e) {
            if(e instanceof ZodError) {
                return res.status(400).json({ name: 'ZodError', errors: e.issues.map(err => err.message) })
            }
            return res.status(500).json(ERROR_SERVER_ERROR)
        }

        let user = await UserModel.findOne({ where: { email } })
        if (user) return res.status(400).json(ERROR_USER_EXIST)
        const salt = await bcrypt.genSalt(10)
        user = UserModel.build({ name, secondName, email, password })
        user.password = await bcrypt.hash(user.password, salt)

        await user.save()
        const token = createToken(user.dataValues)

        // delete user.password
        // const { password: pswd, ...userToSend } = user.dataValues

        res.cookie('auth', token, options)
        res.status(200).json()
    } catch (e) {
        console.log(e)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
        let user = await UserModel.findOne({ where: { email: email } })
        if (!user) return res.status(400).json(ERROR_INVALID_CREDENTIALS)
        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword) return res.status(400).json(ERROR_INVALID_CREDENTIALS)

        // const token = createToken(user.dataValues)
        const token = createToken({ id: user.id })
        res.cookie('auth', token, options)
        // delete user.dataValues.password

        res.status(200).json()
    } catch (e) {
        console.log(e)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

export const findUser = async (req: Request, res: Response) => {
    const userId = req.params.userId
    try {
        const user = await UserModel.findByPk(userId)
        res.status(200).json(user)
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.findAll({
            attributes: {exclude: ['password']},
        })
        res.status(200).json(users)
    } catch (e) {
        console.log(e)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

// export const currentUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         let token = req.headers.authorization?.split(" ")[1]
//         // let token = req.cookies?.auth
//         if (!token) {
//             return res.status(401).json({ message: 'Не авторизован' });
//         }
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//
//         const user = await UserModel.findByPk(decoded.id, {
//             attributes: {exclude: ['password']}
//         })
//
//         if (!user) {
//             return res.status(401).json({ message: 'Не авторизован' });
//         }
//         res.status(200).json({...user.dataValues, token})
//         next()
//     } catch (error) {
//         res.status(401).json({ message: 'Не авторизован' });
//     }
// }

export const checkAuth2 = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.auth
        console.log('checkAuth2: getIsAuth')

        let decodedUser: IUserModel
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY || '') as IUserModel
        } catch (e) {
            res.status(401).json(ERROR_UNAUTHORIZED)
            return
        }

        const user = await UserModel.findByPk(decodedUser.id, {
            attributes: {exclude: ['password']},
        })

        if (!user) {
            res.status(401).json(ERROR_UNAUTHORIZED)
            return
        }

        // if (user.avatar !== decodedUser.avatar) {
        //     console.log('miss')
        //     const token = createToken(user.dataValues)
        //     res.cookie('auth', token, options)
        // }
        // res.status(200).json({message: 'Ок'})
        res.status(200).json({ user })
    } catch (error) {
        console.log(error)
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

export const userAvatarUpload = async (req: Request, res: Response) => {
    try {
        if(!req.file) return res.status(500).json(ERROR_SERVER_ERROR)
        const { path } = req.file
        const user = (req as AuthenticatedRequest).user

        // if (!user) return res.status(401).json({ message: 'Не авторизован' })

        user.update({ avatar: path })

        res.status(200).json(path)
    } catch (error) {
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}

export const setLastOnline = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user
        await user.update({ lastOnline: (new Date()).toString() })
        res.status(200).json({ message: 'Ок' })
    } catch (error) {
        res.status(500).json(ERROR_SERVER_ERROR)
    }
}



