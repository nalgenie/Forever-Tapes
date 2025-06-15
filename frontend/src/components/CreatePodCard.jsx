import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { ArrowLeft, Music, Users, Clock, Volume2, Zap, Crown, Star } from 'lucide-react';
import { mockMusicLibrary, mockAPI, pricingTiers } from '../mock';
import { useToast } from '../hooks/use-toast';

const CreatePodCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxMessages: 10,
    maxMessageDuration: 30, // in seconds
    totalDuration: 300, // 5 minutes in seconds
    backgroundMusic: '',
    customMusicFile: null,
    allowLongerMessages: false,
    selectedTier: 'free'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMusicFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        customMusicFile: file,
        backgroundMusic: file.name
      }));
    }
  };

  const handleTierSelection = (tier) => {
    const tierData = pricingTiers.find(t => t.id === tier);
    setFormData(prev => ({
      ...prev,
      selectedTier: tier,
      maxMessages: tierData.maxMessages,
      maxMessageDuration: tierData.maxMessageDuration * 60, // convert to seconds
      totalDuration: tierData.maxDuration * 60 // convert to seconds
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your audio experience.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const podCard = await mockAPI.createPodCard({
        title: formData.title,
        description: formData.description,
        maxMessages: formData.maxMessages,
        maxMessageDuration: formData.maxMessageDuration / 60, // convert back to minutes
        totalDuration: formData.totalDuration / 60, // convert back to minutes
        backgroundMusic: formData.backgroundMusic,
        tier: formData.selectedTier,
        createdBy: 'Current User' // This would come from auth context
      });
      
      toast({
        title: "Experience created",
        description: "Your audio experience is ready for contributors.",
      });
      
      navigate(`/edit/${podCard.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTier = pricingTiers.find(t => t.id === formData.selectedTier);

  // Updated pricing tiers with refined styling
  const updatedPricingTiers = [
    {
      id: 'free',
      name: 'Starter',
      price: 0,
      maxDuration: 5,
      maxMessageDuration: 0.5,
      maxMessages: 10,
      features: ['Basic editing', 'Email delivery', 'Standard quality'],
      description: 'Perfect for trying Forever Tapes'
    },
    {
      id: 'basic',
      name: 'Essential',
      price: 8,
      maxDuration: 10,
      maxMessageDuration: 1,
      maxMessages: 15,
      features: ['Advanced editing', 'Email + SMS', 'High quality', 'Noise reduction'],
      description: 'Great for small gatherings'
    },
    {
      id: 'premium',
      name: 'Professional',
      price: 18,
      maxDuration: 20,
      maxMessageDuration: 2,
      maxMessages: 25,
      features: ['Pro editing suite', 'Custom branding', 'Priority support', 'Analytics'],
      description: 'Perfect for special occasions'
    },
    {
      id: 'unlimited',
      name: 'Complete',
      price: 28,
      maxDuration: 60,
      maxMessageDuration: 5,
      maxMessages: 50,
      features: ['Unlimited features', 'White-label', 'Dedicated support', 'Custom options'],
      description: 'For the most important moments'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="hover:bg-gray-50 text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
                  <Volume2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-base font-medium text-gray-900">Forever Tapes</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight leading-tight text-gray-900">
            Create your
            <br />
            <span className="italic">audio experience</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            Craft a meaningful audio collection that captures voices, emotions, and memories from the people who matter most.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          {/* Step 1: Choose Your Plan */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 mb-4 block tracking-wider">{'{ 01 }'}</span>
              <h2 className="text-2xl font-light mb-4 tracking-tight text-gray-900">Choose your plan</h2>
              <p className="text-gray-600 max-w-xl mx-auto font-light">
                Select the perfect tier for your experience. Start free or unlock advanced features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {updatedPricingTiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg border ${
                    formData.selectedTier === tier.id 
                      ? 'border-gray-900 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTierSelection(tier.id)}
                >
                  <CardHeader className="text-center p-6 pb-4">
                    <CardTitle className="text-base font-medium mb-2 text-gray-900">{tier.name}</CardTitle>
                    <div className="text-2xl font-light mb-2 text-gray-900">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </div>
                    <p className="text-xs text-gray-600 font-light">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-1 text-xs text-gray-600 mb-4 font-light">
                      <div>• Up to {tier.maxDuration} min total</div>
                      <div>• {tier.maxMessageDuration} min per message</div>
                      <div>• {tier.maxMessages} contributors max</div>
                    </div>
                    
                    <div className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="text-xs text-gray-600 font-light">
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Step 2: Basic Details */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 mb-4 block tracking-wider">{'{ 02 }'}</span>
              <h2 className="text-2xl font-light mb-4 tracking-tight text-gray-900">Experience details</h2>
              <p className="text-gray-600 max-w-xl mx-auto font-light">
                Give your audio experience a meaningful title and description to guide contributors.
              </p>
            </div>

            <Card className="border border-gray-200">
              <CardContent className="p-8 space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-900">Experience title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Birthday Messages for Sarah"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-2 border-gray-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-900">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell contributors what this experience is for and what kind of message you'd like them to share..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-2 border-gray-200"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Audio Settings */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 mb-4 block tracking-wider">{'{ 03 }'}</span>
              <h2 className="text-2xl font-light mb-4 tracking-tight text-gray-900">Audio configuration</h2>
              <p className="text-gray-600 max-w-xl mx-auto font-light">
                Configure the parameters for your audio experience.
              </p>
            </div>

            <Card className="border border-gray-200">
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-sm font-medium mb-4 block text-gray-900">
                      Contributors: {formData.maxMessages}
                    </Label>
                    <Slider
                      value={[formData.maxMessages]}
                      onValueChange={(value) => handleInputChange('maxMessages', value[0])}
                      max={selectedTier?.maxMessages || 50}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2 font-light">
                      How many people can contribute to this experience
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-4 block text-gray-900">
                      Message length: {Math.floor(formData.maxMessageDuration / 60)}:{(formData.maxMessageDuration % 60).toString().padStart(2, '0')}
                    </Label>
                    <Slider
                      value={[formData.maxMessageDuration]}
                      onValueChange={(value) => handleInputChange('maxMessageDuration', value[0])}
                      max={selectedTier?.maxMessageDuration * 60 || 300}
                      min={15}
                      step={15}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-2 font-light">
                      Maximum duration for each individual message
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  <Switch
                    id="longer-messages"
                    checked={formData.allowLongerMessages}
                    onCheckedChange={(checked) => handleInputChange('allowLongerMessages', checked)}
                  />
                  <Label htmlFor="longer-messages" className="text-sm font-light text-gray-700">
                    Allow contributors to request longer message duration
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 4: Background Music */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 mb-4 block tracking-wider">{'{ 04 }'}</span>
              <h2 className="text-2xl font-light mb-4 tracking-tight text-gray-900">Background audio</h2>
              <p className="text-gray-600 max-w-xl mx-auto font-light">
                Add subtle background audio to enhance your experience.
              </p>
            </div>

            <Card className="border border-gray-200">
              <CardContent className="p-8 space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-4 block text-gray-900">Choose from library</Label>
                  <select 
                    value={formData.backgroundMusic} 
                    onChange={(e) => handleInputChange('backgroundMusic', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
                  >
                    <option value="">No background audio</option>
                    {mockMusicLibrary.map((music) => (
                      <option key={music.id} value={music.title}>
                        {music.title} - {music.artist} ({Math.floor(music.duration/60)}:{(music.duration%60).toString().padStart(2, '0')})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <Label htmlFor="custom-music" className="text-sm font-medium mb-4 block text-gray-900">
                    Upload your own audio
                  </Label>
                  <Input
                    id="custom-music"
                    type="file"
                    accept="audio/mp3,audio/wav,audio/aiff"
                    onChange={handleMusicFileUpload}
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-600 mt-2 font-light">
                    Supported formats: MP3, WAV, AIFF (max 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit */}
          <div className="text-center pt-8">
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-normal"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 font-normal"
              >
                {loading ? 'Creating...' : `Create experience ${selectedTier?.price > 0 ? `($${selectedTier.price})` : '(Free)'}`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePodCard;