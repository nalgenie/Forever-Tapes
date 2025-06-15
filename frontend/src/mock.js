// Mock data for pod-card application

export const mockPodCards = [
  {
    id: '1',
    title: 'Birthday Surprise for Sarah',
    createdBy: 'Mike Johnson',
    totalDuration: 4.5,
    maxMessageDuration: 0.5,
    maxMessages: 10,
    currentMessages: 7,
    status: 'collecting',
    shareLink: 'https://podcard.app/contribute/abc123',
    backgroundMusic: 'Happy Birthday Jazz',
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
    title: 'Happy Birthday Jazz',
    artist: 'Pod-Card Studio',
    duration: 60,
    category: 'Birthday',
    audioUrl: '/mock-audio/birthday-jazz.mp3'
  },
  {
    id: 'music2',
    title: 'Celebration Vibes',
    artist: 'Pod-Card Studio',
    duration: 45,
    category: 'General',
    audioUrl: '/mock-audio/celebration.mp3'
  },
  {
    id: 'music3',
    title: 'Gentle Acoustic',
    artist: 'Pod-Card Studio',
    duration: 90,
    category: 'Calm',
    audioUrl: '/mock-audio/acoustic.mp3'
  },
  {
    id: 'music4',
    title: 'Upbeat Pop',
    artist: 'Pod-Card Studio',
    duration: 75,
    category: 'Energetic',
    audioUrl: '/mock-audio/upbeat.mp3'
  },
  {
    id: 'music5',
    title: 'Romantic Melody',
    artist: 'Pod-Card Studio',
    duration: 120,
    category: 'Love',
    audioUrl: '/mock-audio/romantic.mp3'
  }
];

export const mockUser = {
  id: 'user1',
  name: 'Mike Johnson',
  email: 'mike@email.com',
  phone: '+1234567890',
  freePodCardsUsed: 0,
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
          shareLink: `https://podcard.app/contribute/${Math.random().toString(36).substr(2, 6)}`,
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
          finalAudioUrl: '/mock-audio/final-podcard.mp3',
          shareUrl: `https://podcard.app/listen/${podCardId}`,
          status: 'completed'
        });
      }, 3000);
    });
  }
};

export const pricingTiers = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    maxDuration: 5,
    maxMessageDuration: 0.5,
    maxMessages: 10,
    features: ['Basic editing', 'Email delivery', '5 music tracks']
  },
  {
    id: 'basic',
    name: 'Basic Pod-Card',
    price: 5,
    maxDuration: 10,
    maxMessageDuration: 1,
    maxMessages: 15,
    features: ['Advanced editing', 'Email + SMS delivery', 'Full music library', 'Noise reduction']
  },
  {
    id: 'premium',
    name: 'Premium Pod-Card',
    price: 15,
    maxDuration: 20,
    maxMessageDuration: 2,
    maxMessages: 25,
    features: ['Pro editing tools', 'Custom branding', 'Priority support', 'Advanced analytics']
  },
  {
    id: 'unlimited',
    name: 'Unlimited Pod-Card',
    price: 25,
    maxDuration: 60,
    maxMessageDuration: 5,
    maxMessages: 50,
    features: ['Unlimited everything', 'White-label option', 'API access', 'Dedicated support']
  }
];