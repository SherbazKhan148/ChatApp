import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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
app.listen(
    PORT,
    console.log(
        `Server Running in ${process.env.NODE_ENV} mode On Port ${PORT}`
    )
);
