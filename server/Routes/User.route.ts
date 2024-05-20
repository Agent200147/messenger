import { Router } from 'express';

import {
    registerUser,
    loginUser,
    findUser,
    getUsers,
    checkAuth2, userAvatarUpload, setLastOnline
} from "../Controllers/User.controller.js";
import { uploadMiddleware } from "../Middleware/uploadPhoto.middleware.js";
import { checkAuth } from "../Middleware/auth.middleware.js";

const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/find/:userId", checkAuth, findUser)
router.get("/", checkAuth, getUsers)
// router.get("/current", currentUser)
router.get("/checkAuth", checkAuth2)
router.post("/avatarUpload", checkAuth, uploadMiddleware, userAvatarUpload)
router.post("/lastOnline", checkAuth, setLastOnline)

export default router