import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectDB from "./config/db.js";

const app = express();

app.use(
  session({
    secret: "yourSecretKey", // Change this to a strong secret!
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV = "production",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.send("Hello from server");
});

import { googleAuth, googleAuthCallback, googleAuthSuccess, logout, toggleMode, getMode , checkAuth} from "./controllers/user.controller.js";
import chatRoute from "./routes/chat.routes.js"
import authMiddleware from "./middleware/auth.middleware.js";

app.get("/auth/google", googleAuth);
app.get("/auth/google/callback", googleAuthCallback, googleAuthSuccess);
app.post("/logout", logout);
app.patch("/toggle-mode", authMiddleware, toggleMode);
app.get("/check-auth", authMiddleware, checkAuth);
app.get("/get-mode", authMiddleware, getMode);

app.use("/api/v1", chatRoute);

connectDB()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });
    })
    .catch((error) => {
        console.log("error connecting to db", error);
    });