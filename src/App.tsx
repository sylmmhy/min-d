import React from 'react';
import { SplineScene } from './components/SplineScene';
import { SplineEventHandler } from './components/SplineEventHandler';

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSplineEvent = (event: any) => {
    console.log('Spline event received in App:', event);
    // You can add custom logic here to handle different types of events
    // For example, trigger different animations or UI changes based on event.payload
  };

  // 监听模态框状态变化
  React.useEffect(() => {
    const handleModalStateChange = (event: CustomEvent) => {
      setIsModalOpen(event.detail.isOpen);
    };

    window.addEventListener('modalStateChange', handleModalStateChange as EventListener);
    
    return () => {
      window.removeEventListener('modalStateChange', handleModalStateChange as EventListener);
    };
  }, []);

  return (
    <div className="relative h-screen">
      {/* 3D Scene Background - 传递交互禁用状态 */}
      <SplineScene isInteractionDisabled={isModalOpen} />
      
      {/* Spline Event Handler - handles real-time events from Spline */}
      <SplineEventHandler 
        onEventReceived={handleSplineEvent}
        onModalStateChange={setIsModalOpen}
      />

      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10"></div>
    </div>
  );
}

export default App;