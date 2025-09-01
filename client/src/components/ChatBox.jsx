// src/components/ChatBox.jsx

import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ socket, isDrawer }) => {
  const [guess, setGuess] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // Ref to auto-scroll

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "chat", ...message },
      ]);
    };

    const handleRoundEnd = ({ guesserName, correctWord }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "announcement",
          text: `${guesserName} guessed the word: ${correctWord}!`,
        },
      ]);
    };

    socket.on("chat:message", handleChatMessage);
    socket.on("round:end", handleRoundEnd);

    return () => {
      socket.off("chat:message", handleChatMessage);
      socket.off("round:end", handleRoundEnd);
    };
  }, [socket]);

  // Clear messages for a new round (we'll listen for round:start)
  useEffect(() => {
    if (!socket) return;
    const handleRoundStart = () => setMessages([]);
    socket.on("round:start", handleRoundStart);
    return () => socket.off("round:start", handleRoundStart);
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    if (guess.trim() && !isDrawer) {
      socket.emit("game:guess", guess);
      setGuess(""); // Clear the input box
    }
  };

  return (
    <div className="w-full h-96 bg-gray-700 p-4 rounded-lg flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {messages.map((msg, index) =>
          msg.type === "announcement" ? (
            <p
              key={index}
              className="my-2 text-center font-bold text-green-400"
            >
              {msg.text}
            </p>
          ) : (
            <p key={index} className="my-1">
              <span className="font-semibold">{msg.name}: </span>
              <span>{msg.message}</span>
            </p>
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder={isDrawer ? "You're the drawer!" : "Type your guess..."}
          disabled={isDrawer} // Disable the input for the drawer
          className="w-full p-2 bg-gray-600 rounded-lg text-white disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
      </form>
    </div>
  );
};

export default ChatBox;
