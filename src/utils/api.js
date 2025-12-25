const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('auth_user');
  return user ? JSON.parse(user) : null;
};

// Set current user in localStorage
const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
};

// Generic fetch wrapper with auth
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
  }

  return response.json();
  } catch (error) {
    // Handle network errors, CORS issues, etc.
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please make sure the backend server is running on http://localhost:3001');
    }
    throw error;
  }
};

export const authAPI = {
  requestOTP: async (email, phone) => {
    const data = await apiRequest('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email, phone }),
    });
    return data;
  },

  verifyOTP: async (email, phone, otp) => {
    const data = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, phone, otp }),
    });
    if (data.token && data.user) {
      setToken(data.token);
      setCurrentUser(data.user);
    }
    return data;
  },

  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    setToken(data.token);
    setCurrentUser(data.user);
    return data;
  },

  verifyEmail: async (token) => {
    const data = await apiRequest(`/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
    return data;
  },

  resendVerification: async () => {
    const data = await apiRequest('/auth/resend-verification', {
      method: 'POST',
    });
    return data;
  },

  login: async (phone, email) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, email }),
    });
    setToken(data.token);
    setCurrentUser(data.user);
    return data;
  },

  getMe: async () => {
    const data = await apiRequest('/auth/me');
    return data.user;
  },

  logout: () => {
    setToken(null);
    setCurrentUser(null);
  },

  bypass: async () => {
    const data = await apiRequest('/auth/bypass', {
      method: 'POST',
    });
    setToken(data.token);
    setCurrentUser(data.user);
    return data;
  },
};

export const usersAPI = {
  getAll: async () => {
    const data = await apiRequest('/users');
    return data.users;
  },

  getById: async (id) => {
    const data = await apiRequest(`/users/${id}`);
    return data.user;
  },

  update: async (id, updates) => {
    const data = await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  updatePremium: async (id, isPremium, premiumExpiresAt = null) => {
    const data = await apiRequest(`/users/${id}/premium`, {
      method: 'PATCH',
      body: JSON.stringify({ isPremium, premiumExpiresAt }),
    });
    return data.user;
  },
};

export const notificationsAPI = {
  getAll: async () => {
    const data = await apiRequest('/notifications');
    return data.notifications;
  },

  getSent: async () => {
    const data = await apiRequest('/notifications/sent');
    return data.notifications;
  },

  create: async (toUserId, adjective) => {
    const data = await apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify({ toUserId, adjective }),
    });
    return data;
  },

  getTodayCount: async () => {
    const data = await apiRequest('/notifications/count/today');
    return data.count;
  },
};

export const matchesAPI = {
  getAll: async () => {
    const data = await apiRequest('/matches');
    return data.matches;
  },

  getCount: async (userId) => {
    const data = await apiRequest(`/matches/count/${userId}`);
    return data.count;
  },
};

export const messagesAPI = {
  getConversation: async (otherUserId) => {
    const data = await apiRequest(`/messages/conversation/${otherUserId}`);
    return data.messages;
  },

  send: async (toUserId, text) => {
    const data = await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ toUserId, text }),
    });
    return data.message;
  },

  markAsRead: async (otherUserId) => {
    await apiRequest(`/messages/read/${otherUserId}`, {
      method: 'PATCH',
    });
  },
};

export const messageRequestsAPI = {
  getAll: async (status = null) => {
    const endpoint = status ? `/message-requests?status=${status}` : '/message-requests';
    const data = await apiRequest(endpoint);
    return data.requests;
  },

  getSent: async () => {
    const data = await apiRequest('/message-requests/sent');
    return data.requests;
  },

  getConversations: async () => {
    const data = await apiRequest('/message-requests/conversations');
    return data.requests;
  },

  create: async (toUserId, adjective) => {
    const data = await apiRequest('/message-requests', {
      method: 'POST',
      body: JSON.stringify({ toUserId, adjective }),
    });
    return data.request;
  },

  updateStatus: async (requestId, status) => {
    const data = await apiRequest(`/message-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return data.request;
  },
};

export { getToken, setToken, getCurrentUser, setCurrentUser };

