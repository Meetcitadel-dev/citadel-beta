import React, { useMemo, useState, useEffect, useCallback } from "react";
import { USERS as DEFAULT_USERS } from "./data/users.js";
import { generateAdjectives } from "./data/adjectives.js";
import db from "./data/db.js";
import { authAPI, getToken, getCurrentUser } from "./utils/api.js";
import AuthScreen from "./components/AuthScreen.jsx";
import EmailVerificationScreen from "./components/EmailVerificationScreen.jsx";
import DiscoverScreen from "./components/DiscoverScreen.jsx";
import InboxScreen from "./components/InboxScreen.jsx";
import MessagesScreen from "./components/MessagesScreen.jsx";
import ChatScreen from "./components/ChatScreen.jsx";
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
  const [messages, setMessages] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [chatUser, setChatUser] = useState(null);

  // Initialize database and load data on mount
  useEffect(() => {
    db.init(DEFAULT_USERS);
    setUsers(db.users.getAll());
    setNotifications(db.notifications.getAll());
    setMatches(db.matches.getAll());
    setMessages(db.messages.getAll());
    setMessageRequests(db.messageRequests.getAll());
    
    // Check if user is already authenticated via JWT
    const checkAuth = async () => {
      // Check for bypass flag (URL parameter or localStorage)
      const urlParams = new URLSearchParams(window.location.search);
      const bypassParam = urlParams.get('bypass');
      const bypassStorage = localStorage.getItem('bypass_onboarding');
      const shouldBypass = bypassParam === 'true' || bypassStorage === 'true';
      
      if (shouldBypass) {
        localStorage.setItem('bypass_onboarding', 'true');
        try {
          const data = await authAPI.bypass();
          if (data && data.user) {
            setLoggedInUserId(data.user.id || data.user._id);
            setIsAuthenticated(true);
            setIsPremium(data.user.isPremium || false);
            setActiveTab('discover');
            setIsLoaded(true);
            if (bypassParam === 'true') {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            return;
          }
          throw new Error('Invalid response from bypass endpoint');
        } catch (error) {
          console.error('Bypass authentication failed:', error);
          localStorage.removeItem('bypass_onboarding');
        }
      }
      
      const token = getToken();
      const storedUser = getCurrentUser();
      
      if (token && storedUser) {
        try {
          const user = await authAPI.getMe();
          setLoggedInUserId(user.id || user._id);
          setIsAuthenticated(true);
          setIsPremium(user.isPremium || false);
        } catch (error) {
          authAPI.logout();
          localStorage.removeItem('citadel_auth_user');
          localStorage.removeItem('citadel_is_premium');
        }
      } else {
        const authUser = localStorage.getItem('citadel_auth_user');
        if (authUser) {
          try {
            const parsed = JSON.parse(authUser);
            setLoggedInUserId(parsed.id);
            setIsAuthenticated(true);
            const premiumData = localStorage.getItem('citadel_is_premium');
            if (premiumData) {
              const premiumParsed = JSON.parse(premiumData);
              if (typeof premiumParsed === 'object' && premiumParsed !== null) {
                setIsPremium(premiumParsed[parsed.id] === true);
              }
            }
          } catch (e) {
            localStorage.removeItem('citadel_auth_user');
          }
        }
      }
    setIsLoaded(true);
    };
    
    checkAuth();
  }, []);

  const handleAuthSuccess = useCallback((user, isNewUser) => {
    const userId = user.id || user._id;
    if (isNewUser) {
      db.users.create(user);
      setUsers(db.users.getAll());
    }
    localStorage.setItem('citadel_auth_user', JSON.stringify(user));
    db.session.setCurrentUserId(userId);
    setLoggedInUserId(userId);
    setIsAuthenticated(true);
    setIsPremium(user.isPremium || false);
    setCurrentIndex(0);
  }, []);

  const handleLogout = useCallback(() => {
    authAPI.logout();
    localStorage.removeItem('citadel_auth_user');
    localStorage.removeItem('citadel_is_premium');
    setIsAuthenticated(false);
    setLoggedInUserId(null);
    setIsPremium(false);
  }, []);
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
        if (typeof parsed === 'object' && parsed !== null) {
          premiumUsers = parsed;
        }
      }
    } catch (e) {}
    premiumUsers[loggedInUserId] = true;
    localStorage.setItem('citadel_is_premium', JSON.stringify(premiumUsers));
    setIsPremium(true);
    setShowPaymentModal(false);
  }, [loggedInUserId]);
  useEffect(() => {
    if (isLoaded && notifications.length > 0) {
      localStorage.setItem('citadel_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  useEffect(() => {
    if (isLoaded && matches.length > 0) {
      localStorage.setItem('citadel_matches', JSON.stringify(matches));
    }
  }, [matches, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('citadel_messages', JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('citadel_message_requests', JSON.stringify(messageRequests));
    }
  }, [messageRequests, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      db.session.setCurrentUserId(loggedInUserId);
    }
  }, [loggedInUserId, isLoaded]);

  const loggedInUser = useMemo(
    () => users.find((u) => u.id === loggedInUserId) ?? users[0],
    [users, loggedInUserId]
  );

  const handleProfileUpdate = useCallback((updatedUser) => {
    if (db.users.update(updatedUser.id, updatedUser)) {
      setUsers(db.users.getAll());
    }
  }, []);
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

  const sentAdjectivesMap = useMemo(() => {
    const map = new Map();
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
    const filtered = users.filter(
      (u) => u.id !== loggedInUser.id && !matchedUserIds.has(u.id)
    );
    return filtered.sort((a, b) => {
      const aTime = sentAdjectivesMap.get(a.id);
      const bTime = sentAdjectivesMap.get(b.id);
      if (!aTime && !bTime) return 0;
      if (aTime && !bTime) return 1;
      if (!aTime && bTime) return -1;
      return aTime.localeCompare(bTime);
    });
  }, [users, loggedInUser, matchedUserIds, sentAdjectivesMap]);

  const currentProfile = visibleUsers[currentIndex] ?? null;

  const adjectiveFromProfile = useMemo(() => {
    if (!currentProfile || !loggedInUser) return null;
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
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= visibleUsers.length ? 0 : next;
    });
  };
  const vibesSentToday = useMemo(() => {
    if (!loggedInUser) return 0;
    const today = new Date().toDateString();
    return notifications.filter(n => {
      if (n.fromUserId !== loggedInUser.id) return false;
      const notificationDate = new Date(n.createdAt).toDateString();
      return notificationDate === today;
    }).length;
  }, [notifications, loggedInUser]);

  const handleAdjectiveSelect = (adjective) => {
    if (!currentProfile || (!isPremium && vibesSentToday >= 10)) return;
    
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fromUserId: loggedInUser.id,
      toUserId: currentProfile.id,
      adjective,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [entry, ...prev]);

    if (adjectiveFromProfile && adjective === adjectiveFromProfile) {
      const matchEntry = {
        id: `match-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        user1Id: loggedInUser.id,
        user2Id: currentProfile.id,
        adjective,
        createdAt: new Date().toISOString()
      };
      setMatches((prev) => [matchEntry, ...prev]);
    }
    setCurrentIndex(0);
  };

  const inboxItems = useMemo(
    () => {
      if (!loggedInUser) return [];
      return notifications
        .filter((n) => n.toUserId === loggedInUser.id && !matchedUserIds.has(n.fromUserId))
        .map((n) => ({
          ...n,
          fromUser: users.find((u) => u.id === n.fromUserId)
        }));
    },
    [notifications, loggedInUser, matchedUserIds, users]
  );
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

  const currentProfileMatchesCount = useMemo(() => {
    if (!currentProfile) return 0;
    return matches.filter(
      (m) => m.user1Id === currentProfile.id || m.user2Id === currentProfile.id
    ).length;
  }, [matches, currentProfile]);
  const conversations = useMemo(() => {
    if (!loggedInUser) return [];
    
    const matchConvos = matchItems
      .map(m => {
        const convMessages = messages.filter(msg =>
          (msg.fromUserId === loggedInUser.id && msg.toUserId === m.otherUser?.id) ||
          (msg.fromUserId === m.otherUser?.id && msg.toUserId === loggedInUser.id)
        );
        const lastMsg = convMessages[convMessages.length - 1];
        if (!lastMsg) return null;
        return {
          ...m,
          type: 'match',
          lastMessage: lastMsg.text,
          lastMessageAt: lastMsg.createdAt
        };
      })
      .filter(Boolean);

    const acceptedRequests = messageRequests
      .filter(r => r.status === 'accepted' && (r.fromUserId === loggedInUser.id || r.toUserId === loggedInUser.id))
      .map(r => {
        const otherUserId = r.fromUserId === loggedInUser.id ? r.toUserId : r.fromUserId;
        const otherUser = users.find(u => u.id === otherUserId);
        const convMessages = messages.filter(msg =>
          (msg.fromUserId === loggedInUser.id && msg.toUserId === otherUserId) ||
          (msg.fromUserId === otherUserId && msg.toUserId === loggedInUser.id)
        );
        const lastMsg = convMessages[convMessages.length - 1];
        return {
          ...r,
          type: 'request',
          otherUser,
          lastMessage: lastMsg?.text,
          lastMessageAt: lastMsg?.createdAt
        };
      })
      .filter(r => !matchItems.find(m => m.otherUser?.id === r.otherUser?.id));

    return [...matchConvos, ...acceptedRequests].sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });
  }, [loggedInUser, matchItems, messageRequests, messages, users]);
  const pendingRequests = useMemo(() => {
    if (!loggedInUser) return [];
    return messageRequests
      .filter(r => r.toUserId === loggedInUser.id)
      .map(r => ({
        ...r,
        fromUser: users.find(u => u.id === r.fromUserId)
      }));
  }, [loggedInUser, messageRequests, users]);

  const inboxBadgeCount = inboxItems.length + matchItems.length;
  const pendingRequestCount = pendingRequests.filter(r => r.status === 'pending').length;
  const messagesBadgeCount = conversations.length + pendingRequestCount;
  const chatMessages = useMemo(() => {
    if (!chatUser || !loggedInUser) return [];
    return messages.filter(m =>
      (m.fromUserId === loggedInUser.id && m.toUserId === chatUser.id) ||
      (m.fromUserId === chatUser.id && m.toUserId === loggedInUser.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [chatUser, loggedInUser, messages]);

  const handleSwitchAccount = (userId) => {
    setLoggedInUserId(userId);
    setCurrentIndex(0);
  };

  const handleOpenChat = useCallback((user) => {
    setChatUser(user);
    setActiveTab("chat");
  }, []);

  const handleCloseChat = useCallback(() => {
    setChatUser(null);
    setActiveTab("messages");
  }, []);
  const handleSendMessage = useCallback((text) => {
    if (!chatUser || !loggedInUser) return;
    
    const isMatched = matches.some(m => 
      (m.user1Id === loggedInUser.id && m.user2Id === chatUser.id) ||
      (m.user1Id === chatUser.id && m.user2Id === loggedInUser.id)
    );
    
    const hasAcceptedRequest = messageRequests.some(r =>
      ((r.fromUserId === loggedInUser.id && r.toUserId === chatUser.id) ||
       (r.fromUserId === chatUser.id && r.toUserId === loggedInUser.id)) &&
      r.status === 'accepted'
    );
    
    if (!isMatched && !hasAcceptedRequest) return;
    
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fromUserId: loggedInUser.id,
      toUserId: chatUser.id,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
  }, [chatUser, loggedInUser, matches, messageRequests]);
  const handleSendMessageRequest = useCallback((toUser, adjective) => {
    if (!loggedInUser) return;
    const newRequest = {
      id: `req-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fromUserId: loggedInUser.id,
      toUserId: toUser.id,
      adjective,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setMessageRequests(prev => {
      if (prev.find(r => r.fromUserId === loggedInUser.id && r.toUserId === toUser.id)) {
        return prev;
      }
      return [newRequest, ...prev];
    });
  }, [loggedInUser]);

  const handleAcceptRequest = useCallback((requestId) => {
    setMessageRequests(prev => 
      prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r)
    );
  }, []);

  const handleDeclineRequest = useCallback((requestId) => {
    setMessageRequests(prev => 
      prev.map(r => r.id === requestId ? { ...r, status: 'declined' } : r)
    );
  }, []);
  if (!isLoaded) {
    return (
      <div className="app-shell">
        <div className="empty-state">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  const urlParams = new URLSearchParams(window.location.search);
  const verificationToken = urlParams.get("token");
  const isVerificationPage = window.location.pathname.includes("verify-email") || verificationToken;
  if (isVerificationPage && verificationToken) {
    return (
      <EmailVerificationScreen
        onVerificationSuccess={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          if (!isAuthenticated) {
            window.location.reload();
          }
        }}
      />
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
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
      {activeTab !== "chat" && (
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
          <div className="nav-icon-wrapper">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {inboxBadgeCount > 0 && (
              <span className="nav-badge">
                {inboxBadgeCount > 9 ? "9+" : inboxBadgeCount}
              </span>
            )}
          </div>
          <span className="nav-label">Inbox</span>
        </button>
        <button
          className={`nav-tab ${activeTab === "messages" || activeTab === "chat" ? "active" : ""}`.trim()}
          onClick={() => { setChatUser(null); setActiveTab("messages"); }}
        >
          <div className="nav-icon-wrapper">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {messagesBadgeCount > 0 && (
              <span className="nav-badge">
                {messagesBadgeCount > 9 ? "9+" : messagesBadgeCount}
              </span>
            )}
          </div>
          <span className="nav-label">Messages</span>
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
      )}

      <main className="app-content">
        <div className="screen">
          {activeTab === "discover" && (
            <>
              {currentProfile ? (
                <DiscoverScreen
                  profile={currentProfile}
                  adjectives={adjectives}
                  onSelectAdjective={handleAdjectiveSelect}
                  onSkip={handleNextProfile}
                  matchesCount={currentProfileMatchesCount}
                  vibesSentToday={vibesSentToday}
                  isPremium={isPremium}
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
              onOpenChat={handleOpenChat}
              onSendMessageRequest={handleSendMessageRequest}
            />
          )}
          {activeTab === "messages" && (
            <MessagesScreen
              conversations={conversations}
              requests={pendingRequests}
              currentUserId={loggedInUserId}
              isPremium={isPremium}
              onOpenPayment={handleOpenPayment}
              onOpenChat={handleOpenChat}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
            />
          )}
          {activeTab === "chat" && chatUser && (
            <ChatScreen
              otherUser={chatUser}
              messages={chatMessages}
              currentUserId={loggedInUserId}
              onSendMessage={handleSendMessage}
              onBack={handleCloseChat}
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

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
