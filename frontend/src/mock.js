// Mock data for Forever Tapes - vintage hifi meets digital lo-fi

export const mockPodCards = [
  {
    id: '1',
    title: 'Birthday Mix for Sarah',
    createdBy: 'Mike Johnson',
    totalDuration: 4.5,
    maxMessageDuration: 0.5,
    maxMessages: 10,
    currentMessages: 7,
    status: 'collecting',
    shareLink: 'https://forevertapes.com/contribute/abc123',
    backgroundMusic: 'Birthday Jazz Loop',
    createdAt: '2025-01-15T10:30:00Z',
    messages: [
      {
        id: 'm1',
        contributorName: 'Emma',
        contributorEmail: 'emma@email.com',
        duration: 0.45,
        uploadedAt: '2025-01-15T11:00:00Z',
        audioUrl: '/mock-audio/message1.mp3',
        trimStart: 0,
        trimEnd: 0.45,
        volume: 100
      },
      {
        id: 'm2',
        contributorName: 'David',
        contributorEmail: 'david@email.com',
        duration: 0.3,
        uploadedAt: '2025-01-15T11:15:00Z',
        audioUrl: '/mock-audio/message2.mp3',
        trimStart: 0,
        trimEnd: 0.3,
        volume: 90
      }
    ]
  }
];

export const mockMusicLibrary = [
  {
    id: 'music1',
    title: 'Birthday Jazz Loop',
    artist: 'Tape Studio',
    duration: 60,
    category: 'Birthday',
    audioUrl: '/mock-audio/birthday-jazz.mp3'
  },
  {
    id: 'music2',
    title: 'Celebration Breaks',
    artist: 'Tape Studio',
    duration: 45,
    category: 'General',
    audioUrl: '/mock-audio/celebration.mp3'
  },
  {
    id: 'music3',
    title: 'Warm Analog',
    artist: 'Tape Studio',
    duration: 90,
    category: 'Calm',
    audioUrl: '/mock-audio/analog.mp3'
  },
  {
    id: 'music4',
    title: 'Upbeat Synth',
    artist: 'Tape Studio',
    duration: 75,
    category: 'Energetic',
    audioUrl: '/mock-audio/upbeat.mp3'
  },
  {
    id: 'music5',
    title: 'Lo-Fi Romance',
    artist: 'Tape Studio',
    duration: 120,
    category: 'Love',
    audioUrl: '/mock-audio/lofi-romance.mp3'
  }
];

export const mockUser = {
  id: 'user1',
  name: 'Mike Johnson',
  email: 'mike@email.com',
  phone: '+1234567890',
  freeTapesUsed: 0,
  paidPlans: []
};

// Mock API functions
export const mockAPI = {
  createPodCard: async (podCardData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPodCard = {
          id: Math.random().toString(36).substr(2, 9),
          ...podCardData,
          status: 'collecting',
          shareLink: `https://forevertapes.com/contribute/${Math.random().toString(36).substr(2, 6)}`,
          createdAt: new Date().toISOString(),
          messages: []
        };
        resolve(newPodCard);
      }, 1000);
    });
  },

  uploadAudio: async (file, contributorData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = {
          id: Math.random().toString(36).substr(2, 9),
          contributorName: contributorData.name,
          contributorEmail: contributorData.email,
          duration: Math.random() * 30 + 10, // 10-40 seconds
          uploadedAt: new Date().toISOString(),
          audioUrl: URL.createObjectURL(file),
          trimStart: 0,
          trimEnd: Math.random() * 30 + 10,
          volume: 100
        };
        resolve(message);
      }, 2000);
    });
  },

  generateFinalPodCard: async (podCardId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: podCardId,
          finalAudioUrl: '/mock-audio/final-mixtape.mp3',
          shareUrl: `https://forevertapes.com/listen/${podCardId}`,
          status: 'completed'
        });
      }, 3000);
    });
  }
};

export const pricingTiers = [
  {
    id: 'free',
    name: 'First Tape',
    price: 0,
    maxDuration: 5,
    maxMessageDuration: 0.5,
    maxMessages: 10,
    features: ['Basic mixing', 'Email delivery', 'Standard quality'],
    description: 'perfect for trying the vibe'
  },
  {
    id: 'basic',
    name: 'Essential Mix',
    price: 8,
    maxDuration: 10,
    maxMessageDuration: 1,
    maxMessages: 15,
    features: ['Advanced mixing', 'Email + SMS delivery', 'Hi-fi quality', 'Noise reduction'],
    description: 'great for small gatherings'
  },
  {
    id: 'premium',
    name: 'Pro Mix',
    price: 18,
    maxDuration: 20,
    maxMessageDuration: 2,
    maxMessages: 25,
    features: ['Pro mixing suite', 'Custom branding', 'Priority support', 'Analytics'],
    description: 'perfect for special occasions'
  },
  {
    id: 'unlimited',
    name: 'Master Tape',
    price: 28,
    maxDuration: 60,
    maxMessageDuration: 5,
    maxMessages: 50,
    features: ['Unlimited everything', 'White-label option', 'Dedicated support', 'Custom features'],
    description: 'for the most special moments'
  }
];