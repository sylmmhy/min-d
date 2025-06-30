import React from 'react';
import { Compass, Wind, Target } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md 
                      border border-white/30 rounded-3xl p-10 max-w-2xl w-full mx-4 
                      transform transition-all duration-700 scale-100 animate-in">
        
        {/* Decorative elements */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full 
                          animate-pulse shadow-lg shadow-blue-400/50"></div>
        </div>

        {/* Header with sailing icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 
                          bg-gradient-to-br from-blue-400/30 to-purple-400/30 
                          rounded-full mb-6 backdrop-blur-sm border border-white/30
                          animate-float">
            <Compass className="w-10 h-10 text-white animate-spin" style={{animationDuration: '8s'}} />
          </div>
          
          <h1 className="text-4xl font-playfair font-bold text-white mb-4 animate-glow">
            欢迎启航
          </h1>
        </div>

        {/* Main content */}
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Wind className="w-6 h-6 text-blue-300 animate-pulse" />
            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1"></div>
            <Target className="w-6 h-6 text-purple-300 animate-pulse" />
          </div>

          <p className="text-xl text-white/90 font-inter leading-relaxed mb-6">
            系统会调用传感器来监测你是否当下在做重要的事情。
          </p>
          
          <p className="text-lg text-white/80 font-inter leading-relaxed mb-8">
            当你做和目标有关的事情的时候，会吹起不同的意念之风，推进你的小船帮你到达目的地。
          </p>

          {/* Action button */}
          <button
            onClick={onClose}
            className="px-8 py-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80
                       hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl 
                       transition-all duration-300 font-inter font-medium text-lg
                       shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                       transform hover:scale-105"
          >
            开始旅程
          </button>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400/40 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-purple-400/40 rounded-full blur-sm animate-pulse" 
             style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/4 -right-2 w-2 h-2 bg-white/30 rounded-full blur-sm animate-pulse"
             style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 -left-2 w-3 h-3 bg-blue-300/30 rounded-full blur-sm animate-pulse"
             style={{animationDelay: '0.5s'}}></div>

        {/* Wind effect lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent
                          animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent
                          animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
      </div>
    </div>
  );
};