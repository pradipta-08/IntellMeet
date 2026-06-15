import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

const Lobby = () => {

  const navigate = useNavigate();

  const [meetingId, setMeetingId] =
    useState("");

  return (

    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">

      <div className="bg-[#1e293b] p-10 rounded-3xl w-[450px]">

        <h1 className="text-3xl text-white mb-8 text-center">

          Join Meeting

        </h1>

        <input
          type="text"

          placeholder="Enter Meeting ID"

          value={meetingId}

          onChange={(e) =>
            setMeetingId(e.target.value)
          }

          className="w-full p-4 rounded-xl bg-[#0f172a] text-white border border-slate-700"
        />

        <button
          onClick={() =>
            navigate(`/meeting/${meetingId}`)
          }

          className="w-full mt-6 bg-blue-600 py-4 rounded-xl text-white font-bold"
        >
          Join Now
        </button>

      </div>

    </div>
  );
};

export default Lobby;