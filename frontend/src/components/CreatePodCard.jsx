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
import { ArrowLeft, Music, Users, Clock, Zap, Crown, Star, Volume2, Sparkles } from 'lucide-react';
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
        title: "Title Required",
        description: "Please enter a title for your audio celebration.",
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
        title: "Audio Celebration Created! 🎉",
        description: "Your celebration is ready for contributors. Share the link to start collecting voices!",
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

  // Updated pricing tiers with new branding
  const updatedPricingTiers = [
    {
      id: 'free',
      name: 'First Celebration',
      price: 0,
      maxDuration: 5,
      maxMessageDuration: 0.5,
      maxMessages: 10,
      features: ['Basic editing', 'Email delivery', 'Standard quality'],
      icon: <Sparkles className="w-8 h-8 text-green-600" />,
      description: 'Perfect for trying Forever Tapes'
    },
    {
      id: 'basic',
      name: 'Essential',
      price: 8,
      maxDuration: 10,
      maxMessageDuration: 1,
      maxMessages: 15,
      features: ['Advanced editing', 'Email + SMS delivery', 'HD audio quality', 'Noise reduction'],
      icon: <Users className="w-8 h-8 text-blue-600" />,
      description: 'Great for small gatherings'
    },
    {
      id: 'premium',
      name: 'Professional',
      price: 18,
      maxDuration: 20,
      maxMessageDuration: 2,
      maxMessages: 25,
      features: ['Pro editing suite', 'Custom branding', 'Priority support', 'Analytics dashboard'],
      icon: <Star className="w-8 h-8 text-purple-600" />,
      description: 'Perfect for special occasions'
    },
    {
      id: 'unlimited',
      name: 'Signature',
      price: 28,
      maxDuration: 60,
      maxMessageDuration: 5,
      maxMessages: 50,
      features: ['Unlimited everything', 'White-label option', 'Dedicated support', 'Custom features'],
      icon: <Crown className="w-8 h-8 text-gold-600" />,
      description: 'For the most special moments'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">FOREVER TAPES</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-none">
            CREATE YOUR
            <br />
            <span className="italic font-light">Audio Celebration</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Craft a bespoke audio experience that captures voices, emotions, and memories from the people who matter most.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Step 1: Choose Your Plan */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-sm font-mono text-gray-400 mb-4 block">{ 01 }</span>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">CHOOSE YOUR PLAN</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Select the perfect tier for your celebration. Start free or unlock advanced features for special occasions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {updatedPricingTiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                    formData.selectedTier === tier.id 
                      ? 'border-black shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTierSelection(tier.id)}
                >
                  <CardHeader className="text-center p-6">
                    <div className="mb-4">
                      {tier.icon}
                    </div>
                    <CardTitle className="text-lg font-bold mb-2">{tier.name}</CardTitle>
                    <div className="text-3xl font-black mb-2">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </div>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• Up to {tier.maxDuration} min total</div>
                      <div>• {tier.maxMessageDuration} min per message</div>
                      <div>• {tier.maxMessages} contributors max</div>
                    </div>
                    
                    <div className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs mr-1">
                          {feature}
                        </Badge>
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
              <span className="text-sm font-mono text-gray-400 mb-4 block">{ 02 }</span>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">CELEBRATION DETAILS</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Give your audio celebration a meaningful title and description to guide your contributors.
              </p>
            </div>

            <Card className="border-0 bg-gray-50">
              <CardContent className="p-8 space-y-6">
                <div>
                  <Label htmlFor="title" className="text-lg font-semibold">Celebration Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Birthday Wishes for Sarah"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-3 h-12 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell contributors what this celebration is for and what kind of message you'd like them to share..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-3"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Audio Settings */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-sm font-mono text-gray-400 mb-4 block">{ 03 }</span>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">AUDIO CONFIGURATION</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Fine-tune the parameters for your audio celebration to match your vision.
              </p>
            </div>

            <Card className="border-0 bg-gray-50">
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
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
                    <p className="text-sm text-gray-600 mt-2">
                      How many people can contribute to this celebration
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Message Length: {Math.floor(formData.maxMessageDuration / 60)}:{(formData.maxMessageDuration % 60).toString().padStart(2, '0')}
                    </Label>
                    <Slider
                      value={[formData.maxMessageDuration]}
                      onValueChange={(value) => handleInputChange('maxMessageDuration', value[0])}
                      max={selectedTier?.maxMessageDuration * 60 || 300}
                      min={15}
                      step={15}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Maximum duration for each individual message
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <Switch
                    id="longer-messages"
                    checked={formData.allowLongerMessages}
                    onCheckedChange={(checked) => handleInputChange('allowLongerMessages', checked)}
                  />
                  <Label htmlFor="longer-messages" className="font-medium">
                    Allow contributors to request longer message duration
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 4: Background Music */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-sm font-mono text-gray-400 mb-4 block">{ 04 }</span>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">BACKGROUND MUSIC</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Add the perfect soundtrack to enhance the emotional impact of your audio celebration.
              </p>
            </div>

            <Card className="border-0 bg-gray-50">
              <CardContent className="p-8 space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Choose from Music Library</Label>
                  <select 
                    value={formData.backgroundMusic} 
                    onChange={(e) => handleInputChange('backgroundMusic', e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-lg"
                  >
                    <option value="">No background music</option>
                    {mockMusicLibrary.map((music) => (
                      <option key={music.id} value={music.title}>
                        {music.title} - {music.artist} ({Math.floor(music.duration/60)}:{(music.duration%60).toString().padStart(2, '0')})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <Label htmlFor="custom-music" className="text-lg font-semibold mb-4 block">
                    Or Upload Your Own Music
                  </Label>
                  <Input
                    id="custom-music"
                    type="file"
                    accept="audio/mp3,audio/wav,audio/aiff"
                    onChange={handleMusicFileUpload}
                    className="h-12"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Supported formats: MP3, WAV, AIFF (max 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit */}
          <div className="text-center pt-8">
            <div className="flex justify-center gap-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="px-8 py-3 text-lg rounded-full border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800 px-12 py-3 text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                {loading ? 'Creating...' : `Create Celebration ${selectedTier?.price > 0 ? `($${selectedTier.price})` : '(Free)'}`}
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePodCard;