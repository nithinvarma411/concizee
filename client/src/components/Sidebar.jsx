import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import eventEmitter from "../utils/eventEmitter";
import { FaBars, FaTimes } from "react-icons/fa";

const Sidebar = () => {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const checkAuth = () => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const tokenCookie = cookies.find((c) => c.startsWith("token="));

    if (tokenCookie) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setTitles([]);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchTitles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}api/v1/get-titles`,
        { withCredentials: true }
      );
      setTitles(res.data.titles);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        setTitles([]);
        navigate("/");
      }
      console.error("Error fetching titles:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTitles();
      eventEmitter.on("refreshTitles", fetchTitles);
      eventEmitter.on("clearTitles", () => {
        setTitles([]);
        setIsAuthenticated(false);
      });

      return () => {
        eventEmitter.off("refreshTitles", fetchTitles);
        eventEmitter.off("clearTitles");
      };
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    window.location.href = `${import.meta.env.VITE_SERVER_URL}auth/google`;
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleChatClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleStartNewChat = () => {
    setIsAddingNew(true);
    setNewTitle("");
  };

  const handleSaveNewChat = async () => {
    if (!newTitle.trim()) {
      setIsAddingNew(false);
      return;
    }

    try {
      // ✅ Call your backend API to create a new chat
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}api/v1/create-chat`,
        { title: newTitle },
        { withCredentials: true }
      );

      const newChat = res.data.chat;
      setTitles((prev) => [newChat, ...prev]); // put new chat at top
      setIsAddingNew(false);

      // redirect to new chat page if needed
      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      setIsAddingNew(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={toggleMobileMenu}
        className={`fixed top-4 left-4 z-50 p-3 rounded-lg lg:hidden ${
          isDarkMode
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
        }`}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative top-0 left-0 h-screen flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          w-64 sm:w-72 md:w-80 lg:w-64 xl:w-72
          ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}
        `}
      >
        {isAuthenticated ? (
          <>
            <div className="h-16 lg:h-0" />

            {/* New Chat Button */}
            <div className="px-3 sm:px-4">
              <button
                onClick={handleStartNewChat}
                className={`
                  w-full rounded-lg p-3 sm:p-4 flex items-center justify-center mb-4 mt-2 lg:mt-4 
                  transition-all duration-300 text-sm sm:text-base font-medium
                  ${
                    isDarkMode
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }
                `}
              >
                New Chat
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-4">
              <div className="flex flex-col gap-2">
                {/* New Chat Input Field */}
                {isAddingNew && (
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={handleSaveNewChat}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveNewChat();
                      if (e.key === "Escape") setIsAddingNew(false);
                    }}
                    autoFocus
                    className={`
                      p-3 sm:p-4 rounded-lg text-sm sm:text-base outline-none
                      ${
                        isDarkMode
                          ? "bg-gray-800 text-white border border-gray-600"
                          : "bg-white text-gray-900 border border-gray-300"
                      }
                    `}
                    placeholder="Enter chat title..."
                  />
                )}

                {/* Existing Chats */}
                {titles.map((chat) => {
                  const isActive = location.pathname === `/chat/${chat._id}`;
                  return (
                    <Link
                      key={chat._id}
                      to={`/chat/${chat._id}`}
                      className={`
                        p-3 sm:p-4 rounded-lg transition-all duration-300 text-sm sm:text-base
                        break-words hyphens-auto line-clamp-2
                        ${
                          isActive
                            ? "bg-indigo-600 text-white font-semibold"
                            : isDarkMode
                            ? "text-white hover:bg-gray-700"
                            : "text-gray-900 hover:bg-gray-200"
                        }
                      `}
                      title={chat.title}
                    >
                      {chat.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div
            className={`
              flex flex-col items-center justify-center h-full px-4 sm:px-6
              ${isDarkMode ? "text-white" : "text-gray-900"}
            `}
          >
            <div className="h-16 lg:h-0" />
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
                Welcome to Concizee
              </h2>
              <p className="text-gray-400 mb-6 text-sm sm:text-base px-2">
                Please login to start your conversation
              </p>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="
                  flex items-center justify-center gap-2 w-full sm:w-auto
                  bg-white text-gray-800 px-4 sm:px-6 py-3 rounded-lg 
                  hover:bg-gray-100 transition-colors text-sm sm:text-base
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="whitespace-nowrap">
                  {loading ? "Loading..." : "Login with Google"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
