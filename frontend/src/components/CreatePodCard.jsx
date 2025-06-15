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
import { ArrowLeft, Music, Users, Clock, Zap, Crown, Star } from 'lucide-react';
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
        description: "Please enter a title for your pod-card.",
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
        title: "Pod-Card Created! 🎉",
        description: "Your pod-card is ready for contributors. Share the link to start collecting messages!",
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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Create Your Pod-Card
            </h1>
            <p className="text-gray-600 mt-1">
              Set up your audio greeting card in a few simple steps
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pricing Tier Selection */}
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Choose Your Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pricingTiers.map((tier) => (
                  <Card 
                    key={tier.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      formData.selectedTier === tier.id 
                        ? 'ring-2 ring-purple-500 bg-purple-50/50' 
                        : 'hover:shadow-lg bg-white/30'
                    }`}
                    onClick={() => handleTierSelection(tier.id)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        {tier.id === 'free' && <Zap className="w-8 h-8 mx-auto mb-2 text-green-600" />}
                        {tier.id === 'basic' && <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />}
                        {tier.id === 'premium' && <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />}
                        {tier.id === 'unlimited' && <Crown className="w-8 h-8 mx-auto mb-2 text-gold-600" />}
                        
                        <h3 className="font-bold text-lg mb-1">{tier.name}</h3>
                        <div className="text-2xl font-bold mb-3">
                          {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Up to {tier.maxDuration} min total</div>
                          <div>{tier.maxMessageDuration} min per message</div>
                          <div>{tier.maxMessages} messages max</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedTier && (
                <div className="mt-6 p-4 bg-purple-50/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Included Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTier.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/50">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Pod-Card Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Birthday Wishes for Sarah"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell contributors what this pod-card is for..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Maximum Messages: {formData.maxMessages}</Label>
                <Slider
                  value={[formData.maxMessages]}
                  onValueChange={(value) => handleInputChange('maxMessages', value[0])}
                  max={selectedTier?.maxMessages || 50}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-gray-600 mt-1">
                  How many people can contribute messages
                </div>
              </div>
              
              <div>
                <Label>Message Duration Limit: {Math.floor(formData.maxMessageDuration / 60)}:{(formData.maxMessageDuration % 60).toString().padStart(2, '0')}</Label>
                <Slider
                  value={[formData.maxMessageDuration]}
                  onValueChange={(value) => handleInputChange('maxMessageDuration', value[0])}
                  max={selectedTier?.maxMessageDuration * 60 || 300}
                  min={15}
                  step={15}
                  className="mt-2"
                />
                <div className="text-sm text-gray-600 mt-1">
                  Maximum length for each individual message
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="longer-messages"
                  checked={formData.allowLongerMessages}
                  onCheckedChange={(checked) => handleInputChange('allowLongerMessages', checked)}
                />
                <Label htmlFor="longer-messages">Allow contributors to request longer messages</Label>
              </div>
            </CardContent>
          </Card>

          {/* Background Music */}
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Background Music
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Choose from Music Library</Label>
                <select 
                  value={formData.backgroundMusic} 
                  onChange={(e) => handleInputChange('backgroundMusic', e.target.value)}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm mt-2"
                >
                  <option value="">No background music</option>
                  {mockMusicLibrary.map((music) => (
                    <option key={music.id} value={music.title}>
                      {music.title} - {music.artist} ({Math.floor(music.duration/60)}:{(music.duration%60).toString().padStart(2, '0')})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="custom-music">Or Upload Your Own Music</Label>
                <Input
                  id="custom-music"
                  type="file"
                  accept="audio/mp3,audio/wav,audio/aiff"
                  onChange={handleMusicFileUpload}
                  className="mt-2"
                />
                <div className="text-sm text-gray-600 mt-1">
                  Supported formats: MP3, WAV, AIFF
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
            >
              {loading ? 'Creating...' : `Create Pod-Card ${selectedTier?.price > 0 ? `($${selectedTier.price})` : '(Free)'}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePodCard;