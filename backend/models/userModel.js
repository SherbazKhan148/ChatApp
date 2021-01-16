import mongoose from "mongoose";
import bycrypt from "bcryptjs";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },

        //FOR USERS REGISTERED THROUGH GOOGLE LOGIN
        googleId: { type: String },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        image: {
            type: String,
        },
        googleTokenId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

//It will run before registering User
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bycrypt.genSalt(10);
    this.password = await bycrypt.hash(this.password, salt);
});

//It will run before Logging In
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bycrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
