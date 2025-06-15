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
  TrendingUp
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
      title: "Link Copied!",
      description: "Share this link with contributors to collect their messages.",
    });
  };

  const handleSendEmail = (podCard) => {
    // In real app, this would open email modal or send emails
    toast({
      title: "Email Invitations",
      description: `Email invitations would be sent for "${podCard.title}"`,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      collecting: { label: 'Collecting', color: 'bg-blue-100 text-blue-800' },
      processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={`${config.color} border-0`}>
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
    totalPodCards: podCards.length,
    totalMessages: podCards.reduce((sum, card) => sum + card.currentMessages, 0),
    completedPodCards: podCards.filter(card => card.status === 'completed').length,
    activeCollections: podCards.filter(card => card.status === 'collecting').length
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your pod-cards and track contributions
            </p>
          </div>
          <Button 
            onClick={() => navigate('/create')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Pod-Card
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalPodCards}</div>
              <div className="text-sm text-gray-600">Total Pod-Cards</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
              <div className="text-sm text-gray-600">Messages Collected</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completedPodCards}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.activeCollections}</div>
              <div className="text-sm text-gray-600">Active Collections</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="active">Active Pod-Cards</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {podCards.filter(card => card.status === 'collecting').map((podCard) => (
              <Card key={podCard.id} className="border-0 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{podCard.title}</CardTitle>
                        {getStatusBadge(podCard.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {podCard.currentMessages} / {podCard.maxMessages} messages
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {podCard.maxMessageDuration} min max
                        </div>
                        <div className="flex items-center gap-1">
                          <Music className="w-4 h-4" />
                          {podCard.backgroundMusic || 'No music'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      Created {formatDate(podCard.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Collection Progress</span>
                      <span>{Math.round((podCard.currentMessages / podCard.maxMessages) * 100)}%</span>
                    </div>
                    <Progress value={(podCard.currentMessages / podCard.maxMessages) * 100} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit/${podCard.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(podCard.shareLink)}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEmail(podCard)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invites
                    </Button>
                    {podCard.currentMessages > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listen/${podCard.id}`)}
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
              <Card className="border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">No Active Pod-Cards</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first pod-card to start collecting beautiful audio messages.
                  </p>
                  <Button 
                    onClick={() => navigate('/create')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pod-Card
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {podCards.filter(card => card.status === 'completed').map((podCard) => (
              <Card key={podCard.id} className="border-0 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{podCard.title}</CardTitle>
                        {getStatusBadge(podCard.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {podCard.currentMessages} messages
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {podCard.totalDuration} min total
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listen/${podCard.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(`https://podcard.app/listen/${podCard.id}`)}
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

          <TabsContent value="drafts" className="space-y-4">
            <Card className="border-0 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Edit className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">No Drafts</h3>
                <p className="text-gray-600">
                  Drafts of unfinished pod-cards will appear here.
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