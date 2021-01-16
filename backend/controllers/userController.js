import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

// @desc 	Auth User & get Token
// @route 	POST /api/users/login
// @access	PUBLIC
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        if (password && user.password) {
            if (await user.matchPassword(password)) {
                console.log("Auth User and Get Token => Login");
                res.status(200).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                });
            } else {
                res.status(401);
                throw new Error("Password is not valid");
            }
        } else if (
            (!password || (password && !user.password)) &&
            user.googleId
        ) {
            res.status(401);
            throw new Error(
                "You Are Registered With Google Account. Kindly Login using Google"
            );
        }
    } else {
        res.status(401);
        throw new Error("Invalid Credentials");
    }
});

// @desc 	Auth User & get Token
// @route 	POST /api/users/googlelogin
// @access	PUBLIC
const authUserGoogle = asyncHandler(async (req, res) => {
    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        const { payload } = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const {
            email_verified,
            email,
            name,
            given_name,
            family_name,
            picture,
            at_hash,
            jti,
            sub,
        } = payload;

        if (email_verified) {
            const user = await User.findOne({ email });

            if (user) {
                console.log("User Found => GoogleLogin");
                if (!user.googleTokenId) {
                    user.firstName = given_name;
                    user.lastName = family_name;
                    user.image = picture;
                    user.googleId = `at_hash=${at_hash}, jti=${jti}, sub=${sub}`;
                    user.googleTokenId = tokenId;
                    const updatedUser = await user.save();
                }

                res.status(200).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                    isNew: false,
                });
            }
            //Create New User
            else {
                const user = await User.create({
                    name,
                    email,
                    firstName: given_name,
                    lastName: family_name,
                    image: picture,
                    googleId: `at_hash=${at_hash}, jti=${jti}, sub=${sub}`,
                    googleTokenId: tokenId,
                });

                if (user) {
                    console.log("Register User => GoogleLogin");
                    res.status(201).json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        isAdmin: user.isAdmin,
                        token: generateToken(user._id),
                        isNew: true,
                    });
                } else {
                    res.status(400);
                    throw new Error("Invalid User Data");
                }
            }
        } else {
            res.status(400);
            throw new Error("Email Not Verified By Google");
        }
    } catch (error) {
        console.log("Error in Verifiying Token: " + error);
        res.status(400);
        throw new Error("Error in Verifiying Token: " + error);
    }
});

// @desc 	Register User
// @route 	POST /api/users
// @access	PUBLIC
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400);
        throw new Error("User Already Exist With This Email");
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        console.log("Register User");
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid User Data");
    }
});

// @desc 	GET USER PROFILE
// @route 	GET /api/users/profile
// @access	PRIVATE
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        console.log("Get User Profile By Id");
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error("User Not Found");
    }
});

// @desc 	UDPATE USER PROFILE
// @route 	PUT /api/users/profile
// @access	PRIVATE
const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            console.log("Update User Porfile By Id");

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404);
            throw new Error("User Not Found");
        }
    } catch (error) {
        res.status(500);
        throw new Error(
            "Error in Updating User " + error.message ? error.message : error
        );
    }
});

// @desc 	GET ALL USERS
// @route 	GET /api/users
// @access	PRIVATE/ADMIN
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});

    console.log("Get All Users");
    res.json(users);
});

// @desc 	DELETE USER
// @route 	DELETE /api/users/:id
// @access	PRIVATE/ADMIN
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        console.log("Remove User By Admin Using Id");

        await user.remove();
        res.json({ message: "User Removed Successfully" });
    } else {
        res.status(404);
        throw new Error("User Not Found");
    }
});

// @desc 	GET USER BY ID
// @route 	GET /api/users/:id
// @access	PRIVATE/ADMIN
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
        console.log("Get User By Admin Using Id");
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error("No User Found For This Id");
    }
});

// @desc 	UDPATE USER
// @route 	PUT /api/users/:id
// @access	PRIVATE/ADMIN
const updateUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.isAdmin = req.body.isAdmin;

            const updatedUser = await user.save();

            console.log("Update User By Admin Using Id");

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin ? true : false,
            });
        } else {
            res.status(404);
            throw new Error("User Not Found");
        }
    } catch (error) {
        res.status(500);
        throw new Error(
            "Error in Updating User " + error.message ? error.message : error
        );
    }
});

export {
    authUser,
    authUserGoogle,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser,
    getUserById,
    updateUser,
};
