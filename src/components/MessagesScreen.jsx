import React, { useState } from "react";

function formatTimeAgo(iso) {
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export default function MessagesScreen({
  conversations,
  requests,
  currentUserId,
  onOpenChat,
  onAcceptRequest,
  onDeclineRequest
}) {
  const [activeTab, setActiveTab] = useState("general");

  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <div className="messages-screen">
      <div className="messages-header">
        <h1 className="messages-title">Messages</h1>
        <p className="messages-subtitle">
          {conversations.length} conversations · {pendingRequests.length} requests
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="messages-tabs">
        <button
          className={`messages-tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <span className="messages-tab-icon">💬</span>
          <span>General</span>
          {conversations.length > 0 && (
            <span className="messages-tab-count">{conversations.length}</span>
          )}
        </button>
        <button
          className={`messages-tab ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <span className="messages-tab-icon">📩</span>
          <span>Requests</span>
          {pendingRequests.length > 0 && (
            <span className="messages-tab-count requests-count">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      <div className="messages-list">
        {/* General Tab - Conversations */}
        {activeTab === "general" && (
          <>
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="message-item"
                  onClick={() => onOpenChat(conv.otherUser)}
                >
                  {conv.otherUser?.imageUrl ? (
                    <img
                      src={conv.otherUser.imageUrl}
                      alt={conv.otherUser.name}
                      className="message-avatar-img"
                    />
                  ) : (
                    <div className="message-avatar">
                      {conv.otherUser?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="message-body">
                    <div className="message-name-row">
                      <span className="message-name">{conv.otherUser?.name}</span>
                      <span className="message-time">{formatTimeAgo(conv.lastMessageAt || conv.createdAt)}</span>
                    </div>
                    <div className="message-preview">
                      {conv.lastMessage || `Matched on "${conv.adjective}"`}
                    </div>
                  </div>
                  <div className="message-arrow">›</div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>💬</span>
                <span>No conversations yet</span>
                <span className="empty-hint">
                  Match with someone to start chatting!
                </span>
              </div>
            )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <>
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <div key={req.id} className="request-item">
                  {req.fromUser?.imageUrl ? (
                    <img
                      src={req.fromUser.imageUrl}
                      alt={req.fromUser.name}
                      className="message-avatar-img"
                    />
                  ) : (
                    <div className="message-avatar">
                      {req.fromUser?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="request-body">
                    <div className="request-info">
                      <span className="request-name">{req.fromUser?.name}</span>
                      <span className="request-context">
                        wants to message you
                      </span>
                      <span className="request-vibe">
                        They think you're <span className="adj">{req.adjective}</span>
                      </span>
                    </div>
                    <div className="request-actions">
                      <button
                        className="request-btn accept"
                        onClick={() => onAcceptRequest(req.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="request-btn decline"
                        onClick={() => onDeclineRequest(req.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>📩</span>
                <span>No message requests</span>
                <span className="empty-hint">
                  When someone wants to message you, it'll appear here.
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

