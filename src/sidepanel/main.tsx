import React from 'react';
import ReactDOM from 'react-dom/client';
import { SidePanelApp } from './SidePanelApp';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { AuthWall } from '../shared/AuthWall';
import '../shared/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthWall>
        <SidePanelApp />
      </AuthWall>
    </ErrorBoundary>
  </React.StrictMode>
);
