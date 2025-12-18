/**
 * Local Database Utility
 * Uses localStorage for persistent storage across sessions
 */

const DB_KEYS = {
  USERS: 'citadel_users',
  NOTIFICATIONS: 'citadel_notifications',
  MATCHES: 'citadel_matches',
  CURRENT_USER_ID: 'citadel_current_user_id',
  IS_PREMIUM: 'citadel_is_premium'
};

// Initialize database with default data if empty
export function initializeDB(defaultUsers) {
  const existingUsers = localStorage.getItem(DB_KEYS.USERS);
  if (!existingUsers) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(DB_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.MATCHES)) {
    localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify([]));
  }
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
  localStorage.removeItem(DB_KEYS.CURRENT_USER_ID);
  localStorage.removeItem(DB_KEYS.IS_PREMIUM);
  initializeDB(defaultUsers);
}

export function clearAllData() {
  localStorage.removeItem(DB_KEYS.USERS);
  localStorage.removeItem(DB_KEYS.NOTIFICATIONS);
  localStorage.removeItem(DB_KEYS.MATCHES);
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
  
  // Session
  session: {
    getCurrentUserId,
    setCurrentUserId,
    getIsPremium,
    setIsPremium
  }
};

export default db;

