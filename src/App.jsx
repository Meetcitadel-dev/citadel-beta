import React, { useMemo, useState, useEffect, useCallback } from "react";
import { generateAdjectives } from "./data/adjectives.js";
import db from "./data/db.js";
import { authAPI, usersAPI, notificationsAPI, matchesAPI, messagesAPI, messageRequestsAPI, getToken, getCurrentUser, clearCache, testBackendConnection } from "./utils/api.js";
import { Analytics } from "@vercel/analytics/react";
import AuthScreen from "./components/AuthScreen.jsx";
import EmailVerificationScreen from "./components/EmailVerificationScreen.jsx";
import DiscoverScreen from "./components/DiscoverScreen.jsx";
import InboxScreen from "./components/InboxScreen.jsx";
import MessagesScreen from "./components/MessagesScreen.jsx";
import ChatScreen from "./components/ChatScreen.jsx";
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

  // Load users from backend API
  const loadUsers = useCallback(async () => {
    try {
      const backendUsers = await usersAPI.getAll();
      // Transform backend users to match frontend format
      const transformedUsers = backendUsers.map(user => ({
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        gender: user.gender,
        college: user.college,
        year: user.year,
        age: user.age,
        skills: user.skills || [],
        imageUrl: user.imageUrl || '',
        note: user.note || '', // Include note field
        isPremium: user.isPremium || false,
        email: user.email,
        phone: user.phone
      }));
      // Merge with existing users (don't overwrite, just update/add)
      setUsers(prev => {
        const merged = [...prev];
        transformedUsers.forEach(newUser => {
          const index = merged.findIndex(u => (u.id === newUser.id || u._id === newUser.id));
          if (index >= 0) {
            merged[index] = newUser;
          } else {
            merged.push(newUser);
          }
        });
        return merged;
      });
    } catch (error) {
      console.error('Failed to load users:', error);
      // Don't clear users array on error, just log it
      // This way if the API fails, we still have the logged-in user
    }
  }, []);

  // Load notifications and matches from backend
  const loadNotifications = useCallback(async () => {
    try {
      const backendNotifications = await notificationsAPI.getAll();
      setNotifications(backendNotifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    }
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      const backendMatches = await matchesAPI.getAll();
      setMatches(backendMatches || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setMatches([]);
    }
  }, []);

  const loadMessageRequests = useCallback(async () => {
    try {
      const backendRequests = await messageRequestsAPI.getAll();
      setMessageRequests(backendRequests || []);
    } catch (error) {
      console.error('Failed to load message requests:', error);
      setMessageRequests([]);
    }
  }, []);

  // Initialize database and load data on mount
  useEffect(() => {
    // Test backend connectivity on app load (only in production)
    if (import.meta.env.PROD) {
      testBackendConnection().then(result => {
        if (!result.success) {
          console.error('⚠️ Backend connectivity test failed:', result);
          console.error('💡 Check your VITE_API_URL environment variable and backend deployment');
        }
      });
    }
    
    // Initialize localStorage for messages, requests (legacy/local-only)
    setMessages(db.messages.getAll());
    setMessageRequests(db.messageRequests.getAll());
    
    // Check if user is already authenticated via JWT
    const checkAuth = async () => {
      const token = getToken();
      const storedUser = getCurrentUser();
      
      if (token && storedUser) {
        try {
          const user = await authAPI.getMe();
          const userId = user._id || user.id;
          setLoggedInUserId(userId);
          setIsAuthenticated(true);
          setIsPremium(user.isPremium || false);
          // Fetch users, notifications, matches, and message requests from backend
          await Promise.all([
            loadUsers(),
            loadNotifications(),
            loadMatches(),
            loadMessageRequests()
          ]);
        } catch (error) {
          console.error('Auth check failed:', error);
          authAPI.logout();
          localStorage.removeItem('citadel_auth_user');
          localStorage.removeItem('citadel_is_premium');
        }
      } else {
    const authUser = localStorage.getItem('citadel_auth_user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
            const userId = parsed._id || parsed.id;
            setLoggedInUserId(userId);
        setIsAuthenticated(true);
        const premiumData = localStorage.getItem('citadel_is_premium');
        if (premiumData) {
          const premiumParsed = JSON.parse(premiumData);
          if (typeof premiumParsed === 'object' && premiumParsed !== null) {
                setIsPremium(premiumParsed[userId] === true);
          }
        }
            // Fetch users, notifications, matches, and message requests from backend
            await Promise.all([
              loadUsers(),
              loadNotifications(),
              loadMatches(),
              loadMessageRequests()
            ]);
      } catch (e) {
        localStorage.removeItem('citadel_auth_user');
          }
      }
    }
    setIsLoaded(true);
    };

    checkAuth();
  }, [loadUsers, loadNotifications, loadMatches, loadMessageRequests]);

  const handleAuthSuccess = useCallback(async (user, isNewUser) => {
    const userId = user._id || user.id;
    localStorage.setItem('citadel_auth_user', JSON.stringify(user));
    db.session.setCurrentUserId(userId);
    setLoggedInUserId(userId);
    setIsAuthenticated(true);
    setIsPremium(user.isPremium || false);
    setCurrentIndex(0);
    
    // Add current user to users array immediately so loggedInUser is available
    const transformedUser = {
      id: user._id || user.id,
      _id: user._id || user.id,
      name: user.name,
      gender: user.gender,
      college: user.college,
      year: user.year,
      age: user.age,
      skills: user.skills || [],
      imageUrl: user.imageUrl || '',
      note: user.note || '', // Include note field
      isPremium: user.isPremium || false,
      email: user.email,
      phone: user.phone
    };
    setUsers(prev => {
      // Check if user already exists, if not add it
      const exists = prev.find(u => (u.id === userId || u._id === userId));
      if (exists) {
        return prev.map(u => (u.id === userId || u._id === userId) ? transformedUser : u);
      }
      return [transformedUser, ...prev];
    });

    // Reload users, notifications, matches, and message requests from backend after authentication
    Promise.all([
      loadUsers(),
      loadNotifications(),
      loadMatches(),
      loadMessageRequests()
    ]).catch(err => {
      console.error('Failed to load data from backend:', err);
      // Don't block the UI if this fails
    });
  }, [loadUsers, loadNotifications, loadMatches, loadMessageRequests]);

  const handleLogout = useCallback(() => {
    authAPI.logout();
    clearCache(); // Clear all cached data
    setIsAuthenticated(false);
    setLoggedInUserId(null);
    setIsPremium(false);
    setUsers([]);
    setNotifications([]);
    setMatches([]);
    setMessages([]);
    setMessageRequests([]);
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

  const handlePaymentSuccess = useCallback(async () => {
    if (!loggedInUserId) {
      alert('Error: user not found. Please try logging in again.');
      return;
    }

    // Update premium status in backend so server-side checks pass
    try {
      await usersAPI.updatePremium(loggedInUserId, true, null);
    } catch (e) {
      console.error('Failed to update premium status on server:', e);
      // Continue anyway; frontend will still mark as premium
    }

    // Also persist premium status in localStorage (per-user map)
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

  const loggedInUser = useMemo(() => {
    if (!loggedInUserId) return null;
    return users.find((u) => (u.id === loggedInUserId || u._id === loggedInUserId)) || null;
  }, [users, loggedInUserId]);

  const handleProfileUpdate = useCallback(async (updatedUser) => {
    try {
      const userId = updatedUser._id || updatedUser.id;
      if (!userId) {
        console.error('Cannot update profile: missing user ID');
        alert('Error: User ID not found. Please try logging in again.');
        return;
      }

      const updated = await usersAPI.update(userId, {
        name: updatedUser.name,
        gender: updatedUser.gender,
        college: updatedUser.college,
        year: updatedUser.year,
        age: updatedUser.age,
        skills: updatedUser.skills,
        imageUrl: updatedUser.imageUrl || '',
        note: updatedUser.note || ''
      });
      
      // Update local state immediately - updated is already the user object
      setUsers(prev => prev.map(u => 
        (u.id === userId || u._id === userId) ? { ...u, ...updated } : u
      ));
      
      // Update localStorage with new user data
      const authUser = localStorage.getItem('citadel_auth_user');
      if (authUser) {
        try {
          const parsed = JSON.parse(authUser);
          if (parsed._id === userId || parsed.id === userId) {
            const updatedAuthUser = { ...parsed, ...updated };
            localStorage.setItem('citadel_auth_user', JSON.stringify(updatedAuthUser));
    }
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      }
      
      // Update loggedInUser state if it's the current user
      if (loggedInUserId === userId) {
        // Force a re-render by updating the users array
        // The loggedInUser memo will pick up the changes
      }
      
      // Reload users to ensure consistency
      await loadUsers();
      
      console.log('✅ Profile updated successfully:', updated);
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      alert('Failed to save changes. Please try again.');
    }
  }, [loadUsers, loggedInUserId]);

  const matchedUserIds = useMemo(() => {
    const ids = new Set();
    if (!loggedInUser) return ids;
    matches.forEach((m) => {
      const user1Id = m.user1Id?._id || m.user1Id?.id || m.user1Id;
      const user2Id = m.user2Id?._id || m.user2Id?.id || m.user2Id;
      const loggedInId = loggedInUser._id || loggedInUser.id;
      if (user1Id === loggedInId) {
        ids.add(user2Id);
      } else if (user2Id === loggedInId) {
        ids.add(user1Id);
      }
    });
    return ids;
  }, [matches, loggedInUser]);

  const sentAdjectivesMap = useMemo(() => {
    const map = new Map();
    if (!loggedInUser) return map;
    const loggedInId = loggedInUser._id || loggedInUser.id;
    notifications.forEach((n) => {
      const fromUserId = n.fromUserId?._id || n.fromUserId?.id || n.fromUserId;
      if (fromUserId === loggedInId) {
        const toUserId = n.toUserId?._id || n.toUserId?.id || n.toUserId;
        const existing = map.get(toUserId);
        if (!existing || n.createdAt > existing) {
          map.set(toUserId, n.createdAt);
        }
      }
    });
    return map;
  }, [notifications, loggedInUser]);

  const visibleUsers = useMemo(() => {
    if (!loggedInUser) return [];
    const loggedInId = loggedInUser._id || loggedInUser.id;
    const filtered = users.filter((u) => {
      const userId = u._id || u.id;
      // STRICT: Only show users who have uploaded a profile image
      const hasImage = u.imageUrl && 
                      typeof u.imageUrl === 'string' && 
                      u.imageUrl.trim() !== '';
      return userId !== loggedInId && 
             !matchedUserIds.has(userId) && 
             hasImage; // Must have profile image
    });
    return filtered.sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;
      const aTime = sentAdjectivesMap.get(aId);
      const bTime = sentAdjectivesMap.get(bId);
      if (!aTime && !bTime) return 0;
      if (aTime && !bTime) return 1;
      if (!aTime && bTime) return -1;
      return aTime.localeCompare(bTime);
    });
  }, [users, loggedInUser, matchedUserIds, sentAdjectivesMap]);

  const currentProfile = visibleUsers[currentIndex] ?? null;

  const adjectiveFromProfile = useMemo(() => {
    if (!currentProfile || !loggedInUser) return null;
    const currentProfileId = currentProfile._id || currentProfile.id;
    const loggedInId = loggedInUser._id || loggedInUser.id;
    const sent = notifications.find((n) => {
      const fromUserId = n.fromUserId?._id || n.fromUserId?.id || n.fromUserId;
      const toUserId = n.toUserId?._id || n.toUserId?.id || n.toUserId;
      return fromUserId === currentProfileId && toUserId === loggedInId;
    });
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

  const [vibesSentToday, setVibesSentToday] = useState(0);

  // Load vibes sent today from backend
  useEffect(() => {
    if (isAuthenticated && loggedInUserId) {
      notificationsAPI.getTodayCount()
        .then(count => setVibesSentToday(count || 0))
        .catch(err => {
          console.error('Failed to load vibes count:', err);
          setVibesSentToday(0);
        });
    }
  }, [isAuthenticated, loggedInUserId]);

  const handleAdjectiveSelect = async (adjective) => {
    if (!currentProfile) return;

    // Check if user has uploaded an image - MUST be first check
    if (!loggedInUser) {
      alert('Please log in to send vibes.');
      return;
    }
    
    const hasImage = loggedInUser.imageUrl && 
                    typeof loggedInUser.imageUrl === 'string' && 
                    loggedInUser.imageUrl.trim() !== '';
    
    if (!hasImage) {
      alert('Your profile isn\'t public yet. Upload a photo to send and receive vibes.');
      return;
    }

    // Prevent sending more than one vibe to the same user
    const loggedInId = loggedInUser._id || loggedInUser.id;
    const currentProfileId = currentProfile._id || currentProfile.id;
    const alreadySent = notifications.some((n) => {
      const fromUserId = n.fromUserId?._id || n.fromUserId?.id || n.fromUserId;
      const toUserId = n.toUserId?._id || n.toUserId?.id || n.toUserId;
      return fromUserId === loggedInId && toUserId === currentProfileId;
    });
    if (alreadySent) {
      alert('You have already sent a vibe to this user.');
      return;
    }

    if (!isPremium && vibesSentToday >= 10) {
      alert('You have reached your daily limit of 10 vibes. Get premium for unlimited vibes!');
      return;
    }
    
    try {
      // Call backend API to send vibe
      const result = await notificationsAPI.create(currentProfileId, adjective);
      
      // Update notifications with the response
      if (result.notification) {
        setNotifications((prev) => [result.notification, ...prev]);
      }
      
      // If there's a match (both users sent same adjective), update matches
      if (result.match) {
        // Reload matches from backend to get the full match data
        await loadMatches();
        alert(`🎉 It's a match! You both chose "${adjective}"!`);
      }
      
      // Update vibes sent today count
      const newCount = await notificationsAPI.getTodayCount();
      setVibesSentToday(newCount || 0);
      
      // Move to next profile
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to send vibe:', error);
      alert(error.message || 'Failed to send vibe. Please try again.');
    }
  };

  const inboxItems = useMemo(
    () => {
      if (!loggedInUser) return [];
      const loggedInId = loggedInUser._id || loggedInUser.id;
      return notifications
        .filter((n) => {
          const toUserId = n.toUserId?._id || n.toUserId?.id || n.toUserId;
          const fromUserId = n.fromUserId?._id || n.fromUserId?.id || n.fromUserId;
          return toUserId === loggedInId && !matchedUserIds.has(fromUserId);
        })
        .map((n) => {
          const fromUserId = n.fromUserId?._id || n.fromUserId?.id || n.fromUserId;
          return {
            ...n,
            fromUser: users.find((u) => {
              const userId = u._id || u.id;
              return userId === fromUserId;
            })
          };
        });
    },
    [notifications, loggedInUser, matchedUserIds, users]
  );

  const matchItems = useMemo(
    () => {
      if (!loggedInUser) return [];
      const loggedInId = loggedInUser._id || loggedInUser.id;
      return matches
        .filter((m) => {
          const user1Id = m.user1Id?._id || m.user1Id?.id || m.user1Id;
          const user2Id = m.user2Id?._id || m.user2Id?.id || m.user2Id;
          return user1Id === loggedInId || user2Id === loggedInId;
        })
        .map((m) => {
          const user1Id = m.user1Id?._id || m.user1Id?.id || m.user1Id;
          const user2Id = m.user2Id?._id || m.user2Id?.id || m.user2Id;
          const otherUserId = user1Id === loggedInId ? user2Id : user1Id;
          const otherUser = users.find((u) => {
            const userId = u._id || u.id;
            return userId === otherUserId;
          });
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
    const currentProfileId = currentProfile._id || currentProfile.id;
    return matches.filter((m) => {
      const user1Id = m.user1Id?._id || m.user1Id?.id || m.user1Id;
      const user2Id = m.user2Id?._id || m.user2Id?.id || m.user2Id;
      return user1Id === currentProfileId || user2Id === currentProfileId;
    }).length;
  }, [matches, currentProfile]);

  const conversations = useMemo(() => {
    if (!loggedInUser) return [];
    const loggedInId = loggedInUser._id || loggedInUser.id;
    
    // Conversations from matches (even if no messages yet)
    const matchConvos = matchItems.map(m => {
      const otherUserId = m.otherUser?._id || m.otherUser?.id || m.otherUser;
      const convMessages = messages.filter(msg => {
        const fromUserId = msg.fromUserId?._id || msg.fromUserId?.id || msg.fromUserId;
        const toUserId = msg.toUserId?._id || msg.toUserId?.id || msg.toUserId;
        return (
          (fromUserId === loggedInId && toUserId === otherUserId) ||
          (fromUserId === otherUserId && toUserId === loggedInId)
        );
      });
      const lastMsg = convMessages[convMessages.length - 1] || null;
      return {
        ...m,
        type: 'match',
        lastMessage: lastMsg ? lastMsg.text : null,
        lastMessageAt: lastMsg ? lastMsg.createdAt : m.createdAt,
      };
    });

    const acceptedRequests = messageRequests
      .filter(r => {
        const fromUserId = r.fromUserId?._id || r.fromUserId?.id || r.fromUserId;
        const toUserId = r.toUserId?._id || r.toUserId?.id || r.toUserId;
        return r.status === 'accepted' && (fromUserId === loggedInId || toUserId === loggedInId);
      })
      .map(r => {
        const fromUserId = r.fromUserId?._id || r.fromUserId?.id || r.fromUserId;
        const toUserId = r.toUserId?._id || r.toUserId?.id || r.toUserId;
        const otherUserId = fromUserId === loggedInId ? toUserId : fromUserId;
        const otherUser = users.find(u => {
          const userId = u._id || u.id;
          return userId === otherUserId;
        });
        const convMessages = messages.filter(msg => {
          const msgFromUserId = msg.fromUserId?._id || msg.fromUserId?.id || msg.fromUserId;
          const msgToUserId = msg.toUserId?._id || msg.toUserId?.id || msg.toUserId;
          return (msgFromUserId === loggedInId && msgToUserId === otherUserId) ||
                 (msgFromUserId === otherUserId && msgToUserId === loggedInId);
        });
        const lastMsg = convMessages[convMessages.length - 1];
        return {
          ...r,
          type: 'request',
          otherUser,
          lastMessage: lastMsg?.text,
          lastMessageAt: lastMsg?.createdAt
        };
      })
      .filter(r => !matchItems.find(m => {
        const mOtherUserId = m.otherUser?._id || m.otherUser?.id || m.otherUser;
        const rOtherUserId = r.otherUser?._id || r.otherUser?.id || r.otherUser;
        return mOtherUserId === rOtherUserId;
      }));

    return [...matchConvos, ...acceptedRequests].sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });
  }, [loggedInUser, matchItems, messageRequests, messages, users]);

  const pendingRequests = useMemo(() => {
    if (!loggedInUser) return [];
    const loggedInId = loggedInUser._id || loggedInUser.id;
    return messageRequests
      .filter(r => {
        const toUserId = r.toUserId?._id || r.toUserId?.id || r.toUserId;
        return toUserId === loggedInId;
      })
      .map(r => {
        const fromUserId = r.fromUserId?._id || r.fromUserId?.id || r.fromUserId;
        return {
        ...r,
          fromUser: users.find(u => {
            const userId = u._id || u.id;
            return userId === fromUserId;
          })
        };
      });
  }, [loggedInUser, messageRequests, users]);

  const inboxBadgeCount = inboxItems.length + matchItems.length;
  const pendingRequestCount = pendingRequests.filter(r => r.status === 'pending').length;
  const messagesBadgeCount = conversations.length + pendingRequestCount;

  const chatMessages = useMemo(() => {
    if (!chatUser || !loggedInUser) return [];
    const loggedInId = loggedInUser._id || loggedInUser.id;
    const chatUserId = chatUser._id || chatUser.id;
    return messages.filter(m => {
      const fromUserId = m.fromUserId?._id || m.fromUserId?.id || m.fromUserId;
      const toUserId = m.toUserId?._id || m.toUserId?.id || m.toUserId;
      return (fromUserId === loggedInId && toUserId === chatUserId) ||
             (fromUserId === chatUserId && toUserId === loggedInId);
    }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [chatUser, loggedInUser, messages]);

  const handleOpenChat = useCallback(async (user) => {
    setChatUser(user);
    setActiveTab("chat");
    
    // Load messages from backend when opening chat
    if (user && loggedInUser) {
      try {
        const userId = user._id || user.id;
        const conversationMessages = await messagesAPI.getConversation(userId);
        // Replace messages for this conversation with backend data
        setMessages(prev => {
          const loggedInId = loggedInUser._id || loggedInUser.id;
          // Remove old messages for this conversation
          const otherMessages = prev.filter(m => {
            const fromUserId = m.fromUserId?._id || m.fromUserId?.id || m.fromUserId;
            const toUserId = m.toUserId?._id || m.toUserId?.id || m.toUserId;
            return !((fromUserId === loggedInId && toUserId === userId) ||
                     (fromUserId === userId && toUserId === loggedInId));
          });
          // Add new messages from backend
          return [...otherMessages, ...conversationMessages].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
        
        // Mark messages as read
        await messagesAPI.markAsRead(userId);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    }
  }, [loggedInUser]);

  const handleCloseChat = useCallback(() => {
    setChatUser(null);
    setActiveTab("messages");
  }, []);

  const handleSendMessage = useCallback(async (text) => {
    if (!chatUser || !loggedInUser) return;
    const loggedInId = loggedInUser._id || loggedInUser.id;
    const chatUserId = chatUser._id || chatUser.id;
    
    // Non-premium users can only reply (send if they've received messages)
    if (!isPremium) {
      const hasReceivedMessages = messages.some(msg => {
        const fromUserId = msg.fromUserId?._id || msg.fromUserId?.id || msg.fromUserId;
        const toUserId = msg.toUserId?._id || msg.toUserId?.id || msg.toUserId;
        return fromUserId === chatUserId && toUserId === loggedInId;
      });
      
      if (!hasReceivedMessages) {
        alert('You need a premium account to start a conversation. You can reply to messages you\'ve received for free.');
        return;
      }
    }

    const isMatched = matches.some(m => {
      const user1Id = m.user1Id?._id || m.user1Id?.id || m.user1Id;
      const user2Id = m.user2Id?._id || m.user2Id?.id || m.user2Id;
      return (user1Id === loggedInId && user2Id === chatUserId) ||
             (user1Id === chatUserId && user2Id === loggedInId);
    });
    
    const hasAcceptedRequest = messageRequests.some(r => {
      const fromUserId = r.fromUserId?._id || r.fromUserId?.id || r.fromUserId;
      const toUserId = r.toUserId?._id || r.toUserId?.id || r.toUserId;
      return ((fromUserId === loggedInId && toUserId === chatUserId) ||
              (fromUserId === chatUserId && toUserId === loggedInId)) &&
             r.status === 'accepted';
    });
    
    if (!isMatched && !hasAcceptedRequest) {
      alert('You can only message matched users or users with accepted message requests.');
      return;
    }
    
    try {
      // Send message via backend API
      const sentMessage = await messagesAPI.send(chatUserId, text);
      
      // Update local state with the response
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    }
  }, [chatUser, loggedInUser, isPremium, matches, messageRequests]);

  const handleSendMessageRequest = useCallback(async (toUser, adjective) => {
    if (!loggedInUser) return;
    const toUserId = toUser._id || toUser.id;
    
    try {
      // Create message request in backend (only premium users allowed by server)
      const request = await messageRequestsAPI.create(toUserId, adjective);
      // Merge into local state (avoid duplicates)
      setMessageRequests(prev => {
        const exists = prev.find(r => {
          const rId = r._id || r.id;
          return rId === (request._id || request.id);
        });
        if (exists) return prev;
        return [request, ...prev];
      });
    } catch (error) {
      console.error('Failed to send message request:', error);
      alert(error.message || 'Failed to send message request. Please try again.');
    }
  }, [loggedInUser]);

  const handleAcceptRequest = useCallback(async (requestId) => {
    try {
      const updated = await messageRequestsAPI.updateStatus(requestId, 'accepted');
      const { request, match } = updated;

      // Update requests state
      setMessageRequests(prev =>
        prev.map(r => {
          const rId = r._id || r.id;
          const updatedId = request._id || request.id;
          return rId === updatedId ? request : r;
        })
      );

      // If backend created a match, merge it into matches so it shows under Matches
      if (match) {
        setMatches(prev => {
          const exists = prev.find(m => {
            const id = m._id || m.id;
            return id === match.id;
          });
          if (exists) return prev;

          // Format like /matches route output
          const currentUserId = loggedInUser?._id || loggedInUser?.id;
          const otherUserId =
            String(match.user1Id) === String(currentUserId) ? match.user2Id : match.user1Id;
          const otherUser = users.find(u => {
            const uid = u._id || u.id;
            return String(uid) === String(otherUserId);
          });

          const formatted = {
            id: match.id,
            user1Id: match.user1Id,
            user2Id: match.user2Id,
            otherUser,
            adjective: match.adjective,
            createdAt: match.createdAt,
          };

          return [formatted, ...prev];
        });
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert(error.message || 'Failed to accept request. Please try again.');
    }
  }, []);

  const handleDeclineRequest = useCallback(async (requestId) => {
    try {
      const updated = await messageRequestsAPI.updateStatus(requestId, 'declined');
      setMessageRequests(prev =>
        prev.map(r => {
          const rId = r._id || r.id;
          return rId === (updated._id || updated.id) ? updated : r;
        })
      );
    } catch (error) {
      console.error('Failed to decline request:', error);
      alert(error.message || 'Failed to decline request. Please try again.');
    }
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
  // If we have loggedInUserId but not loggedInUser, try to get user from localStorage
  if (!loggedInUser && loggedInUserId) {
    const authUser = localStorage.getItem('citadel_auth_user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        const tempUser = {
          id: parsed._id || parsed.id,
          _id: parsed._id || parsed.id,
          name: parsed.name,
          gender: parsed.gender,
          college: parsed.college,
          year: parsed.year,
          age: parsed.age,
          skills: parsed.skills || [],
          imageUrl: parsed.imageUrl || '',
          note: parsed.note || '', // Include note field
          isPremium: parsed.isPremium || false,
          email: parsed.email,
          phone: parsed.phone
        };
        // Add to users array if not already there
        setUsers(prev => {
          const exists = prev.find(u => (u.id === tempUser.id || u._id === tempUser.id));
          if (!exists) {
            return [tempUser, ...prev];
          }
          return prev;
        });
        // Continue rendering - the user will be available on next render
      } catch (e) {
        console.error('Error parsing auth user:', e);
      }
    }
  }

  // Only show loading if we truly don't have a user ID
  if (!loggedInUserId) {
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
                  canSendVibe={loggedInUser ? (loggedInUser.imageUrl && typeof loggedInUser.imageUrl === 'string' && loggedInUser.imageUrl.trim() !== '') : false}
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
        </div>
      </main>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
      <Analytics />
    </div>
  );
}
