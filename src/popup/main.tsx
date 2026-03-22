import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from './PopupApp';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { AuthWall } from '../shared/AuthWall';
import '../shared/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthWall>
        <PopupApp />
      </AuthWall>
    </ErrorBoundary>
  </React.StrictMode>
);
