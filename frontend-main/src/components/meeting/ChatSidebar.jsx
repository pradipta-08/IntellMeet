import React, { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";

const ChatSidebar = ({ messages, onSendMessage, onClose, currentUserId, embedded }) => {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  return (
    <div className={embedded ? "flex-1 flex flex-col h-full overflow-hidden" : "w-96 h-full bg-[#1e293b] border-l border-slate-700 flex flex-col shadow-2xl transition-all duration-300"}>
      {/* Header */}
      {!embedded && (
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#0f172a]/40">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Meeting Chat
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === currentUserId || msg.sender?.userId === currentUserId;
          const senderName = msg.sender?.name || "Guest";
          const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

          return (
            <div
              key={msg._id || index}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-xs text-slate-400 mb-1 px-1">
                {isMe ? "You" : senderName}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md text-sm ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-[#0f172a] text-slate-100 rounded-tl-none"
                }`}
              >
                <p className="break-words leading-relaxed">{msg.message}</p>
                <div className="text-[10px] text-right mt-1 opacity-70">
                  {time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-slate-700 bg-[#0f172a]/30 flex gap-2"
      >
        <input
          type="text"
          placeholder="Send a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white p-3 rounded-xl transition flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatSidebar;
