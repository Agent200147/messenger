import type { NextFunction, Request, Response } from "express";

import type { IUserModel } from "../Models/User.model.js";
import type { AuthenticatedRequest } from "../Controllers/types.js";

import jwt from "jsonwebtoken";

import db from '../Models/index.js';
const { UserModel } = db.models
import { ERROR_UNAUTHORIZED } from "../Controllers/ErrorTexts.js";

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.auth
        let decodedUser: IUserModel
        console.log('checkAuth middleware')

        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY || '') as IUserModel
        } catch (e) {
            res.status(401).json(ERROR_UNAUTHORIZED)
            return
        }

        const user = await UserModel.findByPk(decodedUser.id, {
            attributes: { exclude: ['password'] }
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

        (req as AuthenticatedRequest ).user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json(ERROR_UNAUTHORIZED)
    }
}