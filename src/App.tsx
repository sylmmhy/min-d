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
    <div className="relative h-screen overflow-hidden">
      {/* 3D Scene Background */}
      <SplineScene />
      
      {/* Spline Event Handler - handles real-time events from Spline */}
      <SplineEventHandler onEventReceived={handleSplineEvent} />

      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10"></div>
    </div>
  );
}

export default App;