import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const KpiCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = 'blue',
  isLoading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className={cn(
        'p-6 rounded-xl border-2 bg-white transition-all duration-200',
        colorClasses[color]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-lg', `bg-${color}-100`)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <motion.p 
              key={value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-gray-900"
            >
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                value
              )}
            </motion.p>
          </div>
        </div>
        {change && (
          <div className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
            trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          )}>
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KpiCard;