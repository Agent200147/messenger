// import jwt, {verify} from 'jsonwebtoken'
// import type { CookieOptions, Response, Request, NextFunction } from "express";
//
// export const cookeJwtAuth = (req: Request, res: Response, next: NextFunction) => {
//     const token = req.cookies?.token
//
//     try {
//         const user = verify(token, process.env.JWT_SECRET_KEY || '')
//         req.user = user
//         next()
//     }
//     catch (e) {
//         res.clearCookie('auth')
//     }
// }