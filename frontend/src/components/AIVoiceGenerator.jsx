import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Mic, 
  Play, 
  Square as Stop, 
  Download, 
  Volume2, 
  Settings,
  User,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import browserTTS from '../services/browserTTS';

const AIVoiceGenerator = ({ onAudioGenerated }) => {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [messageText, setMessageText] = useState('');
  const [englishVoices, setEnglishVoices] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load English voices only
    const loadEnglishVoices = async () => {
      if (browserTTS.isSupported) {
        try {
          console.log('🎙️ Loading English voices...');
          const voices = await browserTTS.getEnglishVoices();
          console.log('🎙️ Loaded English voices:', voices.length);
          setEnglishVoices(voices);
        } catch (error) {
          console.error('Failed to load voices:', error);
        }
      }
    };

    loadEnglishVoices();
  }, []);

  const handleGenerateVoice = async () => {
    if (!messageText.trim() || !selectedVoice) {
      toast({
        title: "Missing Information",
        description: "Please select a voice and enter message text",
        variant: "destructive"
      });
      return;
    }

    if (!browserTTS.isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech synthesis is not supported in your browser",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Use the selected voice name directly
      const result = await browserTTS.generateSpeechSimple(messageText, selectedVoice);
      
      setGeneratedAudio({
        voice: selectedVoice,
        text: messageText,
        duration: result.duration
      });

      toast({
        title: "🎉 Voice Generated!",
        description: `Successfully generated speech using ${selectedVoice}`,
      });

      if (onAudioGenerated) {
        onAudioGenerated({
          voice: selectedVoice,
          text: messageText,
          duration: result.duration
        });
      }

    } catch (error) {
      console.error('Voice generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate voice: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestVoice = () => {
    if (!messageText.trim() || !selectedVoice) {
      toast({
        title: "Missing Information",
        description: "Please select a voice and enter message text",
        variant: "destructive"
      });
      return;
    }

    setIsPlaying(true);
    
    try {
      // Create utterance with selected voice
      const utterance = new SpeechSynthesisUtterance(messageText);
      const voice = speechSynthesis.getVoices().find(v => v.name === selectedVoice);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);

    } catch (error) {
      setIsPlaying(false);
      toast({
        title: "Playback Failed",
        description: "Failed to play voice: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleStopVoice = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
          Real AI Voice Generator
        </CardTitle>
        <p className="text-gray-600">Generate actual speech using browser Text-to-Speech API</p>
        <div className="mt-2">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Volume2 className="w-3 h-3 mr-1" />
            Real AI Voices - Browser TTS
          </Badge>
        </div>
        
        {!browserTTS.isSupported && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
            ⚠️ Speech synthesis is not supported in your browser
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Available English Voices */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-1" />
            Available English Voices ({englishVoices.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {englishVoices.slice(0, 6).map((voice, index) => (
              <div key={index} className="bg-gray-50 rounded p-2">
                <div className="font-medium text-gray-800">{voice.name.split(' ')[0]}</div>
                <div className="text-gray-500">{voice.lang}</div>
                {voice.gender !== 'unknown' && (
                  <Badge className="text-xs" variant="outline">{voice.gender}</Badge>
                )}
              </div>
            ))}
            {englishVoices.length > 6 && (
              <div className="bg-gray-50 rounded p-2 text-center text-gray-500">
                +{englishVoices.length - 6} more
              </div>
            )}
          </div>
        </div>

        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select English Voice
          </label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Choose an English voice..." />
            </SelectTrigger>
            <SelectContent>
              {englishVoices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span>{voice.name}</span>
                    <span className="text-xs text-gray-500">({voice.lang})</span>
                    {voice.gender !== 'unknown' && (
                      <Badge className="text-xs" variant="outline">{voice.gender}</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Text
          </label>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Enter the message to be spoken..."
            className="border-gray-300"
            maxLength={200}
          />
          <div className="text-xs text-gray-500 mt-1">
            {messageText.length}/200 characters
            {messageText && (
              <span className="ml-2">
                ~{Math.ceil(browserTTS.estimateDuration(messageText))}s duration
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleTestVoice}
            disabled={!browserTTS.isSupported || !messageText.trim() || !selectedVoice || isPlaying}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                Speaking...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test Voice
              </>
            )}
          </Button>

          {isPlaying && (
            <Button
              onClick={handleStopVoice}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Stop className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}

          <Button
            onClick={handleGenerateVoice}
            disabled={!browserTTS.isSupported || !messageText.trim() || !selectedVoice || isGenerating}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Voice
              </>
            )}
          </Button>
        </div>

        {/* Generated Audio Info */}
        {generatedAudio && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-2">✅ Voice Generated Successfully</h3>
            <div className="text-sm text-green-700">
              <div><strong>Voice Used:</strong> {generatedAudio.voice}</div>
              <div><strong>Duration:</strong> ~{Math.ceil(generatedAudio.duration)}s</div>
              <div><strong>Text:</strong> "{generatedAudio.text}"</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>How it works:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Select an English voice from your browser's available voices</li>
            <li>Enter your message text (up to 200 characters)</li>
            <li>Click "Test Voice" to hear it immediately</li>
            <li>Click "Generate AI Voice" to create the audio message</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIVoiceGenerator;