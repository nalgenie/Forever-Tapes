import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ArrowLeft, Gift, Share2, Clock, Users, Crown, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const CreateFreeMemory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    occasion: 'birthday'
  });

  const occasions = [
    { id: 'birthday', name: 'Birthday', emoji: '🎂' },
    { id: 'anniversary', name: 'Anniversary', emoji: '💕' },
    { id: 'graduation', name: 'Graduation', emoji: '🎓' },
    { id: 'farewell', name: 'Farewell', emoji: '👋' },
    { id: 'celebration', name: 'Celebration', emoji: '🎉' },
    { id: 'thank-you', name: 'Thank You', emoji: '🙏' },
    { id: 'other', name: 'Other', emoji: '💝' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your memory.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Call the free memory creation endpoint
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured. Please check environment variables.');
      }
      const response = await fetch(`${backendUrl}/api/podcards/free`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          occasion: formData.occasion
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create memory');
      }

      const result = await response.json();
      
      toast({
        title: "Memory created successfully!",
        description: "Your free memory is ready to collect messages.",
        variant: "default"
      });

      // Navigate to a success page with share information
      navigate(`/free-memory-created/${result.id}`, { 
        state: { 
          memory: result,
          shareUrl: `${window.location.origin}/contribute/${result.id}`
        } 
      });
      
    } catch (error) {
      console.error('Error creating memory:', error);
      toast({
        title: "Error creating memory",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create a Free Memory
            </h1>
            <p className="text-lg text-gray-600">
              Start collecting heartfelt audio messages instantly
            </p>
            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
              <Gift className="w-3 h-3 mr-1" />
              Free • No Sign Up Required
            </Badge>
          </div>
        </div>

        {/* Main Form */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-900">Memory Details</CardTitle>
            <p className="text-gray-600">Tell us about the memory you want to create</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold text-gray-700">
                  Memory Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Sarah's Birthday Messages"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="text-base border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500">
                  This will be displayed to people contributing messages
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell contributors what kind of messages you're looking for..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="text-base border-gray-200 focus:border-purple-300 focus:ring-purple-200 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500">
                  Help people understand what kind of messages to record
                </p>
              </div>

              {/* Occasion */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Occasion
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {occasions.map((occasion) => (
                    <button
                      key={occasion.id}
                      type="button"
                      onClick={() => handleInputChange('occasion', occasion.id)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.occasion === occasion.id
                          ? 'border-purple-400 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">{occasion.emoji}</div>
                      <div className="text-sm font-medium">{occasion.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Tier Features */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                  <Gift className="w-4 h-4 mr-2" />
                  What's included (Free)
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li className="flex items-center">
                    <Clock className="w-3 h-3 mr-2" />
                    Up to 10 audio messages
                  </li>
                  <li className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    30 seconds per message
                  </li>
                  <li className="flex items-center">
                    <Share2 className="w-3 h-3 mr-2" />
                    Shareable link for 30 days
                  </li>
                </ul>
              </div>

              {/* Upgrade Hint */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Want more features?
                </h3>
                <p className="text-sm text-purple-700 mb-3">
                  Sign up for unlimited messages, longer recordings, dashboard management, and more!
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth/login')}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Upgrade to Premium
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating your memory...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Create Free Memory
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            No sign up required • Your memory will be available for 30 days
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateFreeMemory;
