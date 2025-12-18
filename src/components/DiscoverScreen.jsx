import React, { useState } from "react";

export default function DiscoverScreen({
  profile,
  adjectives,
  onSelectAdjective,
  matchesCount = 0
}) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const roleLine =
    profile.skills && profile.skills.length > 0
      ? `${profile.skills.join(", ")}`
      : "Student";

  const handleAdjectiveClick = (adj) => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onSelectAdjective(adj);
      setIsFadingOut(false);
    }, 350);
  };

  return (
    <div className={`profile-card ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
      <div className="profile-image-wrapper">
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
              className="adjective-button"
              onClick={() => handleAdjectiveClick(adj)}
            >
              <span>{adj}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


