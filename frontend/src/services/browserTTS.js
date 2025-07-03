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

export default new BrowserTTSService();
