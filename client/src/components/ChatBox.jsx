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
    <div className="w-full h-96 bg-gray-700 p-4 rounded-lg flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-2">
        {messages.map((msg, index) => {
          if (msg.type === 'system') {
            return (
              <p key={index} className="text-center text-sm italic text-yellow-300">
                {msg.text}
              </p>
            );
          }
          // The old 'announcement' type is replaced by the 'system' type
          return (
            <p key={index}>
              <span className="font-semibold">{msg.name}: </span>
              <span>{msg.message}</span>
            </p>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder={isDrawer ? "You are drawing..." : "Type your guess..."}
          disabled={isDrawer}
          className="flex-1 px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isDrawer || !guess.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;