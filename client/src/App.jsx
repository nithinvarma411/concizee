import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Chat from './pages/Chat';

const App = () => {
  return (
    <BrowserRouter basename='/'>
      <div className="flex min-h-screen overflow-hidden">
        {/* Sidebar - Hidden on mobile by default, shows as overlay when toggled */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/chat/new" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;