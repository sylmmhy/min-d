import React, { useState } from 'react';
import { X, Target, Heart } from 'lucide-react';
import { designSystem, getButtonStyle, getPanelStyle } from '../styles/designSystem';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`relative ${getPanelStyle()} p-10 max-w-lg w-full mx-4 
                      transform transition-all duration-500 scale-100 animate-in`}>
        
        {/* Very subtle inner glow overlay */}
        <div className={designSystem.patterns.innerGlow}></div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 ${designSystem.colors.text.subtle} hover:${designSystem.colors.text.primary} 
                     ${designSystem.effects.transitions.default} p-2 rounded-full hover:bg-white/10`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with icon */}
        <div className="text-center mb-8 relative z-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 
                          ${designSystem.patterns.iconContainer} mb-4`}>
            {/* Very subtle inner highlight for icon container */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent rounded-2xl"></div>
            <Target className="w-8 h-8 text-white relative z-10" />
          </div>
          
          <h2 className={`${designSystem.typography.sizes['3xl']} ${designSystem.typography.fonts.heading} 
                         ${designSystem.typography.weights.semibold} ${designSystem.colors.text.primary} mb-2`}>
            What kind of person do you want to become?
          </h2>
          
          <p className={`${designSystem.colors.text.muted} ${designSystem.typography.sizes.lg} ${designSystem.typography.fonts.body}`}>
            The Mind Boat gently filters out distractions, helping you focus on what truly matters and guiding you toward self-awareness and personal growth.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="relative">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Share your thoughts on who you want to become..."
              className={`w-full h-32 px-4 py-3 ${designSystem.patterns.inputField}
                         resize-none ${designSystem.typography.fonts.body}`}
              maxLength={500}
              required
            />
            
            {/* Character count */}
            <div className={`absolute bottom-2 right-3 ${designSystem.typography.sizes.xs} ${designSystem.colors.text.subtle}`}>
              {goal.length}/500
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 ${getButtonStyle('glass', 'lg')}`}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!goal.trim() || isSubmitting}
              className={`flex-1 ${getButtonStyle('accent', 'lg')} 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white 
                                  rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Share Vision
                </>
              )}
            </button>
          </div>
        </form>

        {/* Very subtle decorative elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/20 rounded-full blur-sm"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white/15 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 -right-4 w-2 h-2 bg-white/25 rounded-full blur-sm"></div>
      </div>
    </div>
  );
};