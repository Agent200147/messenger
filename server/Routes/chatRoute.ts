import { Router } from 'express';
import {
    createChat,
    findUserChatsAndRecipients,
    readChatMessages,
    findUserPotentialUsersToChat,
    saveCanvas
} from "../Controllers/ChatController.js";
import { checkAuth } from "../Controllers/UserController.js";

const router = Router()

router.get("/", checkAuth, findUserChatsAndRecipients)
router.post("/create", checkAuth, createChat)
router.post("/read", checkAuth, readChatMessages)
router.get("/potential", checkAuth, findUserPotentialUsersToChat)
router.post("/canvas", checkAuth, saveCanvas)

export default router