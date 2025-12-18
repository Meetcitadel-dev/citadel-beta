import React from "react";

export default function AccountSwitcherScreen({ currentUserId, onSwitch, users = [] }) {
  return (
    <div className="account-list scroll-fade">
      <div className="account-header">
        <div>
          <div className="account-title">Test login</div>
          <div className="account-subtitle">
            Tap any profile to view the app as that student.
          </div>
        </div>
        <div className="badge">Dev</div>
      </div>

      <div className="account-items">
        {users.map((u) => {
          const isActive = u.id === currentUserId;
          return (
            <button
              type="button"
              key={u.id}
              className={`account-item ${isActive ? "active" : ""}`.trim()}
              onClick={() => onSwitch(u.id)}
            >
              <div className="account-avatar">
                {u.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="account-body">
                <div className="account-line">
                  <strong>{u.name}</strong>{" "}
                  <span className="dim">
                    · {u.college} · {u.year}
                  </span>
                </div>
                <div className="account-meta">
                  {u.gender === "female" ? "She/Her" : "He/Him"} · {u.age} ·{" "}
                  {u.skills.slice(0, 2).join(" • ")}
                </div>
              </div>
              {isActive && <div className="account-pill">Current</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}


