import React, { useState, useRef, useEffect } from 'react';
import { Compass, Mic, MicOff, Play, Pause, Square } from 'lucide-react';

interface WelcomePanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

export const WelcomePanel: React.FC<WelcomePanelProps> = ({
  isVisible,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'voice'>('welcome');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    setCurrentStep('voice');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const pauseRecording = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 w-80">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 
                      shadow-2xl shadow-black/20 transition-all duration-500">
        
        {currentStep === 'welcome' && (
          <div className="space-y-6">
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/30 to-purple-400/30 
                              rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-playfair font-semibold text-white">
                Welcome aboard!
              </h2>
            </div>

            {/* Welcome content */}
            <div className="space-y-4 text-white/90 font-inter leading-relaxed">
              <p>
                The system uses sensors to check if you're doing something important right now.
              </p>
              <p>
                When you're working toward your goal, different winds of intention will blow, 
                pushing your little boat forward and helping you get where you want to go.
              </p>
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500/80 to-purple-500/80
                         hover:from-blue-500 hover:to-purple-500 text-white rounded-xl 
                         transition-all duration-300 font-inter font-medium
                         shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                         transform hover:scale-105"
            >
              Next
            </button>
          </div>
        )}

        {currentStep === 'voice' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400/30 to-blue-400/30 
                              rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-playfair font-semibold text-white mb-2">
                Tell the wind of intention,
              </h2>
              <p className="text-white/80 font-inter">
                What important thing do you want to do today?
              </p>
            </div>

            {/* Recording controls */}
            <div className="space-y-4">
              {!audioBlob && (
                <div className="text-center">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500/80 hover:bg-red-500 animate-pulse' 
                        : 'bg-green-500/80 hover:bg-green-500'
                    }`}
                  >
                    {isRecording ? (
                      <Square className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </button>
                  
                  {isRecording && (
                    <div className="mt-3 text-white/80 font-mono">
                      Recording: {formatTime(recordingTime)}
                    </div>
                  )}
                  
                  <p className="mt-3 text-sm text-white/60">
                    {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                  </p>
                </div>
              )}

              {audioBlob && (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/80 text-sm">Your recording</span>
                      <button
                        onClick={clearRecording}
                        className="text-white/60 hover:text-white text-sm"
                      >
                        Clear
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={isPlaying ? pauseRecording : playRecording}
                        className="w-10 h-10 bg-blue-500/80 hover:bg-blue-500 rounded-full 
                                   flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </button>
                      
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className={`h-full bg-blue-400 transition-all duration-300 ${
                          isPlaying ? 'animate-pulse' : ''
                        }`} style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      console.log('Voice input submitted:', audioBlob);
                      // Here you could process the audio or send it somewhere
                      alert('Voice input recorded successfully!');
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500/80 to-blue-500/80
                               hover:from-green-500 hover:to-blue-500 text-white rounded-xl 
                               transition-all duration-300 font-inter font-medium"
                  >
                    Submit Voice Input
                  </button>
                </div>
              )}
            </div>

            {/* Back button */}
            <button
              onClick={() => setCurrentStep('welcome')}
              className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 
                         rounded-lg transition-all duration-300 font-inter text-sm"
            >
              Back
            </button>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400/30 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400/30 rounded-full blur-sm animate-pulse" 
             style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
};