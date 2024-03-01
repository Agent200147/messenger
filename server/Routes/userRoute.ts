import { Router } from 'express';
import {
    registerUser,
    loginUser,
    findUser,
    getUsers,
    currentUser,
    checkAuth,
    checkAuth2, userAvatarUpload
} from "../Controllers/UserController.js";
import {uploadMiddleware} from "../Middleware/uploadPhoto.js";

const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/find/:userId", checkAuth, findUser)
router.get("/", checkAuth, getUsers)
router.get("/current", currentUser)
router.get("/checkAuth", checkAuth2)
router.post("/avatarUpload", checkAuth, uploadMiddleware, userAvatarUpload)

export default router