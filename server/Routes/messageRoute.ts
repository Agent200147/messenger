import { Router } from 'express';
import {
    createMessage,
    getChatAdditionalMessages,
    getChatMessagesAndRecipient
} from "../Controllers/MessageController.js";
import { checkAuth } from "../Controllers/UserController.js";

const router = Router()

router.post("/", checkAuth, createMessage)
router.get("/:chatId", checkAuth, getChatMessagesAndRecipient)
router.get("/additional/:chatId", checkAuth, getChatAdditionalMessages)
// router.get("/:chatId", checkAuth, getMessages)

export default router