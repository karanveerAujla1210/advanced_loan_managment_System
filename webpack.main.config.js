const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  target: 'electron-main',
  entry: './src/main/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    sqlite3: 'commonjs sqlite3',
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
  ],
};
