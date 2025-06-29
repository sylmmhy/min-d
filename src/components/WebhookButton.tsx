import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

export const WebhookButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<Date | null>(null);

  const handleClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/spline-webhook/gpRFQacPBZs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ number: 1 })
      });

      if (response.ok) {
        setLastTriggered(new Date());
      } else {
        console.error('Webhook call failed:', response.status);
      }
    } catch (error) {
      console.error('Error calling webhook:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-30">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-4 
                   hover:bg-white/20 hover:border-white/30 transition-all duration-300 
                   hover:scale-110 hover:shadow-lg hover:shadow-white/20
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Play className="w-6 h-6 text-white group-hover:text-blue-200 transition-colors duration-300" />
        )}
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 
                        transition-transform duration-200 opacity-0 group-active:opacity-100"></div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm 
                        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        whitespace-nowrap pointer-events-none">
          Trigger Animation
        </div>
      </button>
      
      {/* Success indicator */}
      {lastTriggered && (
        <div className="absolute bottom-full right-0 mb-16 px-3 py-1 bg-green-500/80 text-white text-xs 
                        rounded-lg animate-pulse">
          Triggered at {lastTriggered.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};