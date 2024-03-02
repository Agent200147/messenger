import { Router } from 'express';
import {
    createChat,
    findUserChats,
    findChat,
    findUserChatsAndRecipients, readChatMessages, findUserPotentialChats
} from "../Controllers/ChatController.js";
import { checkAuth } from "../Controllers/UserController.js";

const router = Router()

router.post("/create", checkAuth, createChat)
router.post("/read", checkAuth, readChatMessages)
router.get("/potential", checkAuth, findUserPotentialChats)
router.get("/:userId", checkAuth, findUserChatsAndRecipients)
router.get("/find/:firstId/:secondId", checkAuth, findChat)
// router.post("/findAll/:userId", findAllInfo)

export default router