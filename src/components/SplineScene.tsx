import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

export const SplineScene: React.FC = () => {
  const handleSplineError = (error: any) => {
    console.error('Spline scene error:', error);
  };

  return (
    <div className="fixed inset-0 z-0">
      <Suspense fallback={
        <div className="w-full h-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
          <div className="text-white text-lg font-light">Loading the ocean...</div>
        </div>
      }>
        <Spline
          scene="https://prod.spline.design/edOeRvrcuWyGaD41/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
          onError={handleSplineError}
        />
      </Suspense>
    </div>
  );
};