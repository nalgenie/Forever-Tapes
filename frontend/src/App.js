import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// === COMPONENTS ===

const Home = () => {
  const [podcards, setPodcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPodcards();
  }, []);

  const fetchPodcards = async () => {
    try {
      const response = await axios.get(`${API}/podcards`);
      setPodcards(response.data);
    } catch (error) {
      console.error('Error fetching podcards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">forever tapes</h1>
          <p className="text-lg text-gray-600">Collective Audio Archives for Shared Memories</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 justify-center">
            <a href="/create" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Create New Memory
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Memories</h2>
          {loading ? (
            <p className="text-gray-500">Loading memories...</p>
          ) : podcards.length === 0 ? (
            <p className="text-gray-500">No memories created yet. Be the first to create one!</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {podcards.map(podcard => (
                <div key={podcard.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{podcard.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{podcard.description}</p>
                  <p className="text-blue-500 text-sm mb-2">Occasion: {podcard.occasion}</p>
                  <p className="text-gray-500 text-xs mb-3">
                    {podcard.audio_messages.length} message{podcard.audio_messages.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <a 
                      href={`/contribute/${podcard.id}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Add Message
                    </a>
                    <a 
                      href={`/listen/${podcard.id}`}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Listen
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreatePodCard = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    occasion: '',
    creator_name: '',
    creator_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/podcards`, formData);
      setSuccess(true);
      console.log('PodCard created:', response.data);
      // Redirect to contribute page after 2 seconds
      setTimeout(() => {
        window.location.href = `/contribute/${response.data.id}`;
      }, 2000);
    } catch (error) {
      console.error('Error creating podcard:', error);
      alert('Error creating memory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Memory Created! 🎉</h2>
          <p className="text-gray-600">Redirecting to add your first message...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Memory</h1>
          <p className="text-gray-600">Start a collaborative audio memory for someone special</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Sarah's 30th Birthday"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tell people what this memory is about..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occasion *
              </label>
              <select
                required
                value={formData.occasion}
                onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select occasion...</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="graduation">Graduation</option>
                <option value="wedding">Wedding</option>
                <option value="retirement">Retirement</option>
                <option value="memorial">Memorial</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.creator_name}
                onChange={(e) => setFormData({...formData, creator_name: e.target.value})}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.creator_email}
                onChange={(e) => setFormData({...formData, creator_email: e.target.value})}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <a 
                href="/"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-semibold text-center transition-colors"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Creating...' : 'Create Memory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ContributeAudio = ({ podcard_id }) => {
  const [podcard, setPodcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Choose method, 2: Record/Upload, 3: Preview, 4: Submit
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [recordingMethod, setRecordingMethod] = useState(null); // 'record' or 'upload'
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPodcard();
  }, [podcard_id]);

  const fetchPodcard = async () => {
    try {
      const response = await axios.get(`${API}/podcards/${podcard_id}`);
      setPodcard(response.data);
    } catch (error) {
      console.error('Error fetching podcard:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setStep(3);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setStep(3);
    } else {
      alert('Please select an audio file.');
    }
  };

  const submitAudio = async () => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('contributor_name', contributorName);
      formData.append('contributor_email', contributorEmail);
      
      if (recordingMethod === 'record' && audioBlob) {
        formData.append('audio_file', audioBlob, 'recording.wav');
      } else if (recordingMethod === 'upload' && audioFile) {
        formData.append('audio_file', audioFile);
      }

      await axios.post(`${API}/podcards/${podcard_id}/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStep(4);
    } catch (error) {
      console.error('Error submitting audio:', error);
      alert('Error submitting your message. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (!podcard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Memory Not Found</h2>
          <p className="text-gray-600 mb-4">The memory you're looking for doesn't exist.</p>
          <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Your Message</h1>
          <h2 className="text-xl text-blue-600 mb-2">{podcard.title}</h2>
          <p className="text-gray-600">{podcard.description}</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Progress indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className={`flex items-center ${num <= step ? 'text-blue-500' : 'text-gray-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${num <= step ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                  {num}
                </div>
                {num < 4 && <div className={`h-1 w-16 mx-2 ${num < step ? 'bg-blue-500' : 'bg-gray-300'}`}></div>}
              </div>
            ))}
          </div>

          {/* Step 1: Contributor Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Who are you?</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email (optional)</label>
                <input
                  type="email"
                  value={contributorEmail}
                  onChange={(e) => setContributorEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!contributorName.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Choose recording method */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">How would you like to add your message?</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRecordingMethod('record');
                    startRecording();
                  }}
                  className="p-6 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-green-500 text-4xl mb-2">🎤</div>
                  <h4 className="font-semibold mb-2">Record Now</h4>
                  <p className="text-sm text-gray-600">Record directly in your browser</p>
                </button>

                <div className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                  <div className="text-blue-500 text-4xl mb-2">📁</div>
                  <h4 className="font-semibold mb-2">Upload File</h4>
                  <p className="text-sm text-gray-600 mb-3">Upload from your device</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {isRecording && (
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <div className="text-red-500 text-4xl mb-2">🔴</div>
                  <h4 className="font-semibold text-red-600 mb-2">Recording...</h4>
                  <p className="text-gray-600 mb-4">Speak your message now</p>
                  <button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Stop Recording
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep(1)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Preview Your Message</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><strong>From:</strong> {contributorName}</p>
                {contributorEmail && <p className="mb-4"><strong>Email:</strong> {contributorEmail}</p>}
                
                <div className="mb-4">
                  <strong>Audio Preview:</strong>
                  <audio
                    controls
                    className="w-full mt-2"
                    src={recordingMethod === 'record' ? URL.createObjectURL(audioBlob) : audioFile ? URL.createObjectURL(audioFile) : ''}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep(2);
                    setAudioBlob(null);
                    setAudioFile(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-semibold"
                >
                  Re-record
                </button>
                <button
                  onClick={submitAudio}
                  disabled={uploading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-semibold"
                >
                  {uploading ? 'Submitting...' : 'Submit Message'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-semibold text-green-600 mb-4">Message Added!</h3>
              <p className="text-gray-600 mb-6">Thank you for contributing to this memory.</p>
              <div className="flex gap-4 justify-center">
                <a
                  href={`/listen/${podcard_id}`}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Listen to Memory
                </a>
                <a
                  href="/"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Browse More
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ListenToPodCard = ({ podcard_id }) => {
  const [podcard, setPodcard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPodcard();
  }, [podcard_id]);

  const fetchPodcard = async () => {
    try {
      const response = await axios.get(`${API}/podcards/${podcard_id}`);
      setPodcard(response.data);
    } catch (error) {
      console.error('Error fetching podcard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (!podcard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Memory Not Found</h2>
          <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{podcard.title}</h1>
          <p className="text-gray-600 mb-2">{podcard.description}</p>
          <p className="text-blue-500">Occasion: {podcard.occasion}</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {podcard.audio_messages.length} Message{podcard.audio_messages.length !== 1 ? 's' : ''}
          </h2>
          
          {podcard.audio_messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No messages yet. Be the first to contribute!</p>
              <a
                href={`/contribute/${podcard_id}`}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Add Your Message
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {podcard.audio_messages.map((message, index) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{message.contributor_name}</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-blue-500 text-sm">Message #{index + 1}</span>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    src={`${API}/audio/${message.file_path.split('/').pop().split('.')[0]}`}
                  />
                </div>
              ))}
              
              <div className="text-center pt-4">
                <a
                  href={`/contribute/${podcard_id}`}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold mr-4"
                >
                  Add Your Message
                </a>
                <a
                  href="/"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Browse More
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === MAIN APP ===

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePodCard />} />
          <Route path="/contribute/:podcard_id" element={
            <ContributeAudio podcard_id={window.location.pathname.split('/')[2]} />
          } />
          <Route path="/listen/:podcard_id" element={
            <ListenToPodCard podcard_id={window.location.pathname.split('/')[2]} />
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;