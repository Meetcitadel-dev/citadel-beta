import React, { useMemo, useState, useEffect, useCallback } from "react";
import { USERS as DEFAULT_USERS } from "./data/users.js";
import { generateAdjectives } from "./data/adjectives.js";
import db from "./data/db.js";
import AuthScreen from "./components/AuthScreen.jsx";
import DiscoverScreen from "./components/DiscoverScreen.jsx";
import InboxScreen from "./components/InboxScreen.jsx";
import AccountSwitcherScreen from "./components/AccountSwitcherScreen.jsx";
import ProfileScreen from "./components/ProfileScreen.jsx";
import PaymentModal from "./components/PaymentModal.jsx";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Initialize database and load data on mount
  useEffect(() => {
    db.init(DEFAULT_USERS);
    setUsers(db.users.getAll());
    setNotifications(db.notifications.getAll());
    setMatches(db.matches.getAll());
    
    // Check if user is already authenticated
    const authUser = localStorage.getItem('citadel_auth_user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        setLoggedInUserId(parsed.id);
        setIsAuthenticated(true);
        // Load premium status
        const premiumData = localStorage.getItem('citadel_is_premium');
        if (premiumData) {
          const premiumParsed = JSON.parse(premiumData);
          if (typeof premiumParsed === 'object' && premiumParsed !== null) {
            setIsPremium(premiumParsed[parsed.id] === true);
          }
        }
      } catch (e) {
        // Invalid auth data
        localStorage.removeItem('citadel_auth_user');
      }
    }
    setIsLoaded(true);
  }, []);

  // Handle authentication success
  const handleAuthSuccess = useCallback((user, isNewUser) => {
    let userId;
    
    if (isNewUser) {
      // Create new user in database
      const newUser = db.users.create(user);
      userId = newUser.id;
      setUsers(db.users.getAll());
    } else {
      userId = user.id;
    }
    
    // Save auth state
    const authUser = db.users.getById(userId);
    localStorage.setItem('citadel_auth_user', JSON.stringify(authUser));
    db.session.setCurrentUserId(userId);
    
    setLoggedInUserId(userId);
    setIsAuthenticated(true);
    setCurrentIndex(0);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('citadel_auth_user');
    setIsAuthenticated(false);
    setLoggedInUserId(null);
    setIsPremium(false);
  }, []);

  // Update premium status when user changes
  useEffect(() => {
    if (isLoaded) {
      try {
        const stored = localStorage.getItem('citadel_is_premium');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed === 'object' && parsed !== null) {
            setIsPremium(parsed[loggedInUserId] === true);
          } else {
            setIsPremium(false);
          }
        } else {
          setIsPremium(false);
        }
      } catch (e) {
        setIsPremium(false);
      }
    }
  }, [loggedInUserId, isLoaded]);

  const handleOpenPayment = useCallback(() => {
    setShowPaymentModal(true);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    let premiumUsers = {};
    try {
      const stored = localStorage.getItem('citadel_is_premium');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle legacy format (was boolean string) vs new format (object)
        if (typeof parsed === 'object' && parsed !== null) {
          premiumUsers = parsed;
        }
      }
    } catch (e) {
      // Invalid JSON, start fresh
    }
    premiumUsers[loggedInUserId] = true;
    localStorage.setItem('citadel_is_premium', JSON.stringify(premiumUsers));
    setIsPremium(true);
    setShowPaymentModal(false);
  }, [loggedInUserId]);

  // Save notifications to database when they change
  useEffect(() => {
    if (isLoaded && notifications.length > 0) {
      // Sync entire notifications array to localStorage
      localStorage.setItem('citadel_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  // Save matches to database when they change
  useEffect(() => {
    if (isLoaded && matches.length > 0) {
      localStorage.setItem('citadel_matches', JSON.stringify(matches));
    }
  }, [matches, isLoaded]);

  // Save current user ID when it changes
  useEffect(() => {
    if (isLoaded) {
      db.session.setCurrentUserId(loggedInUserId);
    }
  }, [loggedInUserId, isLoaded]);

  const loggedInUser = useMemo(
    () => users.find((u) => u.id === loggedInUserId) ?? users[0],
    [users, loggedInUserId]
  );

  // Handle profile updates
  const handleProfileUpdate = useCallback((updatedUser) => {
    const updated = db.users.update(updatedUser.id, updatedUser);
    if (updated) {
      setUsers(db.users.getAll());
    }
  }, []);

  // Get IDs of users who matched with the logged-in user (never show again)
  const matchedUserIds = useMemo(() => {
    const ids = new Set();
    if (!loggedInUser) return ids;
    matches.forEach((m) => {
      if (m.user1Id === loggedInUser.id) {
        ids.add(m.user2Id);
      } else if (m.user2Id === loggedInUser.id) {
        ids.add(m.user1Id);
      }
    });
    return ids;
  }, [matches, loggedInUser]);

  // Track users that logged-in user has sent adjectives to (with timestamp for ordering)
  const sentAdjectivesMap = useMemo(() => {
    const map = new Map(); // userId -> most recent timestamp
    if (!loggedInUser) return map;
    notifications.forEach((n) => {
      if (n.fromUserId === loggedInUser.id) {
        const existing = map.get(n.toUserId);
        if (!existing || n.createdAt > existing) {
          map.set(n.toUserId, n.createdAt);
        }
      }
    });
    return map;
  }, [notifications, loggedInUser]);

  const visibleUsers = useMemo(() => {
    if (!loggedInUser) return [];
    // Filter out: self and matched users
    const filtered = users.filter(
      (u) => u.id !== loggedInUser.id && !matchedUserIds.has(u.id)
    );
    
    // Sort: users we haven't sent adjectives to come first,
    // then users we sent adjectives to (oldest first, so recent ones are at the back)
    return filtered.sort((a, b) => {
      const aTime = sentAdjectivesMap.get(a.id);
      const bTime = sentAdjectivesMap.get(b.id);
      
      // If neither has been sent an adjective, keep original order
      if (!aTime && !bTime) return 0;
      // If only a has been sent, b comes first
      if (aTime && !bTime) return 1;
      // If only b has been sent, a comes first
      if (!aTime && bTime) return -1;
      // If both have been sent, older one comes first (recent ones at back)
      return aTime.localeCompare(bTime);
    });
  }, [users, loggedInUser, matchedUserIds, sentAdjectivesMap]);

  const currentProfile = visibleUsers[currentIndex] ?? null;

  // Check if the current profile has sent an adjective to the logged-in user
  const adjectiveFromProfile = useMemo(() => {
    if (!currentProfile || !loggedInUser) return null;
    // Find the most recent adjective sent FROM the profile TO the logged-in user
    const sent = notifications.find(
      (n) => n.fromUserId === currentProfile.id && n.toUserId === loggedInUser.id
    );
    return sent?.adjective ?? null;
  }, [notifications, currentProfile, loggedInUser]);

  const adjectives = useMemo(() => {
    if (!currentProfile || !loggedInUser) return [];
    // If the profile sent an adjective, include it in the options
    return generateAdjectives(loggedInUser.gender, currentProfile.gender, adjectiveFromProfile);
  }, [loggedInUser, currentProfile, adjectiveFromProfile]);

  const handleNextProfile = () => {
    if (visibleUsers.length === 0) return;
    // Move to next, but wrap around if at end
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= visibleUsers.length ? 0 : next;
    });
  };

  const handleAdjectiveSelect = (adjective) => {
    if (!currentProfile) return;
    
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fromUserId: loggedInUser.id,
      toUserId: currentProfile.id,
      adjective,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [entry, ...prev]);

    // Check for match: if they chose the same adjective for each other
    if (adjectiveFromProfile && adjective === adjectiveFromProfile) {
      // It's a match!
      const matchEntry = {
        id: `match-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        user1Id: loggedInUser.id,
        user2Id: currentProfile.id,
        adjective,
        createdAt: new Date().toISOString()
      };
      setMatches((prev) => [matchEntry, ...prev]);
    }
    
    // After sending adjective, reset to index 0 since the list will re-sort
    // The profile we just rated will move to the back of the sorted list
    setCurrentIndex(0);
  };

  const inboxItems = useMemo(
    () => {
      if (!loggedInUser) return [];
      return notifications
        .filter((n) => {
          // Only show vibes sent TO the logged-in user
          if (n.toUserId !== loggedInUser.id) return false;
          // Exclude vibes from users who are already matched
          if (matchedUserIds.has(n.fromUserId)) return false;
          return true;
        })
        .map((n) => {
          const from = users.find((u) => u.id === n.fromUserId);
          return {
            ...n,
            fromUser: from
          };
        });
    },
    [notifications, loggedInUser, matchedUserIds, users]
  );

  // Get matches involving the logged-in user
  const matchItems = useMemo(
    () => {
      if (!loggedInUser) return [];
      return matches
        .filter((m) => m.user1Id === loggedInUser.id || m.user2Id === loggedInUser.id)
        .map((m) => {
          const otherUserId = m.user1Id === loggedInUser.id ? m.user2Id : m.user1Id;
          const otherUser = users.find((u) => u.id === otherUserId);
          return {
            ...m,
            otherUser
          };
        });
    },
    [matches, loggedInUser, users]
  );

  // Get matches count for the current profile being viewed
  const currentProfileMatchesCount = useMemo(() => {
    if (!currentProfile) return 0;
    return matches.filter(
      (m) => m.user1Id === currentProfile.id || m.user2Id === currentProfile.id
    ).length;
  }, [matches, currentProfile]);

  const handleSwitchAccount = (userId) => {
    setLoggedInUserId(userId);
    setCurrentIndex(0);
  };

  // Show loading state while database initializes
  if (!isLoaded) {
    return (
      <div className="app-shell">
        <div className="empty-state">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        existingUsers={users}
      />
    );
  }

  // Make sure we have a logged in user
  if (!loggedInUser) {
    return (
      <div className="app-shell">
        <div className="empty-state">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "discover" ? "active" : ""}`.trim()}
          onClick={() => setActiveTab("discover")}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          <span className="nav-label">Explore</span>
        </button>
        <button
          className={`nav-tab ${activeTab === "inbox" ? "active" : ""}`.trim()}
          onClick={() => setActiveTab("inbox")}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span className="nav-label">Inbox</span>
        </button>
        <button
          className={`nav-tab ${activeTab === "profile" ? "active" : ""}`.trim()}
          onClick={() => setActiveTab("profile")}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="nav-label">Profile</span>
        </button>
        <button
          className={`nav-tab ${activeTab === "accounts" ? "active" : ""}`.trim()}
          onClick={() => setActiveTab("accounts")}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="nav-label">Switch</span>
        </button>
      </nav>

      <main className="app-content">
        <div className="screen">
          {activeTab === "discover" && (
            <>
              {currentProfile ? (
                <DiscoverScreen
                  profile={currentProfile}
                  adjectives={adjectives}
                  onSelectAdjective={handleAdjectiveSelect}
                  matchesCount={currentProfileMatchesCount}
                />
              ) : (
                <div className="empty-state">
                  <div>No more profiles</div>
                  <div style={{ fontSize: "0.8rem" }}>
                    Take a breather — new profiles will appear soon.
                  </div>
                </div>
              )}
            </>
          )}
          {activeTab === "inbox" && (
            <InboxScreen
              items={inboxItems}
              matches={matchItems}
              currentUserId={loggedInUserId}
              isPremium={isPremium}
              onOpenPayment={handleOpenPayment}
            />
          )}
          {activeTab === "profile" && loggedInUser && (
            <ProfileScreen
              user={loggedInUser}
              onUpdate={handleProfileUpdate}
              onLogout={handleLogout}
            />
          )}
          {activeTab === "accounts" && (
            <AccountSwitcherScreen
              currentUserId={loggedInUser.id}
              onSwitch={handleSwitchAccount}
              users={users}
            />
          )}
        </div>
      </main>

      {/* Payment Modal - rendered at app level to avoid z-index issues */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
