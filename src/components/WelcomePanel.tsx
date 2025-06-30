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
      {/* Ultra-refined glass panel with subtle layering */}
      <div className="relative">
        {/* Background blur layer */}
        <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-2xl rounded-[28px] 
                        shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/[0.15]"></div>
        
        {/* Inner content layer */}
        <div className="relative bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.04] 
                        rounded-[28px] p-8 backdrop-blur-xl
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(255,255,255,0.1)]
                        border border-white/[0.18]">
          
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <div className="relative z-10">
            {currentStep === 'welcome' && (
              <div className="space-y-6">
                {/* Header with refined glass icon */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    {/* Icon background blur */}
                    <div className="absolute inset-0 bg-white/[0.12] backdrop-blur-xl rounded-[18px] 
                                    shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-white/[0.2]"></div>
                    {/* Icon content */}
                    <div className="relative w-14 h-14 bg-gradient-to-br from-white/[0.15] to-white/[0.08] 
                                    rounded-[18px] flex items-center justify-center backdrop-blur-xl
                                    shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
                                    border border-white/[0.22]">
                      <Compass className="w-7 h-7 text-white/90" />
                    </div>
                  </div>
                  <h2 className="text-xl font-playfair font-semibold text-white/95">
                    Welcome aboard!
                  </h2>
                </div>

                {/* Welcome content */}
                <div className="space-y-4 text-white/85 font-inter leading-relaxed">
                  <p>
                    The system uses sensors to check if you're doing something important right now.
                  </p>
                  <p>
                    When you're working toward your goal, different winds of intention will blow, 
                    pushing your little boat forward and helping you get where you want to go.
                  </p>
                </div>

                {/* Ultra-refined Next button */}
                <div className="relative">
                  {/* Button background blur */}
                  <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-xl rounded-[20px] 
                                  shadow-[0_6px_24px_rgba(0,0,0,0.1)] border border-white/[0.15]"></div>
                  {/* Button content */}
                  <button
                    onClick={handleNext}
                    className="relative w-full px-8 py-4 bg-gradient-to-br from-white/[0.18] via-white/[0.12] to-white/[0.08]
                               hover:from-white/[0.22] hover:via-white/[0.16] hover:to-white/[0.12]
                               text-white/95 rounded-[20px] transition-all duration-300 font-inter font-medium text-lg
                               shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(255,255,255,0.1)]
                               border border-white/[0.2] hover:border-white/[0.25]
                               transform hover:scale-[1.01] active:scale-[0.99]
                               backdrop-blur-xl group"
                  >
                    {/* Button top highlight */}
                    <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Next</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'voice' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="relative mx-auto mb-4">
                    {/* Icon background blur */}
                    <div className="absolute inset-0 bg-white/[0.12] backdrop-blur-xl rounded-[18px] 
                                    shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-white/[0.2]"></div>
                    {/* Icon content */}
                    <div className="relative w-14 h-14 bg-gradient-to-br from-white/[0.15] to-white/[0.08] 
                                    rounded-[18px] flex items-center justify-center backdrop-blur-xl
                                    shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
                                    border border-white/[0.22]">
                      <Mic className="w-7 h-7 text-white/90" />
                    </div>
                  </div>
                  <h2 className="text-lg font-playfair font-semibold text-white/95 mb-2">
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
                      {/* Ultra-refined recording button */}
                      <div className="relative inline-block">
                        {/* Button background blur */}
                        <div className={`absolute inset-0 backdrop-blur-xl rounded-[32px] 
                                        shadow-[0_8px_32px_rgba(0,0,0,0.12)] border ${
                          isRecording 
                            ? 'bg-red-500/[0.15] border-red-400/[0.3] shadow-[0_8px_32px_rgba(239,68,68,0.2)]' 
                            : 'bg-white/[0.08] border-white/[0.2]'
                        }`}></div>
                        {/* Button content */}
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`relative w-20 h-20 rounded-[32px] flex items-center justify-center 
                                      transition-all duration-300 backdrop-blur-xl group ${
                            isRecording 
                              ? 'bg-gradient-to-br from-red-400/[0.2] via-red-500/[0.15] to-red-600/[0.1] animate-pulse' 
                              : 'bg-gradient-to-br from-white/[0.15] via-white/[0.12] to-white/[0.08] hover:from-white/[0.18] hover:via-white/[0.15] hover:to-white/[0.12]'
                          } shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] border ${
                            isRecording ? 'border-red-400/[0.35]' : 'border-white/[0.25] hover:border-white/[0.3]'
                          }`}
                        >
                          {/* Button top highlight */}
                          <div className={`absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent to-transparent 
                                          transition-opacity duration-300 ${
                            isRecording 
                              ? 'via-red-300/50' 
                              : 'via-white/40 opacity-0 group-hover:opacity-100'
                          }`}></div>
                          
                          {isRecording ? (
                            <Square className="w-8 h-8 text-white/95 relative z-10" />
                          ) : (
                            <Mic className="w-8 h-8 text-white/95 relative z-10" />
                          )}
                        </button>
                      </div>
                      
                      {isRecording && (
                        <div className="mt-4 text-white/90 font-mono text-lg">
                          Recording: {formatTime(recordingTime)}
                        </div>
                      )}
                      
                      <p className="mt-4 text-sm text-white/70">
                        {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                      </p>
                    </div>
                  )}

                  {audioBlob && (
                    <div className="space-y-4">
                      {/* Ultra-refined recording display */}
                      <div className="relative">
                        {/* Background blur */}
                        <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-xl rounded-[20px] 
                                        shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/[0.12]"></div>
                        {/* Content */}
                        <div className="relative bg-gradient-to-br from-white/[0.1] via-white/[0.06] to-white/[0.03] 
                                        rounded-[20px] p-5 backdrop-blur-xl
                                        shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]
                                        border border-white/[0.15]">
                          
                          <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-white/85 text-sm font-medium">Your recording</span>
                            <button
                              onClick={clearRecording}
                              className="text-white/60 hover:text-white/90 text-sm px-3 py-1 rounded-lg
                                         hover:bg-white/[0.08] transition-all duration-200"
                            >
                              Clear
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 relative z-10">
                            {/* Ultra-refined play button */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-xl rounded-[16px] 
                                              shadow-[0_3px_12px_rgba(0,0,0,0.06)] border border-white/[0.15]"></div>
                              <button
                                onClick={isPlaying ? pauseRecording : playRecording}
                                className="relative w-12 h-12 bg-gradient-to-br from-white/[0.12] to-white/[0.06] 
                                           hover:from-white/[0.15] hover:to-white/[0.09] rounded-[16px] 
                                           flex items-center justify-center transition-all duration-300
                                           shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl 
                                           border border-white/[0.18] hover:border-white/[0.22] group"
                              >
                                <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                {isPlaying ? (
                                  <Pause className="w-5 h-5 text-white/90 relative z-10" />
                                ) : (
                                  <Play className="w-5 h-5 text-white/90 ml-0.5 relative z-10" />
                                )}
                              </button>
                            </div>
                            
                            {/* Ultra-refined progress bar */}
                            <div className="flex-1 relative">
                              <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-sm rounded-full 
                                              shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/[0.12]"></div>
                              <div className="relative h-3 bg-gradient-to-r from-white/[0.08] to-white/[0.04] 
                                              rounded-full overflow-hidden backdrop-blur-sm">
                                <div className={`h-full bg-gradient-to-r from-white/[0.25] via-white/[0.2] to-white/[0.15] 
                                                backdrop-blur-sm transition-all duration-300 ${
                                  isPlaying ? 'animate-pulse' : ''
                                }`} style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ultra-refined submit button */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-xl rounded-[20px] 
                                        shadow-[0_6px_24px_rgba(0,0,0,0.1)] border border-white/[0.15]"></div>
                        <button
                          onClick={() => {
                            console.log('Voice input submitted:', audioBlob);
                            alert('Voice input recorded successfully!');
                          }}
                          className="relative w-full px-8 py-4 bg-gradient-to-br from-white/[0.18] via-white/[0.12] to-white/[0.08]
                                     hover:from-white/[0.22] hover:via-white/[0.16] hover:to-white/[0.12]
                                     text-white/95 rounded-[20px] transition-all duration-300 font-inter font-medium text-lg
                                     shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(255,255,255,0.1)]
                                     border border-white/[0.2] hover:border-white/[0.25]
                                     transform hover:scale-[1.01] active:scale-[0.99]
                                     backdrop-blur-xl group"
                        >
                          <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent 
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10">Submit Voice Input</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ultra-refined back button */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-xl rounded-[16px] 
                                  shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-white/[0.1]"></div>
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="relative w-full px-4 py-3 bg-gradient-to-br from-white/[0.08] to-white/[0.04]
                               hover:from-white/[0.12] hover:to-white/[0.08] text-white/75 hover:text-white/90
                               rounded-[16px] transition-all duration-300 font-inter text-sm
                               shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl
                               border border-white/[0.12] hover:border-white/[0.18]"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};