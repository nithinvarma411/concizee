import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCrown, FaComments, FaRocket, FaUsers } from 'react-icons/fa';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(";").map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith("token="));
      if (tokenCookie) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    const fetchMode = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}api/v1/get-mode`, { 
          withCredentials: true 
        });
        setIsDarkMode(res.data.mode === 'dark');
      } catch (error) {
        console.error("Error fetching mode:", error);
      }
    };

    checkAuth();
    fetchMode();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <FaCrown className="text-yellow-400 text-3xl sm:text-4xl lg:text-5xl animate-pulse" />
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 font-bold tracking-wider">
              CONCIZEE
            </h1>
          </div>

          {/* Subtitle */}
          <p className={`
            text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed
            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            Your intelligent AI companion for meaningful conversations and instant assistance
          </p>

          {/* Authentication-based Content */}
          {isAuthenticated ? (
            <div className="space-y-8">
              <div className={`
                text-base sm:text-lg lg:text-xl mb-8 max-w-xl mx-auto
                ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              `}>
                Welcome back! Ready to continue your conversations?
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-4xl mx-auto">
                {[
                  {
                    icon: FaComments,
                    title: "Smart Conversations",
                    description: "Engage in intelligent discussions with advanced AI"
                  },
                  {
                    icon: FaRocket,
                    title: "Lightning Fast",
                    description: "Get instant responses to all your queries"
                  },
                  {
                    icon: FaUsers,
                    title: "Personalized",
                    description: "Tailored responses based on your preferences"
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`
                      p-6 sm:p-8 rounded-xl text-center transition-all duration-300
                      hover:transform hover:scale-105
                      ${isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <feature.icon className={`
                      text-3xl sm:text-4xl mx-auto mb-4
                      ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}
                    `} />
                    <h3 className={`
                      text-lg sm:text-xl font-semibold mb-2
                      ${isDarkMode ? 'text-white' : 'text-gray-900'}
                    `}>
                      {feature.title}
                    </h3>
                    <p className={`
                      text-sm sm:text-base
                      ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                    `}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className={`
                text-base sm:text-lg lg:text-xl mb-8 max-w-xl mx-auto
                ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              `}>
                Sign in to unlock the power of AI-driven conversations
              </div>

              {/* Login Prompt */}
              <div className={`
                p-6 sm:p-8 rounded-xl max-w-md mx-auto
                ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}
              `}>
                <h3 className={`
                  text-xl sm:text-2xl font-semibold mb-4 text-center
                  ${isDarkMode ? 'text-white' : 'text-gray-900'}
                `}>
                  Get Started
                </h3>
                <p className={`
                  text-center mb-6 text-sm sm:text-base
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  Please login to access your personalized AI chat experience
                </p>
                
                {/* Login instructions */}
                <div className={`
                  text-center text-xs sm:text-sm
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  Use the sidebar to sign in with Google
                </div>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-4xl mx-auto">
                {[
                  {
                    icon: FaComments,
                    title: "AI Conversations",
                    description: "Chat with advanced AI for help, learning, and creativity"
                  },
                  {
                    icon: FaRocket,
                    title: "Instant Responses",
                    description: "Get immediate, intelligent answers to your questions"
                  },
                  {
                    icon: FaUsers,
                    title: "Personal Assistant",
                    description: "Your AI companion for daily tasks and problem-solving"
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`
                      p-6 sm:p-8 rounded-xl text-center transition-all duration-300
                      hover:transform hover:scale-105 opacity-75 hover:opacity-100
                      ${isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <feature.icon className={`
                      text-3xl sm:text-4xl mx-auto mb-4
                      ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}
                    `} />
                    <h3 className={`
                      text-lg sm:text-xl font-semibold mb-2
                      ${isDarkMode ? 'text-white' : 'text-gray-900'}
                    `}>
                      {feature.title}
                    </h3>
                    <p className={`
                      text-sm sm:text-base
                      ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                    `}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`
        border-t py-6 px-4 sm:px-6 lg:px-8
        ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
      `}>
        <div className="max-w-4xl mx-auto text-center">
          <p className={`
            text-xs sm:text-sm
            ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
          `}>
            © 2024 Concizee. Your intelligent AI conversation partner.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;