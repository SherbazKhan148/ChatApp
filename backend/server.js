import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import socket from "socket.io";

// Allow to use .env files
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express Server
const app = express();

// Show All APIs have been called from frontend
if (process.env.NODE_ENV == "development") {
    app.use(morgan("dev"));
}

// Allow front end to send Data/Body to Backend
app.use(express.json());

// Allowing Frontend to call backend without Cross Origin Errors
app.use(cors());

// ALL ROUTES
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// GET PAYPAL CLIENT ID
app.get("/api/config/paypal", (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// GET GOOGLE CLIENT ID
app.get("/api/config/googleClientId", (req, res) => {
    res.send(process.env.GOOGLE_CLIENT_ID);
});

// File Uploading
const __dirname = path.resolve();
app.use(
    "/uploads",
    express.static(path.join(__dirname.toString(), "/uploads"))
);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(
            path.resolve(__dirname, "frontend", "build", "index.html")
        );
    });
} else {
    app.get("/", (req, res) => {
        res.send("Server.js API");
    });
}

//Not Found
app.use(notFound);
//Error MiddleWare
app.use(errorHandler);

// PORT
const PORT = process.env.PORT || 5000;

// SETUP SERVER
let server = app.listen(
    PORT,
    console.log(
        `Server Running in ${process.env.NODE_ENV} mode On Port ${PORT}`
    )
);

let io = socket(server);

io.on("connection", (socket) => {
    console.log("User Connected");

    socket.on("join", (userInfo, callback) => {
        try {
            // Sending value to Frontend (Only to the user who just logged in)
            socket.emit("message", {
                user: { name: "admin" },
                text: `Welcome ${userInfo.name}`,
            });

            // Sending value to Frontend (All other users which are already logged in)
            socket.broadcast.to("myRoom").emit("message", {
                user: { name: "admin" },
                text: `${userInfo.name} has joined`,
            });

            socket.join("myRoom");

            callback();
        } catch (error) {
            callback({ error: "Catch Error: " + error });
        }
    });

    // Getting Value from FrontEnd
    socket.on("message-from-client", ({ userInfo, message }, callback) => {
        console.log(userInfo.name, message);

        // Sending Value to FrontEnd
        io.to("myRoom").emit("message", { user: userInfo, text: message });

        callback();
        // io.sockets.emit("message-from-server", data);
    });

    socket.on("disconnect", (res) => {
        // Sending Value to FrontEnd
        console.log("Disconnected => " + res);
        // io.to("myRoom").emit("message", {
        //     user: userInfo,
        //     text: `${userInfo.name} has left`,
        // });

        console.log("User Disconnected");
    });
});
