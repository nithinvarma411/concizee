import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_AI_BOT_URL);

export default socket;
