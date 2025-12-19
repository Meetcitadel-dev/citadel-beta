import React, { useState } from "react";

export default function DiscoverScreen({
  profile,
  adjectives,
  onSelectAdjective,
  matchesCount = 0,
  vibesSentToday = 0,
  isPremium = false
}) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const roleLine =
    profile.skills && profile.skills.length > 0
      ? `${profile.skills.join(", ")}`
      : "Student";

  const handleAdjectiveClick = (adj) => {
    if (isFadingOut || !canSendVibe) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onSelectAdjective(adj);
      setIsFadingOut(false);
    }, 350);
  };

  const canSendVibe = isPremium || vibesSentToday < 10;
  const remainingVibes = isPremium ? '∞' : Math.max(0, 10 - vibesSentToday);

  return (
    <div className={`profile-card ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
      <div className="profile-image-wrapper">
        {/* Daily Limit Banner */}
        {!isPremium && (
          <div className="vibes-limit-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="limit-icon">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div className="limit-text">
              <strong>{remainingVibes} vibes left today.</strong> {vibesSentToday >= 10 ? 'Upgrade to Premium for unlimited vibes!' : 'You can send 10 vibes per day.'}
            </div>
          </div>
        )}
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="profile-image"
        />

        <div className="profile-meta">
          <div className="profile-name-row">
            <div className="profile-name">{profile.name} {profile.age && <span className="profile-age">({profile.age})</span>}</div>
            <div className="profile-year-pill">
              <span className="label">Matches</span>
              <span className="value">{matchesCount}</span>
            </div>
          </div>

          <div className="profile-role">{roleLine}</div>
          <div className="profile-college-line">
            {profile.college} · {profile.year}
          </div>
        </div>
      </div>

      <div className="adjective-section">
        <div className="adjective-grid">
          {adjectives.map((adj) => (
            <button
              key={adj}
              className={`adjective-button ${!canSendVibe ? 'disabled' : ''}`}
              onClick={() => handleAdjectiveClick(adj)}
              disabled={!canSendVibe}
            >
              <span>{adj}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


