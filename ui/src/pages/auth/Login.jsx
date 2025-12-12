import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { cn } from '../../utils/cn';

const demoCredentials = [
  { role: 'Admin', username: 'admin', password: 'admin123' },
  { role: 'Manager', username: 'manager', password: 'manager123' },
  { role: 'Counsellor', username: 'counsellor', password: 'counsellor123' },
  { role: 'Collection', username: 'collection', password: 'collection123' }
];

const features = [
  { icon: Shield, text: 'Secure Authentication' },
  { icon: CheckCircle, text: 'Role-based Access' },
  { icon: Sparkles, text: 'Modern Interface' }
];

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (credentials) => {
    setFormData(credentials);
    setLoading(true);
    setError('');
    
    try {
      await login(credentials.username, credentials.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl animate-float" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center"
      >
        {/* Left side - Branding & Features */}
        <motion.div variants={itemVariants} className="text-white space-y-8 lg:pr-8">
          <div className="space-y-4">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-12 w-12 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold">L</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  LoanCRM
                </h1>
                <p className="text-primary-200 text-sm">Advanced Loan Management</p>
              </div>
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Streamline Your
                <span className="block bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent">
                  Loan Operations
                </span>
              </h2>
              <p className="text-lg text-primary-100 leading-relaxed">
                Comprehensive loan management system designed for microfinance institutions with powerful analytics and seamless workflow automation.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {features.map((feature, index) => (
                index === currentFeature && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                  >
                    <feature.icon className="h-6 w-6 text-primary-300" />
                    <span className="text-white font-medium">{feature.text}</span>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            
            <div className="flex gap-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    index === currentFeature ? "w-8 bg-primary-300" : "w-2 bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div variants={itemVariants} className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-16 w-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Lock className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                leftIcon={<User className="h-5 w-5" />}
                placeholder="Enter your username"
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                leftIcon={<Lock className="h-5 w-5" />}
                placeholder="Enter your password"
                showPasswordToggle
                disabled={loading}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                rightIcon={!loading && <ArrowRight className="h-5 w-5" />}
                className="shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Demo Access</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemo(!showDemo)}
                >
                  {showDemo ? 'Hide' : 'Show'} Credentials
                </Button>
              </div>
              
              <AnimatePresence>
                {showDemo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {demoCredentials.map((cred, index) => (
                      <motion.button
                        key={cred.role}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleDemoLogin(cred)}
                        disabled={loading}
                        className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{cred.role}</div>
                            <div className="text-xs text-gray-500">{cred.username} / {cred.password}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}