import React, { useState, useEffect } from "react";

export default function DiscoverScreen({
  profile,
  adjectives,
  onSelectAdjective,
  onSkip,
  matchesCount = 0,
  vibesSentToday = 0,
  isPremium = false,
  canSendVibe: canSendVibeProp = true
}) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);
  
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

  // Check both premium/daily limit AND profile image requirement
  const hasImage = Boolean(canSendVibeProp);
  const canSendVibe = hasImage && (isPremium || vibesSentToday < 10);
  const remainingVibes = isPremium ? '∞' : Math.max(0, 10 - vibesSentToday);

  // Show note popup when profile changes and has a note
  useEffect(() => {
    if (profile.note && profile.note.trim() !== '') {
      setShowNotePopup(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setShowNotePopup(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowNotePopup(false);
    }
  }, [profile.id, profile.note]);

  return (
    <div className={`profile-card ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
      {/* Note Popup - shows from top when profile has a note */}
      {showNotePopup && profile.note && profile.note.trim() !== '' && (
        <div className="note-popup" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.82)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '12px',
          border: '1px solid #00ff88',
          maxWidth: 'calc(100vw - 40px)',
          width: 'calc(min(395px, 100vw) - 40px)',
          zIndex: 10000,
          animation: 'slideDown 0.3s ease-out',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          {profile.note}
        </div>
      )}
      <div className="profile-image-wrapper">
        {/* Daily Limit Banner - always show with per-user vibe count */}
        <div className="vibes-limit-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="limit-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div className="limit-text">
            <strong>
              {isPremium ? 'Unlimited vibes' : `${remainingVibes} vibes left today.`}
            </strong>{" "}
            {isPremium
              ? 'Enjoy unlimited vibes.'
              : 'Get premium to skip profiles.'}
          </div>
        </div>
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="profile-image"
        />

        <div className="profile-meta">
          <div className="profile-name-row">
            <div className="profile-name">
              {profile.name} {profile.age && <span className="profile-age">({profile.age})</span>}
            </div>
            <div className="profile-year-pill">
              <span className="label">Matches</span>
              <span className="value">{matchesCount}</span>
            </div>
          </div>

          {/* Premium Skip Button - always visible, only functional for premium users */}
          <div className="profile-skip-wrapper">
            <button
              className="profile-skip-button"
              onClick={() => {
                if (isPremium) {
                  onSkip?.();
                }
              }}
              disabled={!isPremium}
              title={isPremium ? "Skip this profile" : "Premium required to skip"}
            >
              Skip
            </button>
          </div>

          <div className="profile-role">{roleLine}</div>
          <div className="profile-college-line">
            {profile.college} · {profile.year}
          </div>
        </div>
      </div>

      <div className="adjective-section">
        <div className="adjective-grid">
          {adjectives && adjectives.length > 0 ? (
            adjectives.map((adj) => (
              <button
                key={adj}
                className={`adjective-button ${!canSendVibe ? 'disabled' : ''}`}
                onClick={() => handleAdjectiveClick(adj)}
                disabled={!canSendVibe}
              >
                <span>{adj}</span>
              </button>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
              <span>No adjectives available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


