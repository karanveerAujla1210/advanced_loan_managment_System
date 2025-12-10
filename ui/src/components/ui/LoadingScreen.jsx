import React, { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Initializing System...",
    "Loading Modules...",
    "Connecting Database...",
    "Preparing Dashboard...",
    "Ready!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepIndex = Math.floor(progress / 20);
    setCurrentStep(Math.min(stepIndex, steps.length - 1));
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">LMS</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 animate-startup-fade">
            Advanced Loan Management System
          </h1>
          <p className="text-blue-200 text-lg animate-startup-delay">
            Professional NBFC/MFI Solution
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto mb-6">
          <div className="bg-blue-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-blue-300 mt-2">
            <span>0%</span>
            <span className="font-medium">{Math.round(progress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="mb-8">
          <p className="text-white text-lg font-medium animate-pulse">
            {steps[currentStep]}
          </p>
        </div>

        {/* Powered By */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-blue-200">
            <span className="text-sm">Powered by</span>
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">∞</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Infinity Tech Era
              </span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}