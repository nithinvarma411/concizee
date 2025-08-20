import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5000;

app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true
}));
app.use(express.json());

// 1️⃣ Create HTTP server and initialize socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach io globally (optional)
app.set('io', io);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Keep track of socket connections (optional, for multi-user chats)
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.post("/concise", async (req, res) => {
  try {
    const { userInput, chatId, socketId, prevChats } = req.body;

    // Build messages array for the AI
    const messagesArray = [
      {
        role: "system",
        content: `You are Concizee, a smart assistant.
- If the user asks a question, respond in a short, clear, and concise sentence.
- If the user provides a long paragraph, summarize it into bullet points.
- Each bullet point MUST:
   • Start with a dash (-) followed by a space.
   • Appear on its own line.
   • End with a line break (\\n).
- Do NOT put multiple bullet points on the same line.
- Do NOT number the points, only use dashes.
- Keep answers simple, easy to read, and precise.`
      },
      // Add previous messages for context
      ...(prevChats || []),
      // Add the latest user message
      { role: "user", content: userInput }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messagesArray,
      temperature: 0.3,
    });

    const botResponse = completion.choices[0].message.content;

    // Save to database backend
    await axios.post(`${process.env.SERVER_URL}api/v1/save-response`, {
      input: userInput,
      output: botResponse,
      chatId
    });

    // Emit response using socket.io
    if (socketId) {
      io.to(socketId).emit("botResponse", { response: botResponse });
      res.status(200).send({ success: true });
    } else {
      res.send({ response: botResponse });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


server.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
