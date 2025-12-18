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

export default function InboxScreen({ items, matches = [], isPremium = false, onOpenPayment }) {
  const [activeTab, setActiveTab] = useState("matches");

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
                <div key={item.id} className="inbox-item">
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
