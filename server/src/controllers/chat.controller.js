import { Chat } from "../model/chat.model.js";

// Create a new chat
const createChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title } = req.body;

        const newChat = new Chat({
            title: title || "New Chat",
            userId,
            messages: [],
        });

        await newChat.save();
        res.status(201).send({ chat: newChat });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};


// Add a message to a chat and optionally the bot response
const addMessageToChat = async (req, res) => {
    try {
        const { chatId, input, output } = req.body;

        if (!chatId) {
            return res.status(400).json({ message: "chatId is required" });
        }
        // Find chat and check ownership
        const chat = await Chat.findOne({ _id: chatId});
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        // Add user message
        chat.messages.push({ role: "user", text: input });
        // Add bot response if provided
        if (output) {
            chat.messages.push({ role: "bot", text: output });
        }
        await chat.save();

        res.status(200).send({ message: "Messages added successfully" });
    } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
};

const getTitles = async (req, res) => {
    try {
        const userId = req.user.id;
        const titles = await Chat.find({ userId }).select("title _id").sort({ updatedAt: -1 });
        res.status(200).send({ titles });
    } catch (error) {
        console.log("Error Retriving Titles", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

const getChatByID = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ _id: chatId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).send({ chat });
    } catch (error) {
        console.log("Error Retrieving Chat", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

const deleteChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.body;
        const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).send({ message: "Chat Deleted" });
    } catch (error) {
        console.log("Error Deleting Chat", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

export { createChat, addMessageToChat, getTitles, getChatByID, deleteChat };