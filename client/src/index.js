
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { setupConsoleFilters } from './utils/consoleFilter';

// Setup console filters to reduce noise from React/Browser development logs
setupConsoleFilters();

// Suppress React development warnings in console for cleaner output
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  
  // Filter out React-specific verbose logs
  console.error = (...args) => {
    const message = args[0]?.toString?.() || '';
    
    // Skip React DevTools and internal React warnings
    if (
      message.includes('Warning: ReactDOM.render') ||
      message.includes('You are calling ReactDOM.render') ||
      message.includes('[react-dom]') ||
      message.includes('Download the React DevTools')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

// Get root element
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
  throw new Error('Failed to find root element');
}

// Create root using React 18 API
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app - Note: Removed React.StrictMode to reduce double-logging in development
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();