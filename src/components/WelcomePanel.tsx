import React, { useState, useRef, useEffect } from 'react';
import { Compass, Mic, MicOff, Play, Pause, Square } from 'lucide-react';
import { designSystem, getButtonStyle, getPanelStyle } from '../styles/designSystem';

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
    <div className="fixed top-1/2 transform -translate-y-1/2 z-40 w-[480px]" 
         style={{ left: '65%', transform: 'translateX(-50%) translateY(-50%)' }}>
      {/* Transparent glass panel */}
      <div className={`${getPanelStyle()} p-10 
                      ${designSystem.effects.shadows.strong} ${designSystem.effects.transitions.slow}
                      relative overflow-hidden`}>
        
        {/* Very subtle inner glass reflection effect */}
        <div className={designSystem.patterns.innerGlow}></div>
        
        <div className="relative z-10">
          {currentStep === 'welcome' && (
            <div className="space-y-6">
              {/* Header with transparent icon */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 ${designSystem.patterns.iconContainer}
                                ${designSystem.effects.shadows.glass}
                                relative overflow-hidden`}>
                  {/* Very subtle inner highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-2xl"></div>
                  <Compass className="w-7 h-7 text-white relative z-10" />
                </div>
                <h2 className={`${designSystem.typography.sizes.xl} ${designSystem.typography.fonts.heading} 
                               ${designSystem.typography.weights.semibold} ${designSystem.colors.text.primary}`}>
                  Welcome aboard!
                </h2>
              </div>

              {/* Welcome content */}
              <div className={`space-y-4 ${designSystem.colors.text.secondary} ${designSystem.typography.fonts.body} leading-relaxed`}>
                <p>
                  The system uses sensors to check if you're doing something important right now.
                </p>
                <p>
                  When you're working toward your goal, different winds of intention will blow, 
                  pushing your little boat forward and helping you get where you want to go.
                </p>
              </div>

              {/* Next button with transparent glass style */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleNext}
                  className={getButtonStyle('glass', 'md')}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 'voice' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-14 h-14 ${designSystem.patterns.iconContainer} mx-auto mb-4 
                                ${designSystem.effects.shadows.glass}
                                relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-2xl"></div>
                  <Mic className="w-7 h-7 text-white relative z-10" />
                </div>
                <h2 className={`${designSystem.typography.sizes.lg} ${designSystem.typography.fonts.heading} 
                               ${designSystem.typography.weights.semibold} ${designSystem.colors.text.primary} mb-2`}>
                  Tell the wind of intention,
                </h2>
                <p className={`${designSystem.colors.text.secondary} ${designSystem.typography.fonts.body}`}>
                  What important thing do you want to do today?
                </p>
              </div>

              {/* Recording controls */}
              <div className="space-y-6">
                {!audioBlob && (
                  <div className="text-center">
                    {/* Transparent recording button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 
                                  backdrop-blur-md border shadow-lg relative overflow-hidden group ${
                        isRecording 
                          ? 'bg-red-400/20 border-red-300/30 shadow-red-400/20 animate-pulse' 
                          : 'bg-white/10 border-white/25 shadow-white/10 hover:bg-white/15'
                      }`}
                    >
                      {/* Button inner glow */}
                      <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                        isRecording 
                          ? 'bg-gradient-to-br from-red-300/20 to-red-500/20' 
                          : 'bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100'
                      }`}></div>
                      
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white relative z-10" />
                      ) : (
                        <Mic className="w-8 h-8 text-white relative z-10" />
                      )}
                    </button>
                    
                    {isRecording && (
                      <div className={`mt-4 ${designSystem.colors.text.secondary} font-mono ${designSystem.typography.sizes.lg}`}>
                        Recording: {formatTime(recordingTime)}
                      </div>
                    )}
                    
                    <p className={`mt-4 ${designSystem.typography.sizes.sm} ${designSystem.colors.text.muted}`}>
                      {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                    </p>
                  </div>
                )}

                {audioBlob && (
                  <div className="space-y-4">
                    {/* Transparent recording display */}
                    <div className={`${designSystem.colors.glass.overlay} 
                                    ${designSystem.effects.blur.md} ${designSystem.colors.borders.glass} ${designSystem.radius.lg} p-5 
                                    ${designSystem.effects.shadows.glass} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent rounded-2xl"></div>
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className={`${designSystem.colors.text.secondary} ${designSystem.typography.sizes.sm} ${designSystem.typography.weights.medium}`}>
                          Your recording
                        </span>
                        <button
                          onClick={clearRecording}
                          className={`${designSystem.colors.text.muted} hover:${designSystem.colors.text.primary} ${designSystem.typography.sizes.sm} px-3 py-1 rounded-lg
                                     hover:bg-white/10 ${designSystem.effects.transitions.fast}`}
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        {/* Transparent play button */}
                        <button
                          onClick={isPlaying ? pauseRecording : playRecording}
                          className={`w-12 h-12 ${designSystem.colors.glass.primary} 
                                     hover:bg-white/15 ${designSystem.radius.lg} 
                                     flex items-center justify-center ${designSystem.effects.transitions.default}
                                     ${designSystem.effects.shadows.button} ${designSystem.colors.borders.glass}
                                     relative overflow-hidden group`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 
                                          rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white relative z-10" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5 relative z-10" />
                          )}
                        </button>
                        
                        {/* Transparent progress bar */}
                        <div className={`flex-1 h-3 bg-white/15 ${designSystem.effects.blur.sm} ${designSystem.colors.borders.glass} 
                                        rounded-full overflow-hidden shadow-inner`}>
                          <div className={`h-full bg-gradient-to-r from-white/40 to-white/30 
                                          ${designSystem.effects.blur.sm} ${designSystem.effects.transitions.default} ${
                            isPlaying ? 'animate-pulse' : ''
                          }`} style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Submit button with transparent glass style */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          console.log('Voice input submitted:', audioBlob);
                          alert('Voice input recorded successfully!');
                        }}
                        className={getButtonStyle('glass', 'md')}
                      >
                        Submit Voice Input
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Back button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setCurrentStep('welcome')}
                  className={getButtonStyle('glass', 'sm')}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};