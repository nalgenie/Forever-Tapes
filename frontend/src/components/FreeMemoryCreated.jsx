import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  Sparkles,
  Crown,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const FreeMemoryCreated = () => {
  const navigate = useNavigate();
  const { memoryId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Get memory data from navigation state
  const memory = location.state?.memory;
  const shareUrl = location.state?.shareUrl || `${window.location.origin}/contribute/${memoryId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with people to collect their messages.",
        variant: "default"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: memory?.title || 'Forever Tapes Memory',
          text: `Add your voice to this memory: ${memory?.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        handleCopyLink();
      }
    } else {
      handleCopyLink();
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
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Memory Created Successfully! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your free memory is ready to collect heartfelt messages
          </p>
          <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
            <Gift className="w-3 h-3 mr-1" />
            Free Memory Active
          </Badge>
        </div>

        {/* Memory Details */}
        {memory && (
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">{memory.title}</CardTitle>
              {memory.description && (
                <p className="text-gray-600 mt-2">{memory.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Memory Details
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Available for 30 days</li>
                  <li>• Up to 10 audio messages</li>
                  <li>• 30 seconds per message</li>
                  <li>• Messages can be listened to once collected</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Link */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900 flex items-center justify-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share Your Memory
            </CardTitle>
            <p className="text-gray-600">Send this link to collect messages</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-gray-50 border-gray-200 text-gray-600"
                />
                <Button
                  onClick={handleCopyLink}
                  className="px-4"
                  variant={copied ? "default" : "outline"}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
                <Button
                  onClick={() => window.open(shareUrl, '_blank')}
                  variant="outline"
                  className="px-4"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold text-gray-900 mb-1">Listen to Messages</h3>
              <p className="text-sm text-gray-600 mb-3">
                Check back later to hear the messages
              </p>
              <Button
                onClick={() => navigate(`/listen/${memoryId}`)}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Listen Now
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold text-gray-900 mb-1">Add Your Message</h3>
              <p className="text-sm text-gray-600 mb-3">
                Be the first to contribute
              </p>
              <Button
                onClick={() => navigate(`/contribute/${memoryId}`)}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Contribute
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Hint */}
        <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              Love creating memories?
            </h3>
            <p className="text-purple-700 mb-4">
              Sign up for unlimited memories, longer recordings, dashboard management, and more premium features!
            </p>
            <Button
              onClick={() => navigate('/auth/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            This free memory will be available for 30 days. Save the link to access it later!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreeMemoryCreated;