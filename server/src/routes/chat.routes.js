import { addMessageToChat, createChat, deleteChat, getChatByID, getTitles } from "../controllers/chat.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/save-response", addMessageToChat);
router.post("/create-chat", authMiddleware, createChat);
router.delete("/delete-chat", authMiddleware, deleteChat);
router.get("/getchatbyid/:chatId", authMiddleware, getChatByID);
router.get("/get-titles", authMiddleware, getTitles);

export default router;