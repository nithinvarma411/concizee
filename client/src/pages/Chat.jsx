import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import eventEmitter from "../utils/eventEmitter";
import { FaCrown, FaMoon, FaSun, FaTrash, FaSignOutAlt } from "react-icons/fa";
import socket from "../utils/socket";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [isNewChat, setIsNewChat] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const isNew = chatId === "new";
    setIsNewChat(isNew);

    if (isNew) {
      setTitle("");
      setMessages([]);
      setInput("");
    }
  }, [chatId]);

  useEffect(() => {
    const fetchChat = async () => {
      if (chatId && chatId !== "new") {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}api/v1/getchatbyid/${chatId}`,
            { withCredentials: true }
          );
          setTitle(res.data.chat.title);
          setMessages(
            res.data.chat.messages.map((msg, index) => ({
              id: index + 1,
              text: msg.text,
              isBot: msg.role === "bot",
            }))
          );
        } catch (error) {
          console.error("Error fetching chat:", error);
        }
      }
    };

    fetchChat();
  }, [chatId]);

  useEffect(() => {
    socket.on("botResponse", ({ response }) => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: response, isBot: true },
      ]);
      setIsLoading(false);
    });

    return () => {
      socket.off("botResponse");
    };
  }, []);

  const handleCreateChat = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}api/v1/create-chat`,
        { title: title || "New Chat" },
        { withCredentials: true }
      );
      eventEmitter.emit("refreshTitles");
      navigate(`/chat/${res.data.chat._id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message locally
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: input, isBot: false },
    ]);
    setIsLoading(true);

    try {
      // Prepare all previous messages for context
      const contextMessages = messages.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.text,
      }));

      // Include the current user message
      contextMessages.push({ role: "user", content: input });
      setInput("");

      // Send the full conversation to the backend
      await axios.post(
        `${import.meta.env.VITE_AI_BOT_URL}concise`,
        {
          chatId,
          socketId: socket.id,
          prevChats: contextMessages,
          userInput: input,
        },
        { withCredentials: true }
      );

      if (textareaRef.current) {
        textareaRef.current.style.height = "2.5rem";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleDeleteChat = async () => {
    if (!chatId || chatId === "new") return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}api/v1/delete-chat`,
        {
          data: { chatId },
          withCredentials: true,
        }
      );
      setShowConfirmDelete(false);
      eventEmitter.emit("refreshTitles");
      navigate("/");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}logout`,
        {},
        { withCredentials: true }
      );
      eventEmitter.emit("clearTitles");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const fetchMode = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}api/v1/get-mode`,
          { withCredentials: true }
        );
        setIsDarkMode(res.data.mode === "dark");
      } catch (error) {
        console.error("Error fetching mode:", error);
      }
    };
    fetchMode();
  }, []);

  const toggleTheme = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}toggle-mode`,
        {},
        { withCredentials: true }
      );
      setIsDarkMode(!isDarkMode);
    } catch (error) {
      console.error("Error toggling mode:", error);
    }
  };

  if (isNewChat) {
    return (
      <div
        className={`flex-1 flex items-center justify-center min-h-screen px-4 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="w-full max-w-md mx-auto">
          <form onSubmit={handleCreateChat} className="space-y-4">
            <div className="text-center mb-6">
              <h2
                className={`text-xl sm:text-2xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Create New Chat
              </h2>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chat title"
              className={`
                w-full p-3 sm:p-4 border rounded-lg text-base
                ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
            <button
              type="submit"
              className="
                w-full bg-blue-500 text-white px-4 py-3 sm:py-4 rounded-lg text-base font-medium
                hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              Create Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <FaCrown className="text-yellow-400 text-lg sm:text-xl animate-pulse" />
            <h1 className="text-lg sm:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 font-bold tracking-wider">
              CONCIZEE
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="
              bg-gray-500/80 text-white px-2 sm:px-4 py-2 rounded-lg 
              hover:bg-gray-600 transition-colors flex items-center gap-1 sm:gap-2
              text-xs sm:text-sm
            "
          >
            {isDarkMode ? (
              <FaSun className="text-yellow-400 text-sm sm:text-base" />
            ) : (
              <FaMoon className="text-gray-300 text-sm sm:text-base" />
            )}
            <span className="hidden sm:inline">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {chatId !== "new" && (
            <button
              onClick={handleDeleteClick}
              className="
                bg-red-500/80 text-white px-2 sm:px-4 py-2 rounded-lg 
                hover:bg-red-600 transition-colors flex items-center gap-1 sm:gap-2
                text-xs sm:text-sm
              "
            >
              <FaTrash className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="
              bg-gray-500/80 text-white px-2 sm:px-4 py-2 rounded-lg 
              hover:bg-gray-600 transition-colors flex items-center gap-1 sm:gap-2
              text-xs sm:text-sm
            "
          >
            <FaSignOutAlt className="text-sm sm:text-base" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700 text-sm sm:text-base">
              Are you sure you want to delete this chat?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        className={`
    flex-1 overflow-y-auto p-3 sm:p-4 space-y-4
    ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}
  `}
        style={{ maxHeight: "calc(100vh - 155px)" }} // adjust based on header+input height
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isBot ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`
          p-3 sm:p-4 rounded-lg max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] 
          break-words text-sm sm:text-base
          ${
            message.isBot
              ? isDarkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-200 text-gray-900"
              : "bg-blue-500 text-white"
          }
        `}
            >
              <div className="prose prose-sm sm:prose max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    code: ({ children }) => (
                      <code className="bg-black bg-opacity-20 px-1 rounded text-xs sm:text-sm">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className={`
          p-3 sm:p-4 border-t
          ${isDarkMode ? "border-gray-700" : "border-gray-200"}
        `}
      >
        <div className="flex gap-2 sm:gap-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={`
              flex-1 p-3 border rounded-lg resize-none overflow-y-auto text-sm sm:text-base
              ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            rows={1}
            style={{
              minHeight: "2.5rem",
              maxHeight: "8rem",
            }}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`
              px-3 sm:px-6 py-2 rounded-lg text-white text-sm sm:text-base font-medium
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                isLoading || !input.trim()
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }
            `}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
