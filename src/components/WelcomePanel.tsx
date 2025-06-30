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
    <div className="fixed top-1/2 transform -translate-y-1/2 z-40 w-80" 
         style={{ left: '75%', transform: 'translateX(-50%) translateY(-50%)' }}>
      {/* Main glass panel */}
      <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 
                      shadow-2xl shadow-black/10 transition-all duration-500
                      before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br 
                      before:from-white/20 before:to-transparent before:pointer-events-none
                      relative overflow-hidden">
        
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          {currentStep === 'welcome' && (
            <div className="space-y-6">
              {/* Header with glass icon container */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 
                                rounded-2xl flex items-center justify-center 
                                shadow-lg shadow-white/10 relative overflow-hidden">
                  {/* Inner highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                  <Compass className="w-7 h-7 text-white relative z-10" />
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

              {/* Glass Next button */}
              <button
                onClick={handleNext}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30
                           hover:bg-white/25 hover:border-white/40 text-white rounded-2xl 
                           transition-all duration-300 font-inter font-medium text-lg
                           shadow-lg shadow-white/10 hover:shadow-white/20
                           transform hover:scale-[1.02] active:scale-[0.98]
                           relative overflow-hidden group"
              >
                {/* Button inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-blue-500/20 
                                rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Next</span>
              </button>
            </div>
          )}

          {currentStep === 'voice' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 
                                rounded-2xl flex items-center justify-center mx-auto mb-4 
                                shadow-lg shadow-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                  <Mic className="w-7 h-7 text-white relative z-10" />
                </div>
                <h2 className="text-lg font-playfair font-semibold text-white mb-2">
                  Tell the wind of intention,
                </h2>
                <p className="text-white/80 font-inter">
                  What important thing do you want to do today?
                </p>
              </div>

              {/* Recording controls */}
              <div className="space-y-6">
                {!audioBlob && (
                  <div className="text-center">
                    {/* Glass recording button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 
                                  backdrop-blur-md border shadow-lg relative overflow-hidden group ${
                        isRecording 
                          ? 'bg-red-500/30 border-red-400/50 shadow-red-500/20 animate-pulse' 
                          : 'bg-white/20 border-white/30 shadow-white/10 hover:bg-white/25 hover:border-white/40 hover:shadow-white/20'
                      }`}
                    >
                      {/* Button inner glow */}
                      <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                        isRecording 
                          ? 'bg-gradient-to-br from-red-400/30 to-red-600/30' 
                          : 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100'
                      }`}></div>
                      
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white relative z-10" />
                      ) : (
                        <Mic className="w-8 h-8 text-white relative z-10" />
                      )}
                    </button>
                    
                    {isRecording && (
                      <div className="mt-4 text-white/80 font-mono text-lg">
                        Recording: {formatTime(recordingTime)}
                      </div>
                    )}
                    
                    <p className="mt-4 text-sm text-white/60">
                      {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                    </p>
                  </div>
                )}

                {audioBlob && (
                  <div className="space-y-4">
                    {/* Glass recording display */}
                    <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 
                                    shadow-lg shadow-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="text-white/80 text-sm font-medium">Your recording</span>
                        <button
                          onClick={clearRecording}
                          className="text-white/60 hover:text-white text-sm px-3 py-1 rounded-lg
                                     hover:bg-white/10 transition-all duration-200"
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        {/* Glass play button */}
                        <button
                          onClick={isPlaying ? pauseRecording : playRecording}
                          className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 
                                     hover:bg-white/25 hover:border-white/40 rounded-2xl 
                                     flex items-center justify-center transition-all duration-300
                                     shadow-lg shadow-white/10 hover:shadow-white/20 group
                                     relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-500/20 
                                          rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white relative z-10" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5 relative z-10" />
                          )}
                        </button>
                        
                        {/* Glass progress bar */}
                        <div className="flex-1 h-3 bg-white/10 backdrop-blur-sm border border-white/20 
                                        rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full bg-gradient-to-r from-cyan-400/60 to-blue-500/60 
                                          backdrop-blur-sm transition-all duration-300 ${
                            isPlaying ? 'animate-pulse' : ''
                          }`} style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Glass submit button */}
                    <button
                      onClick={() => {
                        console.log('Voice input submitted:', audioBlob);
                        alert('Voice input recorded successfully!');
                      }}
                      className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30
                                 hover:bg-white/25 hover:border-white/40 text-white rounded-2xl 
                                 transition-all duration-300 font-inter font-medium text-lg
                                 shadow-lg shadow-white/10 hover:shadow-white/20
                                 transform hover:scale-[1.02] active:scale-[0.98]
                                 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 
                                      rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">Submit Voice Input</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Glass back button */}
              <button
                onClick={() => setCurrentStep('welcome')}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20
                           hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white
                           rounded-xl transition-all duration-300 font-inter text-sm
                           shadow-md shadow-white/5 hover:shadow-white/10"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};