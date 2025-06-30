import React from 'react';
import { SplineScene } from './components/SplineScene';
import { SplineEventHandler } from './components/SplineEventHandler';

function App() {
  const handleSplineEvent = (event: any) => {
    console.log('Spline event received in App:', event);
    // You can add custom logic here to handle different types of events
    // For example, trigger different animations or UI changes based on event.payload
  };

  return (
    <div className="relative h-screen">
      {/* 3D Scene Background */}
      <SplineScene />
      
      {/* Spline Event Handler - handles real-time events from Spline */}
      <SplineEventHandler onEventReceived={handleSplineEvent} />

      {/* Muted gray-blue gradient overlay with reduced saturation */}
      <div className="fixed inset-0 pointer-events-none z-10"
           style={{
             background: `linear-gradient(135deg, 
               rgba(141, 176, 202, 0.15) 0%, 
               rgba(141, 176, 202, 0.08) 30%, 
               rgba(141, 176, 202, 0.12) 70%, 
               rgba(141, 176, 202, 0.20) 100%)`
           }}>
      </div>
    </div>
  );
}

export default App;