import React, { useState } from 'react';
import { X, Target, Sparkles, Heart } from 'lucide-react';

interface LifeGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: string) => void;
}

export const LifeGoalsModal: React.FC<LifeGoalsModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [goal, setGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsSubmitting(true);
    
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(goal.trim());
    setGoal('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setGoal('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel-physical max-w-lg w-full mx-4 transform transition-all duration-500 scale-100 animate-in">
        
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
        
        <div className="relative z-10 p-8">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white 
                       transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with icon */}
          <div className="text-center mb-8">
            <div className="glass-icon-physical mx-auto mb-4">
              {/* Icon container light sources */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-2xl"></div>
              <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/50 via-white/30 to-white/15 rounded-l-2xl"></div>
              <div className="absolute inset-0 rounded-2xl border border-white/35 pointer-events-none"></div>
              
              <Target className="w-8 h-8 text-white relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            </div>
            
            <h2 className="text-3xl font-playfair font-semibold text-white mb-2 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
              你的人生目标是什么？
            </h2>
            
            <p className="text-white/80 text-lg font-inter filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              分享你内心深处的梦想与追求
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="在这里写下你的人生目标..."
                className="w-full h-32 px-4 py-3 bg-white/15 backdrop-blur-md 
                           border border-white/25 rounded-xl text-white placeholder-white/60
                           focus:outline-none focus:ring-2 focus:ring-blue-400/50 
                           focus:border-blue-400/50 transition-all duration-300
                           resize-none font-inter filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                maxLength={500}
                required
              />
              
              {/* Character count */}
              <div className="absolute bottom-2 right-3 text-xs text-white/50">
                {goal.length}/500
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="glass-button-secondary-physical flex-1"
              >
                {/* Secondary button light sources */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-t-xl"></div>
                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/30 via-white/20 to-white/10 rounded-l-xl"></div>
                <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none"></div>
                
                <span className="relative z-10 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">取消</span>
              </button>
              
              <button
                type="submit"
                disabled={!goal.trim() || isSubmitting}
                className="glass-button-physical flex-1 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {/* Button light sources */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-2xl"></div>
                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gradient-to-b from-white/50 via-white/30 to-white/15 rounded-l-2xl"></div>
                <div className="absolute inset-0 rounded-2xl border border-white/35 pointer-events-none"></div>
                
                <span className="relative z-10 flex items-center gap-2 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white 
                                      rounded-full animate-spin"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      分享目标
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};