import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import CommandBar from './components/ui/CommandBar';
import Login from './pages/auth/Login';
import RealTimeDashboard from './pages/dashboard/RealTimeDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import BorrowerList from './pages/borrowers/BorrowerList';
import BorrowerProfile from './pages/borrowers/BorrowerProfile';
import LoanApplications from './pages/loans/LoanApplications';
import LoanDetails from './pages/loans/LoanDetails';
import LoanDetailsPage from './pages/loan/LoanDetailsPage';
import LoanCreateWizard from './pages/loans/LoanCreateWizard';
import DisbursementQueue from './pages/disbursement/DisbursementQueue';
import DailyCollections from './pages/collections/DailyCollections';
import OverdueBuckets from './pages/collections/OverdueBuckets';
import CollectionsBoard from './components/ui/CollectionsBoard';
import LegalCases from './pages/legal/LegalCases';
import Branches from './pages/settings/Branches';
import ReportsHome from './pages/reports/ReportsHome';
import PortfolioReport from './pages/reports/PortfolioReport';
import AgingReport from './pages/reports/AgingReport';
import CollectionReport from './pages/reports/CollectionReport';
import NPAReport from './pages/reports/NPAReport';
import DisbursementReport from './pages/reports/DisbursementReport';
import LegalReport from './pages/reports/LegalReport';
import AgentPerformanceReport from './pages/reports/AgentPerformanceReport';
import BranchPerformanceReport from './pages/reports/BranchPerformanceReport';
import BorrowerMasterReport from './pages/reports/BorrowerMasterReport';
import ExportCenter from './pages/reports/ExportCenter';
import useAuthStore from './store/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><RealTimeDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              
              {/* Borrowers */}
              <Route path="/borrowers" element={<ProtectedRoute><BorrowerList /></ProtectedRoute>} />
              <Route path="/borrowers/:id" element={<ProtectedRoute><BorrowerProfile /></ProtectedRoute>} />
              
              {/* Loans */}
              <Route path="/loans" element={<ProtectedRoute><LoanApplications /></ProtectedRoute>} />
              <Route path="/loans/applications" element={<ProtectedRoute><LoanApplications /></ProtectedRoute>} />
              <Route path="/loans/create" element={<ProtectedRoute><LoanCreateWizard /></ProtectedRoute>} />
              <Route path="/loans/:id" element={<ProtectedRoute><LoanDetails /></ProtectedRoute>} />
              <Route path="/loan/:loanId" element={<ProtectedRoute><LoanDetailsPage /></ProtectedRoute>} />
              
              {/* Disbursement */}
              <Route path="/disbursement" element={<ProtectedRoute><DisbursementQueue /></ProtectedRoute>} />
              
              {/* Collections */}
              <Route path="/collections" element={<ProtectedRoute><DailyCollections /></ProtectedRoute>} />
              <Route path="/collections/daily" element={<ProtectedRoute><DailyCollections /></ProtectedRoute>} />
              <Route path="/collections/overdue" element={<ProtectedRoute><OverdueBuckets /></ProtectedRoute>} />
              <Route path="/collections/board" element={<ProtectedRoute><CollectionsBoard /></ProtectedRoute>} />
              
              {/* Legal */}
              <Route path="/legal" element={<ProtectedRoute><LegalCases /></ProtectedRoute>} />
              
              {/* Reports */}
              <Route path="/reports" element={<ProtectedRoute><ReportsHome /></ProtectedRoute>} />
              <Route path="/reports/portfolio" element={<ProtectedRoute><PortfolioReport /></ProtectedRoute>} />
              <Route path="/reports/aging" element={<ProtectedRoute><AgingReport /></ProtectedRoute>} />
              <Route path="/reports/collection" element={<ProtectedRoute><CollectionReport /></ProtectedRoute>} />
              <Route path="/reports/disbursement" element={<ProtectedRoute><DisbursementReport /></ProtectedRoute>} />
              <Route path="/reports/npa" element={<ProtectedRoute><NPAReport /></ProtectedRoute>} />
              <Route path="/reports/legal" element={<ProtectedRoute><LegalReport /></ProtectedRoute>} />
              <Route path="/reports/agent-performance" element={<ProtectedRoute><AgentPerformanceReport /></ProtectedRoute>} />
              <Route path="/reports/branch-performance" element={<ProtectedRoute><BranchPerformanceReport /></ProtectedRoute>} />
              <Route path="/reports/borrowers" element={<ProtectedRoute><BorrowerMasterReport /></ProtectedRoute>} />
            <Route path="/reports/export" element={<ProtectedRoute><ExportCenter /></ProtectedRoute>} />
              
              {/* Settings */}
              <Route path="/settings" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
            </Routes>
          </main>
          <footer className="px-6 py-3 text-xs text-gray-500 border-t bg-white">
            <div className="flex items-center justify-between">
              <span>v2.0.0 • Advanced Loan Management System</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Live Connected</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Powered by</span>
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">∞</span>
                  </div>
                  <span className="font-medium bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Infinity Tech Era
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Global Components */}
        <CommandBar />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#fff',
              borderRadius: '8px',
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
