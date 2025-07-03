import React, { useState } from 'react';
import fireImg from '../assets/fire.png';
import About from './About';
import Blog from './Blog';
import Contact from './Contact';

const tabs = ['About', 'Blog', 'Contact'];

export default function Desktop() {
  const [activeTab, setActiveTab] = useState('About');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative w-full h-screen bg-center bg-cover"
      style={{ backgroundImage: `url(${fireImg})` }}
    >
      {/* Base browser rectangle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-11/12 h-5/6 bg-neutral-200 rounded-lg shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          {/* Top bar with Mac-style buttons and tabs */}
          <div className="flex items-center justify-start px-4 py-2 bg-gradient-to-b from-neutral-300 to-neutral-350 border-b border-neutral-400">
            {/* Mac-style window buttons */}
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm border border-red-600" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm border border-yellow-500" />
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm border border-green-600" />
            </div>
            
            {/* Address bar area */}
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-sm text-gray-600 border border-gray-300 shadow-inner">
                https://brooklyngibbs.dev/{activeTab.toLowerCase()}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex bg-neutral-250 border-b border-neutral-400">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-medium border-r border-neutral-400 transition-all duration-200 relative ${
                  activeTab === tab
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'bg-neutral-200 text-gray-600 hover:bg-neutral-100'
                }`}
              >
                <span className="mr-2">
                  {tab === 'About' && '☀️'}
                  {tab === 'Blog' && '📝'}
                  {tab === 'Contact' && '⬆'}
                </span>
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </button>
            ))}
            <div className="flex-1 bg-neutral-200"></div>
          </div>

          {/* Browser content area */}
          <div className="flex-1 p-6 overflow-auto bg-white">
            {activeTab === 'About' && <About />}
            {activeTab === 'Blog' && <Blog />}
            {activeTab === 'Contact' && <Contact />}
          </div>
        </div>
      </div>

      {/* Mac-style dock/status bar */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-neutral-400 to-neutral-300 border-t border-neutral-500 shadow-inner flex items-center justify-between px-6">
        <div className="flex items-center space-x-4 text-sm text-gray-700">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            PondOS Desktop
          </span>
          <span>|</span>
          <span>Brooklyn's Portfolio</span>
        </div>
        <div className="text-sm text-gray-700 font-mono">
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>
    </div>
  );
}