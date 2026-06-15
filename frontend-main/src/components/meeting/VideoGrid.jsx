import React from "react";

const VideoGrid = () => {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pb-28">

      {/* LOCAL USER VIDEO */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden relative h-[300px] border border-slate-800">

        <video
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg text-white text-sm">
          You
        </div>

      </div>


      {/* SAMPLE PARTICIPANT */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden relative h-[300px] border border-slate-800">

        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl">
          Participant
        </div>

        <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg text-white text-sm">
          User 2
        </div>

      </div>

    </div>
  );
};

export default VideoGrid;