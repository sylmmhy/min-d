import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff } from 'lucide-react';
import { designSystem } from '../styles/designSystem';

interface ControlPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isVisible,
  onClose
}) => {
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);

  if (!isVisible) return null;

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
    console.log('Microphone:', !micEnabled ? 'enabled' : 'disabled');
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    console.log('Video:', !videoEnabled ? 'enabled' : 'disabled');
  };

  const toggleScreenShare = () => {
    setScreenShareEnabled(!screenShareEnabled);
    console.log('Screen share:', !screenShareEnabled ? 'enabled' : 'disabled');
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Enhanced glass panel with Apple-inspired depth */}
      <div className="relative bg-gradient-to-br from-white/12 via-white/8 to-white/6 
                      backdrop-blur-2xl border border-white/25 rounded-3xl px-8 py-6
                      shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]
                      before:absolute before:inset-0 before:rounded-3xl 
                      before:bg-gradient-to-br before:from-white/8 before:via-transparent before:to-transparent 
                      before:pointer-events-none overflow-hidden">
        
        {/* Inner glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent 
                        rounded-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          {/* Microphone Control */}
          <button
            onClick={toggleMic}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 
                        backdrop-blur-md border shadow-lg relative overflow-hidden group ${
              micEnabled 
                ? 'bg-green-400/20 border-green-300/30 shadow-green-400/20' 
                : 'bg-red-400/20 border-red-300/30 shadow-red-400/20'
            }`}
            title={micEnabled ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {/* Button inner glow */}
            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              micEnabled 
                ? 'bg-gradient-to-br from-green-300/20 to-green-500/20' 
                : 'bg-gradient-to-br from-red-300/20 to-red-500/20'
            }`}></div>
            
            {micEnabled ? (
              <Mic className="w-7 h-7 text-white relative z-10" />
            ) : (
              <MicOff className="w-7 h-7 text-white relative z-10" />
            )}
          </button>

          {/* Video Control */}
          <button
            onClick={toggleVideo}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 
                        backdrop-blur-md border shadow-lg relative overflow-hidden group ${
              videoEnabled 
                ? 'bg-green-400/20 border-green-300/30 shadow-green-400/20' 
                : 'bg-red-400/20 border-red-300/30 shadow-red-400/20'
            }`}
            title={videoEnabled ? 'Turn off video' : 'Turn on video'}
          >
            {/* Button inner glow */}
            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              videoEnabled 
                ? 'bg-gradient-to-br from-green-300/20 to-green-500/20' 
                : 'bg-gradient-to-br from-red-300/20 to-red-500/20'
            }`}></div>
            
            {videoEnabled ? (
              <Video className="w-7 h-7 text-white relative z-10" />
            ) : (
              <VideoOff className="w-7 h-7 text-white relative z-10" />
            )}
          </button>

          {/* Screen Share Control */}
          <button
            onClick={toggleScreenShare}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 
                        backdrop-blur-md border shadow-lg relative overflow-hidden group ${
              screenShareEnabled 
                ? 'bg-green-400/20 border-green-300/30 shadow-green-400/20' 
                : 'bg-red-400/20 border-red-300/30 shadow-red-400/20'
            }`}
            title={screenShareEnabled ? 'Stop screen sharing' : 'Start screen sharing'}
          >
            {/* Button inner glow */}
            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              screenShareEnabled 
                ? 'bg-gradient-to-br from-green-300/20 to-green-500/20' 
                : 'bg-gradient-to-br from-red-300/20 to-red-500/20'
            }`}></div>
            
            {screenShareEnabled ? (
              <Monitor className="w-7 h-7 text-white relative z-10" />
            ) : (
              <MonitorOff className="w-7 h-7 text-white relative z-10" />
            )}
          </button>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/20 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-white/15 rounded-full blur-sm animate-pulse" 
             style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );
};