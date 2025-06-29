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
      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md 
                      border border-white/20 rounded-3xl p-8 max-w-lg w-full mx-4 
                      transform transition-all duration-500 scale-100 animate-in">
        
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
          <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-gradient-to-br from-blue-400/20 to-purple-400/20 
                          rounded-full mb-4 backdrop-blur-sm border border-white/20">
            <Target className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-playfair font-semibold text-white mb-2">
            你的人生目标是什么？
          </h2>
          
          <p className="text-white/70 text-lg font-inter">
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
              className="w-full h-32 px-4 py-3 bg-white/10 backdrop-blur-sm 
                         border border-white/20 rounded-xl text-white placeholder-white/50
                         focus:outline-none focus:ring-2 focus:ring-blue-400/50 
                         focus:border-blue-400/50 transition-all duration-300
                         resize-none font-inter"
              maxLength={500}
              required
            />
            
            {/* Character count */}
            <div className="absolute bottom-2 right-3 text-xs text-white/40">
              {goal.length}/500
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 
                         text-white rounded-xl transition-all duration-300
                         border border-white/20 hover:border-white/30
                         font-inter font-medium"
            >
              取消
            </button>
            
            <button
              type="submit"
              disabled={!goal.trim() || isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500/80 to-purple-500/80
                         hover:from-blue-500 hover:to-purple-500 text-white rounded-xl 
                         transition-all duration-300 disabled:opacity-50 
                         disabled:cursor-not-allowed font-inter font-medium
                         flex items-center justify-center gap-2"
            >
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
            </button>
          </div>
        </form>

        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400/30 rounded-full blur-sm"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400/30 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 -right-4 w-2 h-2 bg-white/20 rounded-full blur-sm"></div>
      </div>
    </div>
  );
};