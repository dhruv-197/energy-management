
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SiteDetailPage from './pages/SiteDetailPage';
import AlertsPage from './pages/AlertsPage';
import MaintenancePage from './pages/MaintenancePage';
import SimulatorPage from './pages/SimulatorPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { AppContext } from './contexts/AppContext';
// FIX: Add HealthStatus to import
import { Telemetry, Alert, RLSuggestion, HealthStatus } from './types';
import { useWebSocket } from './hooks/useWebSocket';
import { GoogleGenAI } from '@google/genai';
// FIX: Import fetchHealthStatus to fetch data globally
import { fetchHealthStatus } from './services/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('jwt'));
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );
  
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'INR'>(
    (localStorage.getItem('currency') as 'USD' | 'EUR' | 'INR') || 'USD'
  );
  
  const [ai] = useState<GoogleGenAI | null>(() => 
    process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const [latestTelemetry, setLatestTelemetry] = useState<Telemetry | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rlSuggestion, setRlSuggestion] = useState<RLSuggestion | null>(null);
  // FIX: Add healthStatus state to be managed globally
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  // FIX: Fetch health status globally when authenticated
  useEffect(() => {
    const getHealthStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await fetchHealthStatus('site_123');
          setHealthStatus(status);
        } catch (error) {
          console.error('Failed to fetch health status:', error);
        }
      } else {
        setHealthStatus(null);
      }
    };
    
    getHealthStatus();

    if (isAuthenticated) {
      const interval = setInterval(getHealthStatus, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const login = (token: string) => {
    localStorage.setItem('jwt', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
  };

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'telemetry_update':
          setLatestTelemetry(data.payload);
          break;
        case 'alert':
          setAlerts(prevAlerts => [data.payload, ...prevAlerts]);
          break;
        case 'rl_suggestion':
          setRlSuggestion(data.payload);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, []);

  const { connectionStatus } = useWebSocket('wss://mock-api.energy-ems.com/ws/site/site_123', handleWebSocketMessage, isAuthenticated);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const appContextValue = {
    isAuthenticated,
    login,
    logout,
    connectionStatus,
    latestTelemetry,
    alerts,
    rlSuggestion,
    setAlerts,
    setRlSuggestion,
    theme,
    setTheme,
    currency,
    setCurrency,
    ai,
    // FIX: Provide healthStatus through context
    healthStatus,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
        {!isAuthenticated ? (
            <LoginPage onLogin={login} />
        ) : (
            <HashRouter>
                <div className="flex flex-col h-screen">
                    {false && <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />}
                    <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 md:p-6 lg:p-8">
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/site-detail" element={<SiteDetailPage />} />
                                <Route path="/alerts" element={<AlertsPage />} />
                                <Route path="/maintenance" element={<MaintenancePage />} />
                                <Route path="/simulator" element={<SimulatorPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                            </Routes>
                    </main>
                </div>
            </HashRouter>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
