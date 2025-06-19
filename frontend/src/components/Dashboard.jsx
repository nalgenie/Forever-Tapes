import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Play, 
  Edit, 
  Share2, 
  Users, 
  Clock, 
  Music, 
  MoreHorizontal,
  Link,
  Mail,
  MessageSquare,
  TrendingUp,
  Volume2,
  Sparkles,
  Heart,
  Gift
} from 'lucide-react';
import { mockPodCards, mockUser } from '../mock';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [podCards, setPodCards] = useState(mockPodCards);
  const [user] = useState(mockUser);

  const handleCopyLink = (shareLink) => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link Copied! 📋",
      description: "Share this link with contributors to collect their heartfelt messages.",
    });
  };

  const handleSendEmail = (podCard) => {
    // In real app, this would open email modal or send emails
    toast({
      title: "Email Invitations Sent 📧",
      description: `Invitations have been sent for "${podCard.title}"`,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      collecting: { label: 'Collecting', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      processing: { label: 'Processing', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
      draft: { label: 'Draft', color: 'bg-gray-50 text-gray-700 border-gray-200' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={`${config.color} font-medium border`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = {
    totalCelebrations: podCards.length,
    totalMessages: podCards.reduce((sum, card) => sum + card.currentMessages, 0),
    completedCelebrations: podCards.filter(card => card.status === 'completed').length,
    activeCollections: podCards.filter(card => card.status === 'collecting').length
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">FOREVER TAPES</span>
            </div>
            <Button 
              onClick={() => navigate('/create')}
              className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Celebration
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-none">
            YOUR AUDIO
            <br />
            <span className="italic font-light">Celebrations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your bespoke audio experiences and track contributions from loved ones.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 bg-gray-50 hover:bg-gray-100 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-black text-gray-800 mb-2">{stats.totalCelebrations}</div>
              <div className="text-sm font-medium text-gray-600">Total Celebrations</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gray-50 hover:bg-gray-100 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-black text-blue-600 mb-2">{stats.totalMessages}</div>
              <div className="text-sm font-medium text-gray-600">Messages Collected</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gray-50 hover:bg-gray-100 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-black text-green-600 mb-2">{stats.completedCelebrations}</div>
              <div className="text-sm font-medium text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gray-50 hover:bg-gray-100 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-black text-purple-600 mb-2">{stats.activeCollections}</div>
              <div className="text-sm font-medium text-gray-600">Active Collections</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-gray-100 p-1 rounded-full">
              <TabsTrigger value="active" className="rounded-full px-6 py-2 font-medium">
                Active Celebrations
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full px-6 py-2 font-medium">
                Completed
              </TabsTrigger>
              <TabsTrigger value="drafts" className="rounded-full px-6 py-2 font-medium">
                Drafts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="space-y-6">
            {podCards.filter(card => card.status === 'collecting').map((podCard) => (
              <Card key={podCard.id} className="border-0 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{podCard.title}</CardTitle>
                        {getStatusBadge(podCard.status)}
                      </div>
                      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{podCard.currentMessages} / {podCard.maxMessages} messages</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{podCard.maxMessageDuration} min max per message</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          <span>{podCard.backgroundMusic || 'No music'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <span className="font-mono">Created {formatDate(podCard.createdAt)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>Collection Progress</span>
                      <span>{Math.round((podCard.currentMessages / podCard.maxMessages) * 100)}% Complete</span>
                    </div>
                    <Progress 
                      value={(podCard.currentMessages / podCard.maxMessages) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit/${podCard.id}`)}
                      className="rounded-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(podCard.shareLink)}
                      className="rounded-full"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEmail(podCard)}
                      className="rounded-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invites
                    </Button>
                    {podCard.currentMessages > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listen/${podCard.id}`)}
                        className="rounded-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {podCards.filter(card => card.status === 'collecting').length === 0 && (
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">No Active Celebrations</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create your first audio celebration to start collecting beautiful messages from loved ones.
                  </p>
                  <Button 
                    onClick={() => navigate('/create')}
                    className="bg-black text-white hover:bg-gray-800 rounded-full px-8"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Celebration
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {podCards.filter(card => card.status === 'completed').map((podCard) => (
              <Card key={podCard.id} className="border-0 bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="text-2xl font-bold tracking-tight">{podCard.title}</CardTitle>
                        {getStatusBadge(podCard.status)}
                      </div>
                      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{podCard.currentMessages} messages</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{podCard.totalDuration} min total</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listen/${podCard.id}`)}
                        className="rounded-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(`https://forevertapes.com/listen/${podCard.id}`)}
                        className="rounded-full"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-6">
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Edit className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">No Drafts</h3>
                <p className="text-gray-600">
                  Drafts of unfinished celebrations will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;