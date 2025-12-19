import React, { useState, useRef, useEffect } from "react";

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen({
  otherUser,
  messages,
  currentUserId,
  onSendMessage,
  onBack
}) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  return (
    <div className="chat-screen">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="chat-user-info">
          {otherUser?.imageUrl ? (
            <img
              src={otherUser.imageUrl}
              alt={otherUser.name}
              className="chat-avatar-img"
            />
          ) : (
            <div className="chat-avatar">
              {otherUser?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="chat-user-details">
            <span className="chat-user-name">{otherUser?.name}</span>
            <span className="chat-user-info-text">
              {otherUser?.college} · {otherUser?.year}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chat-empty-icon">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div className="chat-empty-text">
              Say hi to {otherUser?.name}!
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.fromUserId === currentUserId ? "sent" : "received"}`}
            >
              <div className="chat-bubble-text">{msg.text}</div>
              <div className="chat-bubble-time">{formatTime(msg.createdAt)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          autoFocus
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!newMessage.trim()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

