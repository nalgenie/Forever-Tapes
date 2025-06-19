import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Mail, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useToast } from '../../hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestMagicLink, register } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1: Email, 2: Magic link sent, 3: Register form
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/dashboard';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestMagicLink(email);
      setStep(2);
      toast({
        title: "Magic link sent! ✨",
        description: "Check your email for a sign-in link.",
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // User doesn't exist, show registration form
        setStep(3);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({ email, name, phone });
      toast({
        title: "Welcome to Forever Tapes! 🎉",
        description: "Your account has been created.",
      });
      navigate(from, { replace: true });
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="back-button mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 3 ? 'Create your account' : 'Sign in to Forever Tapes'}
          </h1>
          <p className="text-gray-600">
            {step === 3 
              ? 'Join us to start creating beautiful audio memories'
              : 'Access your audio memories and create new ones'
            }
          </p>
        </div>

        {/* Step 1: Email Entry */}
        {step === 1 && (
          <Card className="gradient-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-900">Enter your email</CardTitle>
              <p className="text-sm text-gray-600">
                We'll send you a magic link to sign in securely
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800"
                >
                  {loading ? (
                    'Sending magic link...'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Send magic link
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Magic Link Sent */}
        {step === 2 && (
          <Card className="gradient-card">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a magic link to <strong>{email}</strong>. 
                Click the link in your email to sign in securely.
              </p>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  The link will expire in 1 hour
                </p>
                
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-full"
                >
                  Use a different email
                </Button>
                
                <Button
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800"
                >
                  Resend magic link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Registration Form */}
        {step === 3 && (
          <Card className="gradient-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-900">Complete your profile</CardTitle>
              <p className="text-sm text-gray-600">
                Just a few details to get you started
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-email" className="text-gray-700">Email address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-gray-700">Full name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;