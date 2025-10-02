import { HealthStatus, Alert, MaintenanceAsset, RLSuggestion, Telemetry } from '../types';

export const MOCK_HEALTH_STATUS: HealthStatus = {
  site_health: 92.5,
  grid_draw: 150.7, // kW
  battery_soc: 78.2, // %
  pv_generation_today: 450.3, // kWh
  battery_soh: 98.1, // %
  inverter_health: 95.0,
  motor_health: 89.0,
  pv_health: 97.2,
  ev_charger_health: 99.5,
};

export const MOCK_ALERTS: Alert[] = [
  { id: 'alert-1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), device_id: 'inv_22', severity: 'critical', message: 'Inverter temperature exceeds threshold', diagnosis: 'Cooling fan failure detected.', recommended_action: 'Dispatch technician to inspect cooling system.', status: 'active' },
  { id: 'alert-2', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), device_id: 'batt_04', severity: 'warning', message: 'Battery cell voltage imbalance', diagnosis: 'Cell 14 shows 5% deviation from pack average.', recommended_action: 'Initiate cell balancing cycle.', status: 'active' },
  { id: 'alert-3', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), device_id: 'motor_01', severity: 'info', message: 'Vibration signature changed', diagnosis: 'Minor increase in high-frequency harmonics.', recommended_action: 'Monitor for further changes.', status: 'acknowledged' },
];

export const MOCK_RL_SUGGESTION: RLSuggestion = {
    id: 'rl-sugg-1',
    timestamp: new Date().toISOString(),
    action_summary: 'Discharge battery to meet load & reduce grid dependency',
    explanation: [
        'High grid prices are forecasted for the next 60 minutes.',
        'Current battery state of charge is high (85%).',
        'Discharging now maximizes savings by avoiding peak-hour grid consumption.'
    ],
    confidence: 0.95,
    estimated_cost_savings: 125.50,
    status: 'pending',
    current_flows: {
        grid_to_load: 150,
        pv_to_load: 200,
        pv_to_battery: 50,
        battery_to_load: 0,
        battery_to_grid: 0,
        pv_to_grid: 10,
    },
    suggested_flows: {
        grid_to_load: 20,
        pv_to_load: 200,
        pv_to_battery: 0,
        battery_to_load: 130,
        battery_to_grid: 0,
        pv_to_grid: 10,
    }
};


export const MOCK_MAINTENANCE_ASSETS: MaintenanceAsset[] = [
  { id: 'asset-1', name: 'Motor 1', type: 'Motor', failure_probability: 0.85, rank: 1 },
  { id: 'asset-2', name: 'Inverter 3', type: 'Inverter', failure_probability: 0.65, rank: 2 },
  { id: 'asset-3', name: 'Battery Pack 2', type: 'Battery', failure_probability: 0.40, rank: 3 },
  { id: 'asset-4', name: 'Cooling Fan 8', type: 'HVAC', failure_probability: 0.22, rank: 4 },
];

export const MOCK_TELEMETRY_DATA: Telemetry[] = Array.from({ length: 100 }).map((_, i) => ({
    timestamp: new Date(Date.now() - (100 - i) * 60000).toISOString(),
    site_id: "site_123",
    device_id: "inv_22",
    subsystem: "inverter",
    metrics: {
        voltage: 415 + Math.sin(i / 10) * 5,
        current: 12 + Math.cos(i / 10) * 2,
        frequency: 50 + (Math.random() - 0.5) * 0.1,
        temp_c: 65 + Math.sin(i / 5),
        pv_generation: 250 + Math.sin(i / 20) * 50,
        pv_irradiance: 600 + Math.sin(i / 20) * 100,
        soc_batt: 75 + Math.cos(i / 15) * 10,
        net_load: 350 + Math.sin(i / 8) * 20,
        battery_discharge: i % 10 === 0 ? 10 : 0,
    },
}));
