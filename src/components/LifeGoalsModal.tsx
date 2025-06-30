import React, { useState } from 'react';
import { Target, Heart } from 'lucide-react';

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

  const handleNext = () => {
    if (goal.trim()) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg">
      <div className="relative bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl 
                      p-12 max-w-2xl w-full mx-4 transform transition-all duration-500 scale-100 animate-in
                      shadow-2xl shadow-black/20">
        
        {/* Ultra subtle inner glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent 
                        rounded-3xl pointer-events-none"></div>

        {/* Header with icon */}
        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 
                          bg-white/10 backdrop-blur-md border border-white/20 
                          rounded-2xl mb-6 shadow-lg shadow-white/5
                          relative overflow-hidden">
            {/* Ultra subtle inner highlight for icon container */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/3 to-transparent rounded-2xl"></div>
            <Target className="w-10 h-10 text-white relative z-10" />
          </div>
          
          <h2 className="text-5xl font-playfair font-semibold text-white mb-6 leading-tight">
            What kind of person do you want to become?
          </h2>
          
          <p className="text-white/85 text-base font-inter leading-relaxed max-w-lg mx-auto">
            The Mind Boat gently filters out distractions, helping you focus on what truly matters and guiding you toward self-awareness and personal growth.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="relative">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Share your thoughts on who you want to become..."
              className="w-full h-40 px-6 py-4 bg-white/8 backdrop-blur-md 
                         border border-white/15 rounded-2xl text-white placeholder-white/50
                         focus:outline-none focus:ring-2 focus:ring-white/20 
                         focus:border-white/25 transition-all duration-300
                         resize-none font-inter text-base leading-relaxed
                         shadow-inner shadow-black/10"
              maxLength={500}
              required
            />
            
            {/* Character count */}
            <div className="absolute bottom-3 right-4 text-xs text-white/40 font-inter">
              {goal.length}/500
            </div>
          </div>

          {/* Single Next button */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleNext}
              disabled={!goal.trim() || isSubmitting}
              className="px-16 py-4 bg-white/10 hover:bg-white/15 
                         text-white rounded-2xl transition-all duration-300
                         border border-white/20 hover:border-white/30
                         font-inter font-medium text-lg backdrop-blur-md
                         shadow-lg shadow-white/5 hover:shadow-white/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transform hover:scale-[1.02] active:scale-[0.98]
                         flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white 
                                  rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Next
                </>
              )}
            </button>
          </div>
        </form>

        {/* Ultra subtle decorative elements */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/15 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-white/10 rounded-full blur-sm animate-pulse" 
             style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 -right-3 w-3 h-3 bg-white/20 rounded-full blur-sm animate-pulse"
             style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 -left-3 w-4 h-4 bg-white/12 rounded-full blur-sm animate-pulse"
             style={{animationDelay: '0.5s'}}></div>
      </div>
    </div>
  );
};