import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./components/AuthContext";

// Import components
import LandingPage from "./components/LandingPage";
import CreatePodCard from "./components/CreatePodCard";
import CreateFreeMemory from "./components/CreateFreeMemory";
import FreeMemoryCreated from "./components/FreeMemoryCreated";
import ContributeAudio from "./components/ContributeAudio";
import EditPodCard from "./components/EditPodCard";
import ListenToPodCard from "./components/ListenToPodCard";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/Auth/LoginPage";
import VerifyMagicLink from "./components/Auth/VerifyMagicLink";
import ProtectedRoute from "./components/ProtectedRoute";
import IllustrationShowcase from "./components/IllustrationShowcase";
import AboutPage from "./components/AboutPage";
import HowItWorksPage from "./components/HowItWorksPage";
import TestAudioPage from "./components/TestAudioPage";

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/verify" element={<VerifyMagicLink />} />
            <Route path="/contribute/:shareId" element={<ContributeAudio />} />
            <Route path="/listen/:podCardId" element={<ListenToPodCard />} />
            
            {/* Free Memory Routes */}
            <Route path="/create-free" element={<CreateFreeMemory />} />
            <Route path="/free-memory-created/:memoryId" element={<FreeMemoryCreated />} />
            
            {/* Developer Testing Route - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <Route path="/test/audio" element={<TestAudioPage />} />
            )}
            
            {/* Temporary route to view illustration variations */}
            <Route path="/illustrations" element={<IllustrationShowcase />} />
            
            {/* Protected Routes */}
            <Route path="/create" element={
              <ProtectedRoute>
                <CreatePodCard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/edit/:podCardId" element={
              <ProtectedRoute>
                <EditPodCard />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
        
        {/* Toast notifications positioned bottom-left */}
        <div className="alert-bottom-left">
          <Toaster />
        </div>
      </AuthProvider>
    </div>
  );
}

export default App;