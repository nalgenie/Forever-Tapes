import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// API service for Forever Tapes
export const api = {
  // PodCard operations
  createPodCard: async (podCardData) => {
    const response = await axios.post(`${API_BASE}/podcards`, {
      title: podCardData.title,
      description: podCardData.description,
      occasion: podCardData.tier, // Using tier as occasion for now
      creator_name: podCardData.createdBy || 'Anonymous',
      creator_email: podCardData.createdBy ? `${podCardData.createdBy.toLowerCase().replace(/\s+/g, '')}@example.com` : 'anonymous@example.com'
    });
    
    return {
      ...response.data,
      maxMessages: podCardData.maxMessages,
      maxMessageDuration: podCardData.maxMessageDuration,
      backgroundMusic: podCardData.backgroundMusic,
      tier: podCardData.tier
    };
  },

  getPodCards: async () => {
    const response = await axios.get(`${API_BASE}/podcards`);
    return response.data;
  },

  getPodCard: async (id) => {
    const response = await axios.get(`${API_BASE}/podcards/${id}`);
    return response.data;
  },

  // Audio operations
  uploadAudio: async (podCardId, audioFile, contributorData) => {
    const formData = new FormData();
    formData.append('contributor_name', contributorData.name);
    formData.append('contributor_email', contributorData.email || '');
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

// Mock data for background music library (can be replaced with API call later)
export const musicLibrary = [
  {
    id: 'music1',
    title: 'Birthday Jazz Loop',
    artist: 'Tape Studio',
    duration: 60,
    category: 'Birthday'
  },
  {
    id: 'music2',
    title: 'Celebration Breaks',
    artist: 'Tape Studio',
    duration: 45,
    category: 'General'
  },
  {
    id: 'music3',
    title: 'Warm Analog',
    artist: 'Tape Studio',
    duration: 90,
    category: 'Calm'
  },
  {
    id: 'music4',
    title: 'Upbeat Synth',
    artist: 'Tape Studio',
    duration: 75,
    category: 'Energetic'
  },
  {
    id: 'music5',
    title: 'Lo-Fi Romance',
    artist: 'Tape Studio',
    duration: 120,
    category: 'Love'
  }
];

export default api;