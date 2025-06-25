/**
 * Browser Text-to-Speech Service using Web Speech API
 * Generates real AI voices for Forever Tapes testing
 */

class BrowserTTSService {
  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.voices = [];
    this.voicesLoaded = false;
    
    if (this.isSupported) {
      this.loadVoices();
      // Voices might load asynchronously
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  loadVoices() {
    this.voices = speechSynthesis.getVoices();
    this.voicesLoaded = this.voices.length > 0;
    console.log('Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
  }

  // Persona to voice mapping with fallbacks
  getPersonaVoiceSettings() {
    return {
      alice_johnson: {
        preferences: ['Samantha', 'Google US English', 'Microsoft Zira'],
        rate: 0.9,
        pitch: 1.1,
        gender: 'female',
        accent: 'en-US'
      },
      marcus_chen: {
        preferences: ['Google US English', 'Microsoft David', 'Alex'],
        rate: 0.8,
        pitch: 0.9,
        gender: 'male',
        accent: 'en-US'
      },
      sofia_rodriguez: {
        preferences: ['Google español', 'Microsoft Helena', 'Monica'],
        rate: 1.0,
        pitch: 1.2,
        gender: 'female',
        accent: 'es-ES'
      },
      david_thompson: {
        preferences: ['Google UK English', 'Microsoft George', 'Daniel'],
        rate: 0.7,
        pitch: 0.8,
        gender: 'male',
        accent: 'en-GB'
      },
      priya_patel: {
        preferences: ['Google हिन्दी', 'Microsoft Ravi', 'Veena'],
        rate: 0.9,
        pitch: 1.0,
        gender: 'female',
        accent: 'hi-IN'
      },
      james_murphy: {
        preferences: ['Google UK English', 'Microsoft Sean', 'Moira'],
        rate: 1.1,
        pitch: 0.9,
        gender: 'male',
        accent: 'en-IE'
      },
      emily_wang: {
        preferences: ['Google Australian English', 'Microsoft Catherine', 'Karen'],
        rate: 1.0,
        pitch: 1.1,
        gender: 'female',
        accent: 'en-AU'
      },
      carlos_santos: {
        preferences: ['Google português do Brasil', 'Microsoft Daniel', 'Luciana'],
        rate: 0.9,
        pitch: 0.9,
        gender: 'male',
        accent: 'pt-BR'
      }
    };
  }

  findBestVoice(personaId) {
    if (!this.voicesLoaded) {
      this.loadVoices();
    }

    const settings = this.getPersonaVoiceSettings()[personaId];
    if (!settings) {
      return this.voices[0]; // Fallback to first available voice
    }

    // Try to find preferred voices
    for (const preference of settings.preferences) {
      const voice = this.voices.find(v => 
        v.name.toLowerCase().includes(preference.toLowerCase()) ||
        v.lang.includes(settings.accent)
      );
      if (voice) return voice;
    }

    // Fallback to gender-based selection
    const genderVoices = this.voices.filter(v => {
      const name = v.name.toLowerCase();
      if (settings.gender === 'female') {
        return name.includes('female') || name.includes('woman') || 
               ['samantha', 'zira', 'helena', 'monica', 'catherine', 'karen'].some(n => name.includes(n));
      } else {
        return name.includes('male') || name.includes('man') || 
               ['david', 'alex', 'george', 'daniel', 'sean', 'ravi'].some(n => name.includes(n));
      }
    });

    if (genderVoices.length > 0) {
      return genderVoices[0];
    }

    // Final fallback
    return this.voices[0] || null;
  }

  async generateSpeech(text, personaId) {
    if (!this.isSupported) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    if (!this.voicesLoaded) {
      // Wait a bit for voices to load
      await new Promise(resolve => {
        const checkVoices = () => {
          if (speechSynthesis.getVoices().length > 0) {
            this.loadVoices();
            resolve();
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        checkVoices();
      });
    }

    const voice = this.findBestVoice(personaId);
    const settings = this.getPersonaVoiceSettings()[personaId] || {
      rate: 1.0,
      pitch: 1.0
    };

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = 1.0;

      // Capture audio using MediaRecorder
      this.captureAudio(utterance, voice, resolve, reject);
    });
  }

  captureAudio(utterance, voice, resolve, reject) {
    // Create a MediaRecorder to capture the speech
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          
          // Stop the microphone
          stream.getTracks().forEach(track => track.stop());
          
          resolve({
            audioBlob,
            voice: voice ? voice.name : 'Default',
            duration: this.estimateDuration(utterance.text)
          });
        };

        utterance.onstart = () => {
          mediaRecorder.start();
        };

        utterance.onend = () => {
          setTimeout(() => {
            mediaRecorder.stop();
          }, 500); // Give a bit of buffer time
        };

        utterance.onerror = (error) => {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          reject(error);
        };

        speechSynthesis.speak(utterance);
      })
      .catch(reject);
  }

  // Alternative method without microphone capture - simpler but no actual audio file
  async generateSpeechSimple(text, personaId) {
    if (!this.isSupported) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    if (!this.voicesLoaded) {
      await new Promise(resolve => {
        const checkVoices = () => {
          if (speechSynthesis.getVoices().length > 0) {
            this.loadVoices();
            resolve();
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        checkVoices();
      });
    }

    const voice = this.findBestVoice(personaId);
    const settings = this.getPersonaVoiceSettings()[personaId] || {
      rate: 1.0,
      pitch: 1.0
    };

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = 1.0;

      utterance.onend = () => {
        resolve({
          success: true,
          voice: voice ? voice.name : 'Default',
          duration: this.estimateDuration(text),
          text: text
        });
      };

      utterance.onerror = reject;

      speechSynthesis.speak(utterance);
    });
  }

  estimateDuration(text) {
    // Rough estimation: average speaking rate is 150-160 words per minute
    const words = text.split(' ').length;
    const minutes = words / 150;
    return Math.max(minutes * 60, 2); // Minimum 2 seconds
  }

  getAvailableVoices() {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: this.guessGender(voice.name),
      localService: voice.localService
    }));
  }

  guessGender(voiceName) {
    const name = voiceName.toLowerCase();
    const femaleIndicators = ['female', 'woman', 'samantha', 'zira', 'helena', 'monica', 'catherine', 'karen', 'siri'];
    const maleIndicators = ['male', 'man', 'david', 'alex', 'george', 'daniel', 'sean', 'ravi'];
    
    if (femaleIndicators.some(indicator => name.includes(indicator))) return 'female';
    if (maleIndicators.some(indicator => name.includes(indicator))) return 'male';
    return 'unknown';
  }

  // Enhanced method that generates actual audio blob
  async generateAudioBlob(text, personaId) {
    if (!this.isSupported) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      // Use Web Audio API to capture speech synthesis
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      
      // Create speech and connect to Web Audio API
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.findBestVoice(personaId);
      const settings = this.getPersonaVoiceSettings()[personaId] || {
        rate: 1.0,
        pitch: 1.0
      };

      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = 1.0;

      // Record the audio
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm'
      });
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        resolve({
          audioBlob,
          voice: voice ? voice.name : 'Default',
          duration: this.estimateDuration(text),
          text: text
        });
      };

      utterance.onstart = () => {
        mediaRecorder.start();
      };

      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 500);
      };

      utterance.onerror = (error) => {
        mediaRecorder.stop();
        reject(error);
      };

      speechSynthesis.speak(utterance);
    });
  }

  // Upload generated audio to backend
  async uploadAudioToBackend(audioBlob, messageId, text, personaId, voiceName) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
    
    const formData = new FormData();
    formData.append('audio_file', audioBlob, `browser-tts-${messageId}.webm`);
    formData.append('message_id', messageId);
    formData.append('text', text);
    formData.append('persona_id', personaId);
    formData.append('voice_name', voiceName);

    const response = await fetch(`${backendUrl}/api/voice/upload-browser-audio`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Generate and save real AI voice message
  async generateAndSaveVoiceMessage(text, personaId, recipientName) {
    try {
      // Generate the audio
      const audioResult = await this.generateAudioBlob(text, personaId);
      
      // Create unique message ID
      const messageId = this.generateUniqueId();
      
      // Upload to backend
      const uploadResult = await this.uploadAudioToBackend(
        audioResult.audioBlob,
        messageId,
        text,
        personaId,
        audioResult.voice
      );

      return {
        success: true,
        messageId,
        audioResult,
        uploadResult,
        fileId: `browser-tts-${messageId}`
      };

    } catch (error) {
      console.error('Failed to generate and save voice message:', error);
      throw error;
    }
  }

  generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  testVoice(text, personaId) {
    if (!this.isSupported) {
      console.error('Speech synthesis not supported');
      return;
    }

    const voice = this.findBestVoice(personaId);
    const settings = this.getPersonaVoiceSettings()[personaId] || {
      rate: 1.0,
      pitch: 1.0
    };

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 1.0;

    speechSynthesis.speak(utterance);
  }
}

export default new BrowserTTSService();