import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Radio } from 'lucide-react';
import { designSystem } from '../styles/designSystem';

interface SeagullPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

export const SeagullPanel: React.FC<SeagullPanelProps> = ({
  isVisible,
  onClose
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-start voice interaction when panel becomes visible
  useEffect(() => {
    if (isVisible) {
      startVoiceInteraction();
    } else {
      stopVoiceInteraction();
    }

    return () => {
      stopVoiceInteraction();
    };
  }, [isVisible]);

  const startVoiceInteraction = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      // Set up audio analysis for visual feedback
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Set up MediaRecorder for continuous recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          
          // Send audio chunk to backend for real-time processing
          sendAudioChunk(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Final audio blob when recording stops
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        sendFinalAudio(audioBlob);
      };

      // Start recording with time slices for continuous streaming
      mediaRecorder.start(1000); // Send data every 1 second
      setIsRecording(true);
      setConnectionStatus('connected');

      // Start audio level monitoring
      monitorAudioLevel();

    } catch (error) {
      console.error('Error starting voice interaction:', error);
      setConnectionStatus('error');
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert('Microphone access is required for voice interaction. Please allow microphone access and try again.');
      }
    }
  };

  const stopVoiceInteraction = () => {
    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Stop audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setAudioLevel(0);
    setConnectionStatus('connecting');
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
      
      setAudioLevel(normalizedLevel);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const sendAudioChunk = async (audioData: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioData, 'audio-chunk.webm');
      formData.append('timestamp', new Date().toISOString());
      formData.append('type', 'chunk');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-interaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Failed to send audio chunk:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  };

  const sendFinalAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'final-audio.webm');
      formData.append('timestamp', new Date().toISOString());
      formData.append('type', 'final');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-interaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Failed to send final audio:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending final audio:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Content container - centered */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="relative max-w-2xl w-full">
          
          {/* Main glass panel with Apple-inspired styling */}
          <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/6 
                          backdrop-blur-2xl border border-white/25 rounded-3xl p-10
                          shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]
                          before:absolute before:inset-0 before:rounded-3xl 
                          before:bg-gradient-to-br before:from-white/8 before:via-transparent before:to-transparent 
                          before:pointer-events-none overflow-hidden">
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-xl 
                         bg-gradient-to-br from-white/15 via-white/10 to-white/8
                         hover:from-white/20 hover:via-white/15 hover:to-white/12
                         border border-white/25 hover:border-white/35
                         backdrop-blur-md transition-all duration-300
                         flex items-center justify-center
                         shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06)]
                         hover:shadow-[0_6px_20px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.1)]
                         transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <X className="w-5 h-5 text-white/80 hover:text-white" />
            </button>

            {/* Content */}
            <div className="relative z-10">
              {/* Seagull Avatar and Message */}
              <div className="text-center mb-8">
                {/* Seagull Avatar */}
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 
                                  shadow-[0_8px_24px_rgba(0,0,0,0.15)] relative">
                    <img
                      src="https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Seagull Captain"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback seagull image
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/158251/bird-seagull-animal-nature-158251.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                    
                    {/* Voice activity indicator */}
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full border-2 border-green-400/60 
                                      animate-pulse bg-green-400/10"></div>
                    )}
                  </div>
                  
                  {/* Connection status indicator */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white/30 
                                  flex items-center justify-center backdrop-blur-md">
                    {connectionStatus === 'connected' && (
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                    {connectionStatus === 'connecting' && (
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                    {connectionStatus === 'error' && (
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Seagull Message */}
                <h2 className="text-2xl font-playfair font-normal text-white mb-4 leading-tight">
                  Captain's Voice Assistant
                </h2>
                
                <div className="bg-gradient-to-br from-white/8 via-white/5 to-white/3 
                                backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6
                                shadow-[inset_0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <p className="text-white/90 font-inter text-lg leading-relaxed italic">
                    "Captain, it seems we've veered off course. Let me check on our current situation."
                  </p>
                </div>
              </div>

              {/* Voice Interaction Status */}
              <div className="text-center space-y-4">
                {/* Audio Level Visualizer */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Mic className={`w-6 h-6 transition-colors duration-300 ${
                    isRecording ? 'text-green-400' : 'text-white/60'
                  }`} />
                  
                  {/* Audio level bars */}
                  <div className="flex items-center gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          audioLevel * 8 > i 
                            ? 'bg-green-400 h-6' 
                            : 'bg-white/20 h-2'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Radio className={`w-5 h-5 transition-colors duration-300 ${
                    connectionStatus === 'connected' ? 'text-green-400' : 'text-white/60'
                  }`} />
                </div>

                {/* Status Text */}
                <div className="space-y-2">
                  <p className={`font-inter text-base transition-colors duration-300 ${
                    connectionStatus === 'connected' ? 'text-green-400' : 
                    connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {connectionStatus === 'connected' && 'Voice interaction active'}
                    {connectionStatus === 'connecting' && 'Connecting to voice system...'}
                    {connectionStatus === 'error' && 'Connection failed - please check microphone access'}
                  </p>
                  
                  {isRecording && (
                    <p className="text-white/70 font-inter text-sm">
                      Listening and processing your voice in real-time
                    </p>
                  )}
                </div>

                {/* Retry button for error state */}
                {connectionStatus === 'error' && (
                  <button
                    onClick={startVoiceInteraction}
                    className="px-6 py-2 bg-gradient-to-br from-white/15 via-white/10 to-white/8
                               hover:from-white/20 hover:via-white/15 hover:to-white/12
                               text-white rounded-xl transition-all duration-300
                               border border-white/25 hover:border-white/35
                               font-inter font-medium text-base backdrop-blur-md
                               shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06)]
                               transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            </div>

            {/* Ultra subtle decorative elements */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/10 rounded-full blur-sm animate-pulse"></div>
            <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-white/8 rounded-full blur-sm animate-pulse" 
                 style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/3 -right-3 w-3 h-3 bg-white/12 rounded-full blur-sm animate-pulse"
                 style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-1/3 -left-3 w-4 h-4 bg-white/10 rounded-full blur-sm animate-pulse"
                 style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};