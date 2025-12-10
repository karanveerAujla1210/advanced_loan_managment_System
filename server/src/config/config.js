module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/loancrm',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  env: process.env.NODE_ENV || 'development'
};
