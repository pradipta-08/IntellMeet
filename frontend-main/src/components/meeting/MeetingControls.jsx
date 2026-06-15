import React, { useState } from "react";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  Circle,
} from "lucide-react";

const MeetingControls = () => {

  const [micOn, setMicOn] =
    useState(true);

  const [cameraOn, setCameraOn] =
    useState(true);

  const [recording, setRecording] =
    useState(false);

  return (

    <div className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-slate-800 p-4 flex items-center justify-center gap-4">

      {/* MIC BUTTON */}
      <button
        onClick={() =>
          setMicOn(!micOn)
        }
        className={`p-4 rounded-full transition ${
          micOn
            ? "bg-slate-700 hover:bg-slate-600"
            : "bg-red-600 hover:bg-red-500"
        }`}
      >
        {micOn ? (
          <Mic className="text-white" />
        ) : (
          <MicOff className="text-white" />
        )}
      </button>


      {/* CAMERA BUTTON */}
      <button
        onClick={() =>
          setCameraOn(!cameraOn)
        }
        className={`p-4 rounded-full transition ${
          cameraOn
            ? "bg-slate-700 hover:bg-slate-600"
            : "bg-red-600 hover:bg-red-500"
        }`}
      >
        {cameraOn ? (
          <Video className="text-white" />
        ) : (
          <VideoOff className="text-white" />
        )}
      </button>


      {/* SCREEN SHARE */}
      <button
        className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition"
      >
        <MonitorUp className="text-white" />
      </button>


      {/* RECORD BUTTON */}
      <button
        onClick={() =>
          setRecording(!recording)
        }
        className={`p-4 rounded-full transition ${
          recording
            ? "bg-red-600"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
      >
        <Circle className="text-white" />
      </button>


      {/* LEAVE BUTTON */}
      <button
        className="p-4 rounded-full bg-red-600 hover:bg-red-500 transition"
      >
        <PhoneOff className="text-white" />
      </button>

    </div>
  );
};

export default MeetingControls;