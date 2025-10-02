
import { createContext } from 'react';
// FIX: Add HealthStatus to the list of imported types.
import { Telemetry, Alert, RLSuggestion, HealthStatus } from '../types';
import { GoogleGenAI } from '@google/genai';

interface AppContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  connectionStatus: string;
  latestTelemetry: Telemetry | null;
  alerts: Alert[];
  rlSuggestion: RLSuggestion | null;
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  setRlSuggestion: React.Dispatch<React.SetStateAction<RLSuggestion | null>>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currency: 'USD' | 'EUR' | 'INR';
  setCurrency: (currency: 'USD' | 'EUR' | 'INR') => void;
  ai: GoogleGenAI | null;
  // FIX: Add healthStatus to the context type definition.
  healthStatus: HealthStatus | null;
}

export const AppContext = createContext<AppContextType | null>(null);
