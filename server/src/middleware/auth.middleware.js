import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        // console.log("user", user.id);

        if (!user) {
            return res.status(404).send({"message": "User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export default authMiddleware;