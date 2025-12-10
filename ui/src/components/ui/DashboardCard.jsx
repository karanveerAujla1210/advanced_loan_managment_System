import React from "react";
import { motion } from "framer-motion";

export default function DashboardCard({ title, value, delta, children, icon, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }}
      className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && <span className="text-gray-400 text-sm">{icon}</span>}
            <div className="text-xs text-gray-500 uppercase tracking-wide">{title}</div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        {delta !== undefined && (
          <div className={`text-sm font-medium ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </div>
        )}
      </div>
      {children && (
        <div className="mt-3 text-sm text-gray-600">{children}</div>
      )}
    </motion.div>
  );
}