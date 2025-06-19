import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Token management
let authToken = localStorage.getItem('auth_token');

// Axios interceptor to add auth token
axios.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Axios interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      authToken = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// API service for Forever Tapes with Authentication
export const api = {
  // Auth methods
  setAuthToken: (token) => {
    authToken = token;
    localStorage.setItem('auth_token', token);
  },

  clearAuth: () => {
    authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getStoredUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  setStoredUser: (user) => {
    localStorage.setItem('user_data', JSON.stringify(user));
  },

  // Authentication operations
  register: async (userData) => {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    return response.data;
  },

  requestMagicLink: async (email) => {
    const response = await axios.post(`${API_BASE}/auth/magic-link`, { email });
    return response.data;
  },

  verifyMagicLink: async (token) => {
    const response = await axios.post(`${API_BASE}/auth/verify-magic-link?token=${token}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${API_BASE}/auth/me`);
    return response.data;
  },

  // PodCard operations (now with auth)
  createPodCard: async (podCardData) => {
    const response = await axios.post(`${API_BASE}/podcards`, {
      title: podCardData.title,
      description: podCardData.description,
      occasion: podCardData.occasion || podCardData.tier || 'general'
    });
    
    return response.data;
  },

  getPodCards: async () => {
    const response = await axios.get(`${API_BASE}/podcards`);
    return response.data;
  },

  getMyPodCards: async () => {
    const response = await axios.get(`${API_BASE}/podcards/my`);
    return response.data;
  },

  getPodCard: async (id) => {
    if (id === 'demo') {
      // Handle demo specially
      const response = await axios.get(`${API_BASE}/demo/audio`);
      return response.data;
    }
    const response = await axios.get(`${API_BASE}/podcards/${id}`);
    return response.data;
  },

  // Audio operations
  uploadAudio: async (podCardId, audioFile, contributorData) => {
    const formData = new FormData();
    formData.append('contributor_name', contributorData.name);
    formData.append('contributor_email', contributorData.email);
    formData.append('audio_file', audioFile);

    const response = await axios.post(`${API_BASE}/podcards/${podCardId}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  }
};

// Mock data for background music library
export const musicLibrary = [
  {
    id: 'music1',
    title: 'Birthday jazz loop',
    artist: 'Tape studio',
    duration: 60,
    category: 'Birthday',
    url: '/demo-audio/intro.mp3'
  },
  {
    id: 'music2',
    title: 'Celebration breaks',
    artist: 'Tape studio',
    duration: 45,
    category: 'General',
    url: '/demo-audio/intro.mp3'
  },
  {
    id: 'music3',
    title: 'Warm analog',
    artist: 'Tape studio',
    duration: 90,
    category: 'Calm',
    url: '/demo-audio/intro.mp3'
  },
  {
    id: 'music4',
    title: 'Upbeat synth',
    artist: 'Tape studio',
    duration: 75,
    category: 'Energetic',
    url: '/demo-audio/intro.mp3'
  },
  {
    id: 'music5',
    title: 'Lo-fi romance',
    artist: 'Tape studio',
    duration: 120,
    category: 'Love',
    url: '/demo-audio/intro.mp3'
  }
];

// Demo audio sources
export const getDemoAudioSource = (messageId) => {
  const demoAudios = {
    'demo1': '/demo-audio/mike.wav',
    'demo2': '/demo-audio/emma.wav', 
    'demo3': '/demo-audio/david.wav'
  };
  return demoAudios[messageId] || '/demo-audio/intro.mp3';
};

export default api;