import { Schema, model } from "mongoose";

const userSchema = new Schema({
    email: String,
    googleID: String,
    name: String,
    mode: {
        type: String,
        enum: ["dark", "light"],
        default: "light"
    }
})

export const User = model('User', userSchema);