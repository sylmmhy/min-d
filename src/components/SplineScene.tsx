import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

export const SplineScene: React.FC = () => {
  const handleSplineError = (error: any) => {
    console.error('Spline scene error:', error);
  };

  const handleSplineLoad = () => {
    console.log('Spline scene loaded successfully');
  };

  // Add cache busting parameter to force reload
  const splineUrl = `https://prod.spline.design/edOeRvrcuWyGaD41/scene.splinecode?v=${Date.now()}`;

  return (
    <div className="fixed inset-0 z-0">
      <Suspense fallback={
        <div className="w-full h-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
          <div className="text-white text-lg font-light">Loading the ocean...</div>
        </div>
      }>
        <Spline
          scene={splineUrl}
          style={{ width: '100%', height: '100%' }}
          onLoad={handleSplineLoad}
          onError={handleSplineError}
        />
      </Suspense>
    </div>
  );
};