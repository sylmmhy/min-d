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
      {/* Enhanced glass panel with Apple-inspired depth */}
      <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/6 
                      backdrop-blur-2xl border border-white/25 rounded-3xl p-10
                      shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]
                      before:absolute before:inset-0 before:rounded-3xl 
                      before:bg-gradient-to-br before:from-white/8 before:via-transparent before:to-transparent 
                      before:pointer-events-none overflow-hidden transition-all duration-500">
        
        <div className="relative z-10">
          {currentStep === 'welcome' && (
            <div className="space-y-6">
              {/* Header - left aligned title, 32px */}
              <div className="mb-8">
                <h2 className="text-[32px] font-playfair font-normal text-white mb-6 leading-tight text-left">
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

              {/* Apple-style Next button - using Back button size (smaller) */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleNext}
                  className="px-8 py-2 bg-gradient-to-br from-white/15 via-white/10 to-white/8
                             hover:from-white/20 hover:via-white/15 hover:to-white/12
                             text-white rounded-xl transition-all duration-300
                             border border-white/25 hover:border-white/35
                             font-inter font-medium text-base backdrop-blur-md
                             shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.1)]
                             hover:shadow-[0_6px_20px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]
                             transform hover:scale-[1.02] active:scale-[0.98] min-w-[80px]"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 'voice' && (
            <div className="space-y-6">
              {/* Header - title changed to 32px */}
              <div className="text-center mb-8">
                <div className={`w-14 h-14 ${designSystem.patterns.iconContainer} mx-auto mb-4 
                                ${designSystem.effects.shadows.glass}
                                relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-2xl"></div>
                  <Mic className="w-7 h-7 text-white relative z-10" />
                </div>
                <h2 className="text-[32px] font-playfair font-normal text-white mb-4 leading-tight">
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
                    {/* Enhanced recording button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 
                                  backdrop-blur-md border shadow-lg relative overflow-hidden group ${
                        isRecording 
                          ? 'bg-red-400/20 border-red-300/30 shadow-red-400/20 animate-pulse' 
                          : 'bg-gradient-to-br from-white/15 via-white/10 to-white/8 border-white/25 shadow-white/10 hover:from-white/20 hover:via-white/15 hover:to-white/12'
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
                    {/* Enhanced recording display */}
                    <div className={`bg-black/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 
                                    shadow-[inset_0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] 
                                    relative overflow-hidden`}>
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
                        {/* Enhanced play button */}
                        <button
                          onClick={isPlaying ? pauseRecording : playRecording}
                          className={`w-12 h-12 bg-gradient-to-br from-white/15 via-white/10 to-white/8
                                     hover:from-white/20 hover:via-white/15 hover:to-white/12 rounded-2xl 
                                     flex items-center justify-center ${designSystem.effects.transitions.default}
                                     shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.1)]
                                     border border-white/25 relative overflow-hidden group`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 
                                          rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white relative z-10" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5 relative z-10" />
                          )}
                        </button>
                        
                        {/* Enhanced progress bar */}
                        <div className={`flex-1 h-3 bg-white/15 ${designSystem.effects.blur.sm} border border-white/20
                                        rounded-full overflow-hidden shadow-inner`}>
                          <div className={`h-full bg-gradient-to-r from-white/40 to-white/30 
                                          ${designSystem.effects.blur.sm} ${designSystem.effects.transitions.default} ${
                            isPlaying ? 'animate-pulse' : ''
                          }`} style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Apple-style Submit button - using Back button size (smaller) */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          console.log('Voice input submitted:', audioBlob);
                          alert('Voice input recorded successfully!');
                        }}
                        className="px-8 py-2 bg-gradient-to-br from-white/15 via-white/10 to-white/8
                                   hover:from-white/20 hover:via-white/15 hover:to-white/12
                                   text-white rounded-xl transition-all duration-300
                                   border border-white/25 hover:border-white/35
                                   font-inter font-medium text-base backdrop-blur-md
                                   shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.1)]
                                   hover:shadow-[0_6px_20px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]
                                   transform hover:scale-[1.02] active:scale-[0.98] min-w-[140px]"
                      >
                        Submit Voice Input
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Apple-style Back button - smaller size */}
              <div className="flex justify-center">
                <button
                  onClick={() => setCurrentStep('welcome')}
                  className="px-8 py-2 bg-gradient-to-br from-white/10 via-white/8 to-white/6
                             hover:from-white/15 hover:via-white/12 hover:to-white/10
                             text-white rounded-lg transition-all duration-300
                             border border-white/20 hover:border-white/30
                             font-inter font-medium text-sm backdrop-blur-md
                             shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]
                             transform hover:scale-[1.02] active:scale-[0.98] min-w-[80px]"
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