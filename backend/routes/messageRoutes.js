import express from "express";
const router = express.Router();
import {
    createMessage,
    getMessages,
} from "../controllers/messageController.js";

import { isAdmin, protect } from "../middleware/authMiddleware.js";

router.route("/").get(protect, getMessages).post(protect, createMessage);

export default router;
