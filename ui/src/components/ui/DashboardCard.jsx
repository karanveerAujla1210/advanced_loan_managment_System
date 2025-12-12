import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

export default function DashboardCard({ 
  title, 
  value, 
  delta, 
  children, 
  icon, 
  loading = false, 
  variant = "default",
  trend = "neutral",
  subtitle,
  className,
  onClick,
  gradient = false
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  const variants = {
    default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    primary: "bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700",
    success: "bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700",
    warning: "bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700",
    danger: "bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-danger-200 dark:border-danger-700"
  };

  const getTrendIcon = () => {
    if (delta === undefined) return null;
    if (delta > 0) return <TrendingUp className="h-4 w-4" />;
    if (delta < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (delta === undefined) return "text-gray-500";
    if (delta > 0) return "text-success-600 dark:text-success-400";
    if (delta < 0) return "text-danger-600 dark:text-danger-400";
    return "text-gray-500 dark:text-gray-400";
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        delay: 0.2,
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.2
      }
    }
  };

  const valueVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        delay: 0.3,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
      className={cn(
        "p-6 rounded-xl shadow-soft border backdrop-blur-sm transition-all duration-300 group relative overflow-hidden",
        variants[variant],
        onClick && "cursor-pointer hover:shadow-lg",
        gradient && "bg-gradient-to-br",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <motion.div
                variants={iconVariants}
                className={cn(
                  "p-2.5 rounded-lg shadow-sm",
                  variant === "primary" && "bg-primary-500 text-white",
                  variant === "success" && "bg-success-500 text-white",
                  variant === "warning" && "bg-warning-500 text-white",
                  variant === "danger" && "bg-danger-500 text-white",
                  variant === "default" && "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {icon}
              </motion.div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Delta indicator */}
          {delta !== undefined && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                delta > 0 && "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400",
                delta < 0 && "bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400",
                delta === 0 && "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
            >
              {getTrendIcon()}
              <span>{Math.abs(delta)}%</span>
            </motion.div>
          )}
        </div>
        
        {/* Value */}
        <motion.div 
          variants={valueVariants}
          className="mb-3"
        >
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </div>
        </motion.div>
        
        {/* Additional content */}
        {children && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            {children}
          </motion.div>
        )}
      </div>
      
      {/* Hover effect overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.div>
  );
}