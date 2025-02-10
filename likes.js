import React from 'react';
import { createRoot } from 'react-dom/client';
import LikesPage from './src/components/likesPage.jsx';
import { initializeMenu } from './main.js';

// Initialize React
const container = document.getElementById('likes-root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <LikesPage />
        </React.StrictMode>
    );
}

// Initialize menu after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMenu);