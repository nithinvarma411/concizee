import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    role: {
        type: String,
        enum: ["user", "bot"]
    },
    text: String
}, { timestamps: true });

const chatSchema = new Schema({
    title: {
        type: String,
        default: "New Chat"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [messageSchema],
}, { timestamps: true });

export const Chat = model('Chat', chatSchema);