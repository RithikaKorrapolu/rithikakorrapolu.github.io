// src/likes.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import LikesPage from './components/likesPage';
import { initializeMenu } from '../likes';

// Error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-black text-white p-8">Something went wrong. Please check the console for details.</div>;
    }
    return this.props.children;
  }
}

// Initialize React
const container = document.getElementById('likes-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <LikesPage />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Initialize menu after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMenu);