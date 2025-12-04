import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Add error boundary for debugging
const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('React render error:', error);
  document.getElementById('root').innerHTML = `
    <div style="color: white; padding: 20px; text-align: center;">
      <h1>Error Loading App</h1>
      <p>${error.message}</p>
    </div>
  `;
}