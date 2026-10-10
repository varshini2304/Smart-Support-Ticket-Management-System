const API_BASE_URL = '/api';

/**
 * Get the stored JWT token from localStorage
 * @returns {string|null} The stored JWT token or null if not found
 */
const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token to store
 */
const storeToken = (token) => {
  localStorage.setItem('authToken', token);
};


const clearToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Make an API request with proper error handling and JWT attachment
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} If the request fails or returns an error status
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle successful responses
    if (response.ok) {
      return data;
    }

    // Handle error responses
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  } catch (error) {
    // Re-throw network errors
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
};


export const authAPI = {
  register: (name, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => apiRequest('/auth/me', { method: 'GET' }),

  updateProfile: (name) =>
    apiRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  logout: () => {
    clearToken();
  },
};

export const ticketAPI = {
  createTicket: (title, description, priority = 'MEDIUM') =>
    apiRequest('/tickets', {
      method: 'POST',
      body: JSON.stringify({ title, description, priority }),
    }),

  getMyTickets: (page = 1, limit = 10, filters = {}) => {
    let endpoint = `/tickets?page=${page}&limit=${limit}`;
    if (filters.search) endpoint += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.status) endpoint += `&status=${filters.status}`;
    if (filters.priority) endpoint += `&priority=${filters.priority}`;
    if (filters.category) endpoint += `&category=${filters.category}`;
    return apiRequest(endpoint, { method: 'GET' });
  },

  getTicket: (ticketId) =>
    apiRequest(`/tickets/${ticketId}`, { method: 'GET' }),

  updateTicket: (ticketId, updates) =>
    apiRequest(`/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
};

/**
 * Admin Ticket API calls
 */
export const adminAPI = {
  getAllTickets: (page = 1, limit = 10, status = null, priority = null, search = null) => {
    let endpoint = `/admin/tickets?page=${page}&limit=${limit}`;
    if (status) endpoint += `&status=${status}`;
    if (priority) endpoint += `&priority=${priority}`;
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    return apiRequest(endpoint, { method: 'GET' });
  },

  getTicket: (ticketId) =>
    apiRequest(`/admin/tickets/${ticketId}`, { method: 'GET' }),

  resolveTicket: (ticketId, resolutionNote) =>
    apiRequest(`/admin/tickets/${ticketId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolutionNote }),
    }),

  updateTicket: (ticketId, updates) =>
    apiRequest(`/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  assignTicket: (ticketId, assigneeId) =>
    apiRequest(`/admin/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo: assigneeId }),
    }),

  getDashboardStats: () =>
    apiRequest('/admin/stats', { method: 'GET' }),
};

/**
 * Token management exports
 */
export const tokenAPI = {
  getToken: getStoredToken,
  setToken: storeToken,
  clearToken,
};
