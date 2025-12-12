import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, Zap, Shield, Database, Sparkles } from 'lucide-react';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  
  const steps = [
    { icon: Database, text: 'Connecting to database...', duration: 1000 },
    { icon: Shield, text: 'Initializing security...', duration: 800 },
    { icon: Zap, text: 'Loading components...', duration: 1200 },
    { icon: Sparkles, text: 'Preparing dashboard...', duration: 600 }
  ];

  useEffect(() => {
    let stepIndex = 0;
    let stepProgress = 0;
    
    const timer = setInterval(() => {
      if (stepIndex < steps.length) {
        const currentStepDuration = steps[stepIndex].duration;
        const increment = 100 / (currentStepDuration / 50);
        
        stepProgress += increment;
        const totalProgress = (stepIndex * 25) + (stepProgress * 0.25);
        setProgress(Math.min(totalProgress, 100));
        
        if (stepProgress >= 100) {
          setCompletedSteps(prev => new Set([...prev, stepIndex]));
          stepIndex++;
          stepProgress = 0;
          setCurrentStep(stepIndex);
        }
      } else {
        clearInterval(timer);
        setTimeout(onComplete, 800);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.5, opacity: 0, rotateY: -180 },
    visible: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center z-50 overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl animate-float" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center relative z-10 max-w-md mx-auto px-6"
      >
        {/* Logo */}
        <motion.div variants={logoVariants} className="mb-8">
          <div className="relative">
            <motion.div
              className="h-24 w-24 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-4xl font-bold text-white">L</span>
            </motion.div>
            
            {/* Orbiting elements */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary-300 rounded-full transform -translate-x-1/2 -translate-y-12" />
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-secondary-300 rounded-full transform -translate-x-1/2 translate-y-12" />
              <div className="absolute left-0 top-1/2 w-2 h-2 bg-primary-300 rounded-full transform -translate-x-12 -translate-y-1/2" />
              <div className="absolute right-0 top-1/2 w-2 h-2 bg-secondary-300 rounded-full transform translate-x-12 -translate-y-1/2" />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            LoanCRM
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-primary-200 text-lg font-medium"
          >
            Advanced Loan Management System
          </motion.p>
        </motion.div>

        {/* Progress Section */}
        <motion.div variants={itemVariants} className="mb-8">
          {/* Progress Bar */}
          <div className="relative w-full max-w-sm mx-auto mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden border border-white/30">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
            
            <div className="flex justify-between text-sm text-primary-200 mt-2 font-medium">
              <span>Loading System</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(index);
              const StepIcon = step.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isActive || isCompleted ? 1 : 0.4,
                    x: 0,
                    scale: isActive ? 1.02 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm border transition-all ${
                    isCompleted 
                      ? 'bg-success-500/20 border-success-400/30 text-success-200'
                      : isActive 
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white/5 border-white/10 text-primary-300'
                  }`}
                >
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="completed"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <CheckCircle className="h-5 w-5 text-success-400" />
                        </motion.div>
                      ) : isActive ? (
                        <motion.div
                          key="active"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pending"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <StepIcon className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <span className="text-sm font-medium">{step.text}</span>
                  
                  {isActive && (
                    <motion.div
                      className="ml-auto flex space-x-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-current rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <p className="text-primary-300 text-sm">
            Powered by <span className="font-semibold text-white">Infinity Tech Era</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;