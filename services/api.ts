
import { HealthStatus, Alert, MaintenanceAsset } from '../types';
import { MOCK_ALERTS, MOCK_HEALTH_STATUS, MOCK_MAINTENANCE_ASSETS, MOCK_TELEMETRY_DATA } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

// --- MOCK API IMPLEMENTATION ---
// In a real app, these would be fetch calls to the backend.

export const apiLogin = async (email: string, password: string): Promise<{ token: string }> => {
  console.log(`Logging in with ${email}`);
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  if (email === 'operator@ems.com' && password === 'password') {
    return { token: 'mock-jwt-token' };
  }
  throw new Error('Invalid credentials');
};

export const fetchHealthStatus = async (siteId: string): Promise<HealthStatus> => {
  console.log(`Fetching health status for site ${siteId}`);
  await new Promise(res => setTimeout(res, 800));
  return MOCK_HEALTH_STATUS;
};

export const fetchAlerts = async (siteId: string): Promise<Alert[]> => {
  console.log(`Fetching alerts for site ${siteId}`);
  await new Promise(res => setTimeout(res, 600));
  return MOCK_ALERTS;
};

export const acknowledgeAlert = async (siteId: string, alertId: string): Promise<{ success: boolean }> => {
  console.log(`Acknowledging alert ${alertId} for site ${siteId}`);
  await new Promise(res => setTimeout(res, 400));
  return { success: true };
};

export const acceptRLSuggestion = async (siteId: string, suggestionId: string): Promise<{ success: boolean, schedule: string }> => {
    console.log(`Accepting RL suggestion ${suggestionId} for site ${siteId}`);
    await new Promise(res => setTimeout(res, 500));
    return { success: true, schedule: "Action scheduled successfully. Details available in logs." };
};

export const rejectRLSuggestion = async (siteId: string, suggestionId: string): Promise<{ success: boolean }> => {
    console.log(`Rejecting RL suggestion ${suggestionId} for site ${siteId}`);
    await new Promise(res => setTimeout(res, 500));
    return { success: true };
};

export const fetchMaintenanceAssets = async (siteId: string): Promise<MaintenanceAsset[]> => {
  console.log(`Fetching maintenance assets for site ${siteId}`);
  await new Promise(res => setTimeout(res, 700));
  return MOCK_MAINTENANCE_ASSETS;
};

export const scheduleMaintenance = async (siteId: string, assetId: string): Promise<{ success: boolean }> => {
    console.log(`Scheduling maintenance for asset ${assetId} on site ${siteId}`);
    await new Promise(res => setTimeout(res, 500));
    return { success: true };
};

export const runSimulation = async (params: { pvCurtail: number, batteryTarget: number, gridPrice: number }): Promise<{ cost: number[], emissions: number[] }> => {
    console.log('Running simulation with params:', params);
    await new Promise(res => setTimeout(res, 1500));
    const baseCost = 1000;
    const baseEmissions = 500;
    
    const cost = Array.from({length: 24}, (_, i) => baseCost - (params.pvCurtail * i) - (params.batteryTarget * 5 * i) + (params.gridPrice * 2 * i) + Math.random() * 50);
    const emissions = Array.from({length: 24}, (_, i) => baseEmissions - (params.pvCurtail * 2 * i) - (params.batteryTarget * 2 * i) + Math.random() * 20);

    return { cost, emissions };
};


export const fetchTimeseriesData = async (range: string) => {
    console.log(`Fetching timeseries data for range: ${range}`);
    await new Promise(res => setTimeout(res, 1000));
    return MOCK_TELEMETRY_DATA.slice(0, 50);
}
