/**
 * Local Database Utility
 * Uses localStorage for persistent storage across sessions
 */

const DB_KEYS = {
  USERS: 'citadel_users',
  NOTIFICATIONS: 'citadel_notifications',
  MATCHES: 'citadel_matches',
  MESSAGES: 'citadel_messages',
  MESSAGE_REQUESTS: 'citadel_message_requests',
  CURRENT_USER_ID: 'citadel_current_user_id',
  IS_PREMIUM: 'citadel_is_premium'
};

// Initialize database with default data.
// Always overwrite the USERS list so changes to the seed data (USERS) take effect,
// and reset interactions so tests always start from a clean slate.
export function initializeDB(defaultUsers) {
  // Always refresh users from the provided default seed
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(defaultUsers));

  // Always reset interactions (vibes/notifications, matches, messages, requests)
  // so all profiles start with zero counts for testing.
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify([]));
  localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify([]));
  localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify([]));
  localStorage.setItem(DB_KEYS.MESSAGE_REQUESTS, JSON.stringify([]));
  if (!localStorage.getItem(DB_KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(DB_KEYS.CURRENT_USER_ID, '1');
  }
  if (!localStorage.getItem(DB_KEYS.IS_PREMIUM)) {
    localStorage.setItem(DB_KEYS.IS_PREMIUM, 'false');
  }
}

// ============ USERS ============

export function getAllUsers() {
  const data = localStorage.getItem(DB_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function getUserById(id) {
  const users = getAllUsers();
  return users.find(u => u.id === id) || null;
}

export function updateUser(id, updates) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }
  return null;
}

export function createUser(userData) {
  const users = getAllUsers();
  const newId = Math.max(...users.map(u => u.id), 0) + 1;
  const newUser = { id: newId, ...userData };
  users.push(newUser);
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  return newUser;
}

export function deleteUser(id) {
  const users = getAllUsers();
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(filtered));
}

// ============ NOTIFICATIONS (Likes) ============

export function getAllNotifications() {
  const data = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : [];
}

export function addNotification(notification) {
  const notifications = getAllNotifications();
  notifications.unshift(notification);
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  return notification;
}

export function getNotificationsForUser(userId) {
  const notifications = getAllNotifications();
  return notifications.filter(n => n.toUserId === userId);
}

export function getNotificationsFromUser(userId) {
  const notifications = getAllNotifications();
  return notifications.filter(n => n.fromUserId === userId);
}

export function clearNotifications() {
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify([]));
}

// ============ MATCHES ============

export function getAllMatches() {
  const data = localStorage.getItem(DB_KEYS.MATCHES);
  return data ? JSON.parse(data) : [];
}

export function addMatch(match) {
  const matches = getAllMatches();
  matches.unshift(match);
  localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify(matches));
  return match;
}

export function getMatchesForUser(userId) {
  const matches = getAllMatches();
  return matches.filter(m => m.user1Id === userId || m.user2Id === userId);
}

export function clearMatches() {
  localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify([]));
}

// ============ MESSAGES ============

export function getAllMessages() {
  const data = localStorage.getItem(DB_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
}

export function addMessage(message) {
  const messages = getAllMessages();
  messages.push(message);
  localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));
  return message;
}

export function getMessagesForConversation(user1Id, user2Id) {
  const messages = getAllMessages();
  return messages.filter(m => 
    (m.fromUserId === user1Id && m.toUserId === user2Id) ||
    (m.fromUserId === user2Id && m.toUserId === user1Id)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function clearMessages() {
  localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify([]));
}

// ============ MESSAGE REQUESTS ============

export function getAllMessageRequests() {
  const data = localStorage.getItem(DB_KEYS.MESSAGE_REQUESTS);
  return data ? JSON.parse(data) : [];
}

export function addMessageRequest(request) {
  const requests = getAllMessageRequests();
  // Check if request already exists
  const exists = requests.find(r => 
    r.fromUserId === request.fromUserId && r.toUserId === request.toUserId
  );
  if (exists) return exists;
  requests.unshift(request);
  localStorage.setItem(DB_KEYS.MESSAGE_REQUESTS, JSON.stringify(requests));
  return request;
}

export function updateMessageRequest(requestId, updates) {
  const requests = getAllMessageRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(DB_KEYS.MESSAGE_REQUESTS, JSON.stringify(requests));
    return requests[index];
  }
  return null;
}

export function getMessageRequestsForUser(userId) {
  const requests = getAllMessageRequests();
  return requests.filter(r => r.toUserId === userId);
}

export function getMessageRequestsFromUser(userId) {
  const requests = getAllMessageRequests();
  return requests.filter(r => r.fromUserId === userId);
}

export function getAcceptedConversations(userId) {
  const requests = getAllMessageRequests();
  return requests.filter(r => 
    (r.fromUserId === userId || r.toUserId === userId) && r.status === 'accepted'
  );
}

export function clearMessageRequests() {
  localStorage.setItem(DB_KEYS.MESSAGE_REQUESTS, JSON.stringify([]));
}

// ============ CURRENT USER / SESSION ============

export function getCurrentUserId() {
  const id = localStorage.getItem(DB_KEYS.CURRENT_USER_ID);
  return id ? parseInt(id, 10) : 1;
}

export function setCurrentUserId(id) {
  localStorage.setItem(DB_KEYS.CURRENT_USER_ID, String(id));
}

// ============ PREMIUM STATUS (per user) ============

export function getIsPremium(userId) {
  const premiumUsers = JSON.parse(localStorage.getItem(DB_KEYS.IS_PREMIUM) || '{}');
  return premiumUsers[userId] === true;
}

export function setIsPremium(userId, value) {
  const premiumUsers = JSON.parse(localStorage.getItem(DB_KEYS.IS_PREMIUM) || '{}');
  premiumUsers[userId] = value;
  localStorage.setItem(DB_KEYS.IS_PREMIUM, JSON.stringify(premiumUsers));
}

// ============ RESET / CLEAR ============

export function resetDatabase(defaultUsers) {
  localStorage.removeItem(DB_KEYS.USERS);
  localStorage.removeItem(DB_KEYS.NOTIFICATIONS);
  localStorage.removeItem(DB_KEYS.MATCHES);
  localStorage.removeItem(DB_KEYS.MESSAGES);
  localStorage.removeItem(DB_KEYS.MESSAGE_REQUESTS);
  localStorage.removeItem(DB_KEYS.CURRENT_USER_ID);
  localStorage.removeItem(DB_KEYS.IS_PREMIUM);
  initializeDB(defaultUsers);
}

export function clearAllData() {
  localStorage.removeItem(DB_KEYS.USERS);
  localStorage.removeItem(DB_KEYS.NOTIFICATIONS);
  localStorage.removeItem(DB_KEYS.MATCHES);
  localStorage.removeItem(DB_KEYS.MESSAGES);
  localStorage.removeItem(DB_KEYS.MESSAGE_REQUESTS);
  localStorage.removeItem(DB_KEYS.CURRENT_USER_ID);
  localStorage.removeItem(DB_KEYS.IS_PREMIUM);
}

// ============ EXPORT DB OBJECT ============

const db = {
  // Initialize
  init: initializeDB,
  reset: resetDatabase,
  clearAll: clearAllData,
  
  // Users
  users: {
    getAll: getAllUsers,
    getById: getUserById,
    update: updateUser,
    create: createUser,
    delete: deleteUser
  },
  
  // Notifications
  notifications: {
    getAll: getAllNotifications,
    add: addNotification,
    getForUser: getNotificationsForUser,
    getFromUser: getNotificationsFromUser,
    clear: clearNotifications
  },
  
  // Matches
  matches: {
    getAll: getAllMatches,
    add: addMatch,
    getForUser: getMatchesForUser,
    clear: clearMatches
  },
  
  // Messages
  messages: {
    getAll: getAllMessages,
    add: addMessage,
    getForConversation: getMessagesForConversation,
    clear: clearMessages
  },
  
  // Message Requests
  messageRequests: {
    getAll: getAllMessageRequests,
    add: addMessageRequest,
    update: updateMessageRequest,
    getForUser: getMessageRequestsForUser,
    getFromUser: getMessageRequestsFromUser,
    getAcceptedConversations: getAcceptedConversations,
    clear: clearMessageRequests
  },
  
  // Session
  session: {
    getCurrentUserId,
    setCurrentUserId,
    getIsPremium,
    setIsPremium
  }
};

export default db;

