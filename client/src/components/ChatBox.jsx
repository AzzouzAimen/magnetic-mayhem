import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ socket, isDrawer }) => {
  const [guess, setGuess] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleChatMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    // No longer need handleRoundEnd, as the server sends a system message
    socket.on('chat:message', handleChatMessage);
    return () => socket.off('chat:message', handleChatMessage);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleRoundStart = () => setMessages([]);
    socket.on('round:start', handleRoundStart);
    return () => socket.off('round:start', handleRoundStart);
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (guess.trim() && !isDrawer) {
      socket.emit("game:guess", guess);
      setGuess("");
    }
  };

  return (
    <div className="relative w-68" style={{ height: '75vh' }}>
      {/* Gradient border glow */}
      <div className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-emerald-300/70 via-green-500/60 to-emerald-700/60 opacity-70 blur-[1px]"></div>

      {/* Glass container */}
      <div className="relative h-full min-h-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.30)] p-3 flex flex-col overflow-hidden">
        {/* Header */}
        <h2 className="text-center text-emerald-100 font-normal text-sm mb-2 tracking-wide">
          Chat
        </h2>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto mb-2 pr-1 space-y-1">
          {messages.map((msg, index) => {
            if (msg.type === 'system') {
              return (
                <p key={index} className="text-center text-[12px] italic text-emerald-100/90 bg-white/10 border border-white/15 px-2 py-1 rounded">
                  {msg.text}
                </p>
              );
            }
            // The old 'announcement' type is replaced by the 'system' type
            return (
              <p key={index} className="text-[13px] text-white/90">
                <span className="text-emerald-200 font-medium">{msg.name}: </span>
                <span className="align-middle">{msg.message}</span>
              </p>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex flex-col gap-1">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={isDrawer ? "You are drawing..." : "Type your guess..."}
            disabled={isDrawer}
            className="w-full px-2 py-1 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400/40 disabled:opacity-60 text-sm"
          />
          <button
            type="submit"
            disabled={isDrawer || !guess.trim()}
            className="w-full h-8 rounded-md bg-emerald-500/90 hover:bg-emerald-400 active:bg-emerald-500 text-white text-sm font-semibold tracking-wide transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.25)]"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;