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
      
      {/* Main visionOS-style glass panel */}
      <div className="glass-panel-visionos relative overflow-hidden">
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '128px 128px'
             }}>
        </div>
        
        {/* Specular highlight - top edge */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        
        {/* Specular highlight - left edge */}
        <div className="absolute top-4 bottom-4 left-0 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
        
        {/* Inner content with proper z-index */}
        <div className="relative z-10 p-8">
          {currentStep === 'welcome' && (
            <div className="space-y-6">
              {/* Header with enhanced glass icon container */}
              <div className="flex items-center gap-4 mb-8">
                <div className="glass-icon-container">
                  {/* Inner specular highlights */}
                  <div className="absolute top-0.5 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
                  <div className="absolute top-1 bottom-1 left-0.5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent rounded-full"></div>
                  
                  <Compass className="w-7 h-7 text-white relative z-10 drop-shadow-sm" />
                </div>
                <h2 className="text-xl font-playfair font-semibold text-white drop-shadow-sm">
                  Welcome aboard!
                </h2>
              </div>

              {/* Welcome content */}
              <div className="space-y-4 text-white/95 font-inter leading-relaxed">
                <p className="drop-shadow-sm">
                  The system uses sensors to check if you're doing something important right now.
                </p>
                <p className="drop-shadow-sm">
                  When you're working toward your goal, different winds of intention will blow, 
                  pushing your little boat forward and helping you get where you want to go.
                </p>
              </div>

              {/* Enhanced glass Next button */}
              <button
                onClick={handleNext}
                className="glass-button-primary w-full group"
              >
                {/* Top specular highlight */}
                <div className="absolute top-0.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
                
                {/* Left specular highlight */}
                <div className="absolute top-2 bottom-2 left-0.5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent rounded-full"></div>
                
                {/* Button content */}
                <span className="relative z-10 drop-shadow-sm">Next</span>
              </button>
            </div>
          )}

          {currentStep === 'voice' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="glass-icon-container mx-auto mb-4">
                  {/* Specular highlights */}
                  <div className="absolute top-0.5 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
                  <div className="absolute top-1 bottom-1 left-0.5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent rounded-full"></div>
                  
                  <Mic className="w-7 h-7 text-white relative z-10 drop-shadow-sm" />
                </div>
                <h2 className="text-lg font-playfair font-semibold text-white mb-2 drop-shadow-sm">
                  Tell the wind of intention,
                </h2>
                <p className="text-white/90 font-inter drop-shadow-sm">
                  What important thing do you want to do today?
                </p>
              </div>

              {/* Recording controls */}
              <div className="space-y-6">
                {!audioBlob && (
                  <div className="text-center">
                    {/* Enhanced glass recording button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`glass-recording-button ${isRecording ? 'recording' : ''}`}
                    >
                      {/* Enhanced specular highlights for recording button */}
                      <div className="absolute top-1 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"></div>
                      <div className="absolute top-2 bottom-2 left-1 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent rounded-full"></div>
                      
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white relative z-10 drop-shadow-sm" />
                      ) : (
                        <Mic className="w-8 h-8 text-white relative z-10 drop-shadow-sm" />
                      )}
                    </button>
                    
                    {isRecording && (
                      <div className="mt-4 text-white/90 font-mono text-lg drop-shadow-sm">
                        Recording: {formatTime(recordingTime)}
                      </div>
                    )}
                    
                    <p className="mt-4 text-sm text-white/70 drop-shadow-sm">
                      {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                    </p>
                  </div>
                )}

                {audioBlob && (
                  <div className="space-y-4">
                    {/* Enhanced glass recording display */}
                    <div className="glass-panel-secondary">
                      {/* Specular highlights */}
                      <div className="absolute top-0.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
                      <div className="absolute top-2 bottom-2 left-0.5 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent rounded-full"></div>
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="text-white/90 text-sm font-medium drop-shadow-sm">Your recording</span>
                        <button
                          onClick={clearRecording}
                          className="text-white/70 hover:text-white text-sm px-3 py-1 rounded-lg
                                     hover:bg-white/10 transition-all duration-200 drop-shadow-sm"
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        {/* Enhanced glass play button */}
                        <button
                          onClick={isPlaying ? pauseRecording : playRecording}
                          className="glass-button-small group"
                        >
                          {/* Specular highlights */}
                          <div className="absolute top-0.5 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
                          <div className="absolute top-1 bottom-1 left-0.5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent rounded-full"></div>
                          
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5 relative z-10 drop-shadow-sm" />
                          )}
                        </button>
                        
                        {/* Enhanced glass progress bar */}
                        <div className="flex-1 h-3 glass-progress-bar">
                          <div className={`h-full glass-progress-fill ${isPlaying ? 'animate-pulse' : ''}`} 
                               style={{ width: '100%' }}>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced glass submit button */}
                    <button
                      onClick={() => {
                        console.log('Voice input submitted:', audioBlob);
                        alert('Voice input recorded successfully!');
                      }}
                      className="glass-button-primary w-full group"
                    >
                      {/* Specular highlights */}
                      <div className="absolute top-0.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
                      <div className="absolute top-2 bottom-2 left-0.5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent rounded-full"></div>
                      
                      <span className="relative z-10 drop-shadow-sm">Submit Voice Input</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced glass back button */}
              <button
                onClick={() => setCurrentStep('welcome')}
                className="glass-button-secondary w-full"
              >
                {/* Subtle specular highlights */}
                <div className="absolute top-0.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
                
                <span className="relative z-10 drop-shadow-sm">Back</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};