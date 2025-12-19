import React, { useState } from "react";

function formatTimeAgo(iso) {
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hr${diffH === 1 ? "" : "s"} ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export default function InboxScreen({ items, matches = [], isPremium = false, onOpenPayment, onOpenChat, onSendMessageRequest }) {
  const [activeTab, setActiveTab] = useState("matches");
  const [sentRequests, setSentRequests] = useState(new Set());

  return (
    <div className="inbox-list scroll-fade">
      <div className="inbox-header">
        <div>
          <div className="inbox-title">Your Inbox</div>
          <div className="inbox-count">
            {matches.length} matches · {items.length} likes received
          </div>
        </div>
        {isPremium ? (
          <div className="badge premium-badge">✨ Premium</div>
        ) : (
          <button className="subscribe-btn" onClick={onOpenPayment}>
            <span className="subscribe-icon">👑</span>
            Unlock
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="inbox-info-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="info-icon">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <div className="info-text">
          <strong>Vibes and matches expire in 24 hours.</strong> Message or send message requests to people you want to connect with before they disappear. New ones arrive tomorrow!
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="vibes-tabs">
        <button 
          className={`vibes-tab ${activeTab === "matches" ? "active" : ""}`}
          onClick={() => setActiveTab("matches")}
        >
          <span className="vibes-tab-icon">💫</span>
          <span>Matches</span>
          {matches.length > 0 && (
            <span className="vibes-tab-count">{matches.length}</span>
          )}
        </button>
        <button 
          className={`vibes-tab ${activeTab === "vibes" ? "active" : ""}`}
          onClick={() => setActiveTab("vibes")}
        >
          <span className="vibes-tab-icon">💚</span>
          <span>Likes</span>
          {items.length > 0 && (
            <span className="vibes-tab-count">{items.length}</span>
          )}
        </button>
      </div>

      <div className="inbox-items">
        {/* Matches Tab */}
        {activeTab === "matches" && (
          <>
            {matches.length > 0 ? (
              matches.map((match) => (
                <div key={match.id} className="inbox-item match-item">
                  {isPremium ? (
                    match.otherUser?.imageUrl ? (
                      <img 
                        src={match.otherUser.imageUrl} 
                        alt={match.otherUser.name} 
                        className="inbox-avatar-img match-avatar"
                      />
                    ) : (
                      <div className="match-icon-wrapper">
                        <span className="match-icon">💫</span>
                      </div>
                    )
                  ) : (
                    <div className="hidden-avatar">
                      <span>?</span>
                    </div>
                  )}
                  <div className="inbox-body">
                    <div className="inbox-line match-line">
                      <span className="match-text">It&apos;s a match!</span>
                      {isPremium ? (
                        <>
                          You and <strong>{match.otherUser?.name ?? "Someone"}</strong> both chose{" "}
                        </>
                      ) : (
                        <>You matched with <strong>someone</strong> on </>
                      )}
                      <span className="adj match-adj">
                        {match.adjective.toLowerCase()}
                      </span>
                    </div>
                    <div className="inbox-meta">
                      {isPremium && match.otherUser
                        ? `${match.otherUser.college} · ${match.otherUser.year} · `
                        : ""}
                      {formatTimeAgo(match.createdAt)}
                    </div>
                  </div>
                  {isPremium && match.otherUser && (
                    <button
                      className="inbox-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat?.(match.otherUser);
                      }}
                      title="Message"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inbox-chat-icon">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ marginTop: 8 }}>
                <span>💫</span>
                <span>No matches yet</span>
                <span style={{ fontSize: "0.8rem" }}>
                  When you and someone pick the same vibe, you&apos;ll match!
                </span>
              </div>
            )}
          </>
        )}

        {/* Likes Tab */}
        {activeTab === "vibes" && (
          <>
            {items.length > 0 ? (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className={`inbox-item inbox-item-clickable ${sentRequests.has(item.fromUser?.id) ? 'request-sent' : ''}`}
                  onClick={() => {
                    if (isPremium && item.fromUser && !sentRequests.has(item.fromUser.id) && onSendMessageRequest) {
                      onSendMessageRequest(item.fromUser, item.adjective);
                      setSentRequests(prev => new Set([...prev, item.fromUser.id]));
                    }
                  }}
                >
                  {isPremium ? (
                    item.fromUser?.imageUrl ? (
                      <img 
                        src={item.fromUser.imageUrl} 
                        alt={item.fromUser.name} 
                        className="inbox-avatar-img"
                      />
                    ) : (
                      <div className="inbox-avatar">
                        {item.fromUser?.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )
                  ) : (
                    <div className="hidden-avatar">
                      <span>?</span>
                    </div>
                  )}
                  <div className="inbox-body">
                    <div className="inbox-line">
                      {isPremium ? (
                        <strong>{item.fromUser?.name ?? "Someone"}</strong>
                      ) : (
                        <strong>Someone</strong>
                      )}{" "}
                      thinks you&apos;re{" "}
                      <span className="adj">
                        {item.adjective.toLowerCase()}
                      </span>
                      .
                    </div>
                    <div className="inbox-meta">
                      {isPremium && item.fromUser
                        ? `${item.fromUser.college} · ${item.fromUser.year} · `
                        : ""}
                      {formatTimeAgo(item.createdAt)}
                    </div>
                  </div>
                  {isPremium && item.fromUser && (
                    <button
                      className={`inbox-chat-btn inbox-request-btn ${sentRequests.has(item.fromUser.id) ? 'request-sent-btn' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!sentRequests.has(item.fromUser.id) && onSendMessageRequest) {
                          onSendMessageRequest(item.fromUser, item.adjective);
                          setSentRequests(prev => new Set([...prev, item.fromUser.id]));
                        }
                      }}
                      title={sentRequests.has(item.fromUser.id) ? "Request sent" : "Send message request"}
                      disabled={sentRequests.has(item.fromUser.id)}
                    >
                      {sentRequests.has(item.fromUser.id) ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inbox-chat-icon">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inbox-chat-icon">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ marginTop: 8 }}>
                <span>✨</span>
                <span>No likes yet</span>
                <span style={{ fontSize: "0.8rem" }}>
                  Start exploring profiles — likes will appear here.
                </span>
              </div>
            )}
          </>
        )}

        {/* Subscription CTA */}
        {!isPremium && ((activeTab === "matches" && matches.length > 0) || (activeTab === "vibes" && items.length > 0)) && (
          <div className="subscription-cta">
            <span className="cta-icon">🔒</span>
            <span className="cta-text">
              Want to see who&apos;s vibing with you?
            </span>
            <button className="cta-btn" onClick={onOpenPayment}>
              Unlock Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
