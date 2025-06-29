import React, { useEffect, useState } from 'react';
import { SplineScene } from './components/SplineScene';
import { WebhookButton } from './components/WebhookButton';
import { SplineEventHandler } from './components/SplineEventHandler';

function App() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSplineEvent = (event: any) => {
    console.log('Spline event received in App:', event);
    // You can add custom logic here to handle different types of events
    // For example, trigger different animations or UI changes based on event.payload
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* 3D Scene Background */}
      <SplineScene />
      
      {/* Spline Event Handler - handles real-time events from Spline */}
      <SplineEventHandler onEventReceived={handleSplineEvent} />
      
      {/* Webhook Button - for manual testing */}
      <WebhookButton />
      
      {/* Invisible content sections to enable scrolling - with pointer-events-none */}
      <div className="relative z-20 pointer-events-none">
        {/* Section 1 - Full height to enable scroll */}
        <section className="min-h-screen"></section>
        
        {/* Section 2 - Additional scroll space */}
        <section className="min-h-screen"></section>
        
        {/* Section 3 - More scroll space */}
        <section className="min-h-screen"></section>
        
        {/* Section 4 - Even more scroll space */}
        <section className="min-h-screen"></section>
        
        {/* Section 5 - Final scroll space */}
        <section className="min-h-screen"></section>
        
        {/* Section 6 - Last section */}
        <section className="min-h-screen"></section>
      </div>

      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10"></div>
    </div>
  );
}

export default App;