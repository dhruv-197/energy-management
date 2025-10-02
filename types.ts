import { Type } from "@google/genai";

export interface Telemetry {
  timestamp: string;
  site_id: string;
  device_id: string;
  subsystem: string;
  metrics: {
    voltage: number;
    current: number;
    frequency: number;
    thd?: number;
    temp_c: number;
    pv_generation?: number;
    pv_irradiance?: number;
    soc_batt?: number;
    net_load?: number;
    battery_discharge?: number;
  };
  waveform_refs?: {
    [key:string]: string;
  };
}

export interface Alert {
  id: string;
  timestamp: string;
  device_id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  diagnosis: string;
  recommended_action: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface EnergyFlows {
    grid_to_load: number;
    pv_to_load: number;
    pv_to_battery: number;
    battery_to_load: number;
    battery_to_grid: number; // For V2G
    pv_to_grid: number; // Selling back
}

export interface RLSuggestion {
  id: string;
  timestamp: string;
  action_summary: string;
  explanation: string[];
  confidence: number;
  estimated_cost_savings: number;
  status: 'pending' | 'accepted' | 'rejected';
  current_flows: EnergyFlows;
  suggested_flows: EnergyFlows;
}

export interface MaintenanceAsset {
  id: string;
  name: string;
  type: string;
  failure_probability: number;
  rank: number;
}

export interface HealthStatus {
  site_health: number;
  grid_draw: number;
  battery_soc: number;
  pv_generation_today: number;
  battery_soh: number;
  inverter_health: number;
  motor_health: number;
  pv_health: number;
  ev_charger_health: number;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  displayKey: string;
  createdAt: string;
  status: 'active' | 'inactive';
}