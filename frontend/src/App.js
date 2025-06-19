import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Import components
import LandingPage from "./components/LandingPage";
import CreatePodCard from "./components/CreatePodCard";
import ContributeAudio from "./components/ContributeAudio";
import EditPodCard from "./components/EditPodCard";
import ListenToPodCard from "./components/ListenToPodCard";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreatePodCard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contribute/:shareId" element={<ContributeAudio />} />
          <Route path="/edit/:podCardId" element={<EditPodCard />} />
          <Route path="/listen/:podCardId" element={<ListenToPodCard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;