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
      
      {/* Main physical glass panel with enhanced depth */}
      <div className="glass-panel-physical relative overflow-hidden">
        
        {/* Primary light source - top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-t-3xl"></div>
        
        {/* Secondary light source - left edge highlight */}
        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/60 via-white/40 to-white/20 rounded-l-3xl"></div>
        
        {/* Crisp outline stroke */}
        <div className="absolute inset-0 rounded-3xl border border-white/30 pointer-events-none"></div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-3xl"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '100px 100px'
             }}>
        </div>
        
        {/* Inner content with proper layering */}
        <div className="relative z-10 p-8">
          {currentStep === 'welcome' && (
            <div className="space-y-6">
              {/* Header with physical glass icon container */}
              <div className="flex items-center gap-4 mb-8">
                <div className="glass-icon-physical">
                  {/* Icon container light sources */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-2xl"></div>
                  <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/50 via-white/30 to-white/15 rounded-l-2xl"></div>
                  <div className="absolute inset-0 rounded-2xl border border-white/35 pointer-events-none"></div>
                  
                  <Compass className="w-7 h-7 text-white relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                </div>
                <h2 className="text-xl font-playfair font-semibold text-white filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Welcome aboard!
                </h2>
              </div>

              {/* Welcome content */}
              <div className="space-y-4 text-white/95 font-inter leading-relaxed">
                <p className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  The system uses sensors to check if you're doing something important right now.
                </p>
                <p className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  When you're working toward your goal, different winds of intention will blow, 
                  pushing your little boat forward and helping you get where you want to go.
                </p>
              </div>

              {/* Physical glass Next button */}
              <button
                onClick={handleNext}
                className="glass-button-physical w-full group"
              >
                {/* Button light sources */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-2xl"></div>
                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/50 via-white/30 to-white/15 rounded-l-2xl"></div>
                <div className="absolute inset-0 rounded-2xl border border-white/35 pointer-events-none"></div>
                
                <span className="relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Next</span>
              </button>
            </div>
          )}

          {currentStep === 'voice' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="glass-icon-physical mx-auto mb-4">
                  {/* Icon container light sources */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-2xl"></div>
                  <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/50 via-white/30 to-white/15 rounded-l-2xl"></div>
                  <div className="absolute inset-0 rounded-2xl border border-white/35 pointer-events-none"></div>
                  
                  <Mic className="w-7 h-7 text-white relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                </div>
                <h2 className="text-lg font-playfair font-semibold text-white mb-2 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Tell the wind of intention,
                </h2>
                <p className="text-white/90 font-inter filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  What important thing do you want to do today?
                </p>
              </div>

              {/* Recording controls */}
              <div className="space-y-6">
                {!audioBlob && (
                  <div className="text-center">
                    {/* Physical glass recording button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`glass-recording-physical ${isRecording ? 'recording' : ''}`}
                    >
                      {/* Recording button light sources */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-t-3xl"></div>
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-white/60 via-white/40 to-white/20 rounded-l-3xl"></div>
                      <div className="absolute inset-0 rounded-3xl border border-white/40 pointer-events-none"></div>
                      
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                      ) : (
                        <Mic className="w-8 h-8 text-white relative z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                      )}
                    </button>
                    
                    {isRecording && (
                      <div className="mt-4 text-white/90 font-mono text-lg filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        Recording: {formatTime(recordingTime)}
                      </div>
                    )}
                    
                    <p className="mt-4 text-sm text-white/70 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                      {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                    </p>
                  </div>
                )}

                {audioBlob && (
                  <div className="space-y-4">
                    {/* Physical glass recording display */}
                    <div className="glass-panel-secondary-physical">
                      {/* Secondary panel light sources */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-2xl"></div>
                      <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/40 via-white/25 to-white/10 rounded-l-2xl"></div>
                      <div className="absolute inset-0 rounded-2xl border border-white/25 pointer-events-none"></div>
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <span className="text-white/90 text-sm font-medium filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Your recording</span>
                        <button
                          onClick={clearRecording}
                          className="text-white/70 hover:text-white text-sm px-3 py-1 rounded-lg
                                     hover:bg-white/10 transition-all duration-200 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        {/* Physical glass play button */}
                        <button
                          onClick={isPlaying ? pauseRecording : playRecording}
                          className="glass-button-small-physical group"
                        >
                          {/* Small button light sources */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-2xl"></div>
                          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/40 via-white/25 to-white/10 rounded-l-2xl"></div>
                          <div className="absolute inset-0 rounded-2xl border border-white/30 pointer-events-none"></div>
                          
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5 relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                          )}
                        </button>
                        
                        {/* Physical glass progress bar */}
                        <div className="flex-1 h-3 glass-progress-physical">
                          <div className={`h-full glass-progress-fill-physical ${isPlaying ? 'animate-pulse' : ''}`} 
                               style={{ width: '100%' }}>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Physical glass submit button */}
                    <button
                      onClick={() => {
                        console.log('Voice input submitted:', audioBlob);
                        alert('Voice input recorded successfully!');
                      }}
                      className="glass-button-physical w-full group"
                    >
                      {/* Button light sources */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-2xl"></div>
                      <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/50 via-white/30 to-white/15 rounded-l-2xl"></div>
                      <div className="absolute inset-0 rounded-2xl border border-white/35 pointer-events-none"></div>
                      
                      <span className="relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Submit Voice Input</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Physical glass back button */}
              <button
                onClick={() => setCurrentStep('welcome')}
                className="glass-button-secondary-physical w-full"
              >
                {/* Secondary button light sources */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-t-xl"></div>
                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/30 via-white/20 to-white/10 rounded-l-xl"></div>
                <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none"></div>
                
                <span className="relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">Back</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};