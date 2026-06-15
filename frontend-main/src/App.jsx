import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Lobby from './Lobby';
import MeetingRoom from './MeetingRoom';
import Dashboard from './Dashboard';
import ProjectBoard from './ProjectBoard';

import { socket } from './services/socket';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Frontend Socket Connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      {currentPage === 'auth' && <Auth />}
      {currentPage === 'lobby' && <Lobby />}
      {currentPage === 'meeting' && <MeetingRoom />}
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'project' && <ProjectBoard />}

      {/* Navigation Helper */}
      <div className="fixed bottom-6 right-6 flex flex-wrap gap-2 bg-white/80 p-2 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-200">

        <button
          onClick={() => setCurrentPage('auth')}
          className="bg-slate-800 text-white px-3 py-1 text-xs rounded-lg"
        >
          1. Auth
        </button>

        <button
          onClick={() => setCurrentPage('lobby')}
          className="bg-slate-800 text-white px-3 py-1 text-xs rounded-lg"
        >
          2. Lobby
        </button>

        <button
          onClick={() => setCurrentPage('meeting')}
          className="bg-slate-800 text-white px-3 py-1 text-xs rounded-lg"
        >
          3. Live Room
        </button>

        <button
          onClick={() => setCurrentPage('dashboard')}
          className="bg-slate-800 text-white px-3 py-1 text-xs rounded-lg"
        >
          4. AI Dashboard
        </button>

        <button
          onClick={() => setCurrentPage('project')}
          className="bg-slate-800 text-white px-3 py-1 text-xs rounded-lg"
        >
          5. Kanban
        </button>

      </div>
    </div>
  );
}

export default App;