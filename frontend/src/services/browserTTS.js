/**
 * Browser Text-to-Speech Service using Web Speech API
 * Generates real AI voices for Forever Tapes testing
 */

class BrowserTTSService {
  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.voices = [];
    this.voicesLoaded = false;
    this.voiceLoadPromise = null;
    
    if (this.isSupported) {
      this.initializeVoices();
    }
  }

  async initializeVoices() {
    // Some browsers need a delay or user interaction before voices load
    const loadVoices = () => {
      return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.voices = voices;
          this.voicesLoaded = true;
          console.log('🎙️ Loaded voices:', voices.map(v => `${v.name} (${v.lang})`));
          resolve(voices);
        } else {
          // Voices not loaded yet, set up listener
          speechSynthesis.onvoiceschanged = () => {
            const newVoices = speechSynthesis.getVoices();
            if (newVoices.length > 0) {
              this.voices = newVoices;
              this.voicesLoaded = true;
              console.log('🎙️ Loaded voices (async):', newVoices.map(v => `${v.name} (${v.lang})`));
              resolve(newVoices);
            }
          };
          
          // Fallback timeout
          setTimeout(() => {
            const fallbackVoices = speechSynthesis.getVoices();
            this.voices = fallbackVoices;
            this.voicesLoaded = fallbackVoices.length > 0;
            console.log('🎙️ Fallback voices:', fallbackVoices.map(v => `${v.name} (${v.lang})`));
            resolve(fallbackVoices);
          }, 2000);
        }
      });
    };

    this.voiceLoadPromise = loadVoices();
    return this.voiceLoadPromise;
  }

  async ensureVoicesLoaded() {
    if (this.voicesLoaded) {
      return this.voices;
    }
    
    if (this.voiceLoadPromise) {
      return await this.voiceLoadPromise;
    }
    
    return await this.initializeVoices();
  }

  async getEnglishVoices() {
    await this.ensureVoicesLoaded();
    
    const englishVoices = this.voices.filter(voice => {
      const lang = voice.lang.toLowerCase();
      return lang.startsWith('en-') || lang === 'en';
    });

    console.log('🇬🇧 English voices found:', englishVoices.length);
    
    return englishVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: this.guessGender(voice.name),
      localService: voice.localService,
      voiceURI: voice.voiceURI
    }));
  }

  guessGender(voiceName) {
    const name = voiceName.toLowerCase();
    const femaleIndicators = ['female', 'woman', 'samantha', 'zira', 'helena', 'monica', 'catherine', 'karen', 'siri', 'susan', 'victoria', 'allison'];
    const maleIndicators = ['male', 'man', 'david', 'alex', 'george', 'daniel', 'sean', 'ravi', 'tom', 'thomas', 'james'];
    
    if (femaleIndicators.some(indicator => name.includes(indicator))) return 'female';
    if (maleIndicators.some(indicator => name.includes(indicator))) return 'male';
    return 'unknown';
  }

  async testVoice(text, voiceName) {
    if (!this.isSupported) {
      throw new Error('Speech synthesis not supported');
    }

    await this.ensureVoicesLoaded();
    
    const voice = this.voices.find(v => v.name === voiceName);
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = reject;
      speechSynthesis.speak(utterance);
    });
  }

  async generateSpeechSimple(text, voiceName) {
    if (!this.isSupported) {
      throw new Error('Speech synthesis not supported');
    }

    await this.ensureVoicesLoaded();
    
    const voice = this.voices.find(v => v.name === voiceName);
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
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

  // Legacy method for compatibility
  getAvailableVoices() {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: this.guessGender(voice.name),
      localService: voice.localService
    }));
  }
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