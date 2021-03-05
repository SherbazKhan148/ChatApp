import Message from "../models/messageModel.js";
import asyncHandler from "express-async-handler";

// @desc 	FETCH ALL MESSAGES
// @route 	GET /api/messages
// @access	PRIVATE
const getMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find()
            .limit(2000)
            .sort({ createdAt: 1 });

        console.log("Get All Messages");

        res.json(messages);
    } catch (error) {
        res.status(401);
        throw new Error("Error in Getting Messages " + error);
    }
});

// @desc 	CREATE A MESSAGE
// @route 	POST /api/messages
// @access	PRIVATE
const createMessage = asyncHandler(async (req, res) => {
    const { msg } = req.body;

    try {
        const message = new Message({
            user: req.user._id,
            msg: `[${req.user.name}]: ${msg}`,
        });

        const createdMessage = await message.save();
        console.log("Message Inserted");
        res.status(201).json(createdMessage);
    } catch (error) {
        res.status(401);
        throw new Error("Error in Getting Messages " + error);
    }
});

export { getMessages, createMessage };
