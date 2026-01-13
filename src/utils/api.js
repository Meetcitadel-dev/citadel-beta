// In development, use proxy. In production, use env variable or same origin
// For Vercel deployment:
// Option 1: Set VITE_API_URL environment variable to your backend URL
// Option 2: If backend is on same Vercel project, use /api (requires vercel.json rewrite)
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, try to use same origin /api first (works if backend is on same domain with vercel.json rewrite)
  // This allows the vercel.json rewrite to work
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log API configuration in production for debugging
if (import.meta.env.PROD) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    hasEnvVar: !!import.meta.env.VITE_API_URL,
    envVar: import.meta.env.VITE_API_URL || 'not set'
  });
}

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

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 API Request:', url, options.method || 'GET');
  console.log('🔗 Full URL:', url);

  try {
  const response = await fetch(url, {
    ...options,
    headers,
    mode: 'cors', // Explicitly set CORS mode
  });
  
  console.log('📡 API Response:', response.status, response.statusText, response.url);

  if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
      } else {
        // If not JSON, check status
        if (response.status === 404) {
          // Provide helpful error message for 404
          const isProduction = import.meta.env.PROD;
          if (isProduction && !import.meta.env.VITE_API_URL) {
            errorMessage = 'Backend API not found. Please set VITE_API_URL environment variable in Vercel to your backend URL, or configure vercel.json rewrites.';
          } else {
            errorMessage = 'API endpoint not found. Please check that the backend server is running and accessible.';
          }
        } else {
          errorMessage = response.statusText || errorMessage;
        }
      }
      throw new Error(errorMessage);
  }

  return response.json();
  } catch (error) {
    console.error('❌ API Request Failed:', error);
    console.error('📍 Attempted URL:', url);
    console.error('🔧 API Base URL:', API_BASE_URL);
    console.error('🔍 Error Type:', error.name);
    console.error('🔍 Error Message:', error.message);
    
    // Check for specific error types
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const isProduction = import.meta.env.PROD;
      const backendUrl = import.meta.env.VITE_API_URL || API_BASE_URL;
      
      // Try to determine the specific issue
      let specificIssue = '';
      if (error.message.includes('CORS')) {
        specificIssue = 'CORS error - Backend is blocking requests. Check FRONTEND_URL in backend environment variables.';
      } else if (error.message.includes('network') || error.message.includes('NetworkError')) {
        specificIssue = 'Network error - Backend might be down or URL is incorrect.';
      } else {
        specificIssue = 'Connection failed - Backend might not be accessible at this URL.';
      }
      
      // More specific error messages
      if (isProduction) {
        throw new Error(`Cannot connect to backend at ${backendUrl}. ${specificIssue} Please verify: 1) Backend is deployed and running, 2) Backend URL in VITE_API_URL is correct, 3) Backend CORS allows your frontend domain (set FRONTEND_URL in backend), 4) Test backend directly: ${backendUrl}/api/health`);
      } else {
        throw new Error(`Cannot connect to backend at ${backendUrl}. ${specificIssue} Please make sure the backend server is running (npm run server:dev).`);
      }
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
};

// Clear all cached data from localStorage
export const clearCache = () => {
  // Clear auth data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('citadel_auth_user');
  localStorage.removeItem('citadel_is_premium');
  
  // Clear app data
  localStorage.removeItem('citadel_users');
  localStorage.removeItem('citadel_notifications');
  localStorage.removeItem('citadel_matches');
  localStorage.removeItem('citadel_messages');
  localStorage.removeItem('citadel_message_requests');
  localStorage.removeItem('citadel_current_user_id');
  
  console.log('✅ All cached data cleared');
};

export const uploadAPI = {
  uploadProfileImage: async (file) => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Uploading image:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      endpoint: `${API_BASE_URL}/upload/profile-image`
    });

    try {
      const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formData,
      });

      console.log('📡 Upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `Upload failed: ${response.status} ${response.statusText}` 
        }));
        console.error('❌ Upload error response:', errorData);
        throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Upload success:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload fetch error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend server is running.');
      }
      throw error;
    }
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

// Test backend connectivity
export const testBackendConnection = async () => {
  const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : '/api');
  const testUrl = `${baseUrl}/health`;
  
  console.log('🔍 Testing backend connection...');
  console.log('📍 Test URL:', testUrl);
  console.log('🔧 Base URL:', baseUrl);
  console.log('🌍 Environment:', import.meta.env.MODE);
  console.log('🔑 VITE_API_URL:', import.meta.env.VITE_API_URL || 'not set');
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log('✅ Backend Health Check Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      ok: response.ok
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is accessible:', data);
      return { success: true, data };
    } else {
      console.error('❌ Backend returned error:', response.status, response.statusText);
      return { success: false, error: `Backend returned ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return { 
      success: false, 
      error: error.message,
      details: {
        name: error.name,
        message: error.message,
        attemptedUrl: testUrl
      }
    };
  }
};

export { getToken, setToken, getCurrentUser, setCurrentUser };

