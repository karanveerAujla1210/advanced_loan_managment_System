import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

const TabWorkspace = ({ children, className }) => {
  const [tabs, setTabs] = useState([
    { id: 1, title: 'Dashboard', component: 'Dashboard', closable: false }
  ]);
  const [activeTab, setActiveTab] = useState(1);

  const addTab = (title, component, data = null) => {
    const newTab = {
      id: Date.now(),
      title,
      component,
      data,
      closable: true
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId) => {
    if (tabs.length <= 1) return;
    
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (activeTab === tabId) {
        setActiveTab(filtered[filtered.length - 1]?.id || filtered[0]?.id);
      }
      return filtered;
    });
  };

  const renderTabContent = (tab) => {
    // This would be replaced with actual component rendering logic
    switch (tab.component) {
      case 'Dashboard':
        return <div className="p-6">Dashboard Content</div>;
      case 'BorrowerProfile':
        return <div className="p-6">Borrower Profile: {tab.data?.name}</div>;
      case 'LoanDetails':
        return <div className="p-6">Loan Details: {tab.data?.loanId}</div>;
      case 'PaymentScreen':
        return <div className="p-6">Payment Screen</div>;
      default:
        return <div className="p-6">Unknown Component</div>;
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-50 border-b overflow-x-auto">
        <div className="flex items-center min-w-0">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-r cursor-pointer transition-colors min-w-0',
                activeTab === tab.id
                  ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="truncate max-w-32">{tab.title}</span>
              {tab.closable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Add Tab Button */}
        <button
          onClick={() => addTab('New Tab', 'Dashboard')}
          className="p-3 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {tabs.map((tab) => (
            tab.id === activeTab && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderTabContent(tab)}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hook to use tab workspace
export const useTabWorkspace = () => {
  const addTab = (title, component, data) => {
    // This would integrate with a global state or context
    console.log('Adding tab:', { title, component, data });
  };

  return { addTab };
};

export default TabWorkspace;