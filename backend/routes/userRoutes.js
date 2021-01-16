import express from "express";
const router = express.Router();
import {
    authUser,
    authUserGoogle,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser,
    getUserById,
    updateUser,
} from "../controllers/userController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";

router.route("/").post(registerUser).get(protect, isAdmin, getAllUsers);

router.post("/login", authUser);
router.post("/googlelogin", authUserGoogle);

router
    .route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router
    .route("/:id")
    .delete(protect, isAdmin, deleteUser)
    .get(protect, isAdmin, getUserById)
    .put(protect, isAdmin, updateUser);

export default router;
