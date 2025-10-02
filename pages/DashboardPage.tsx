
import React, { useState, useEffect, useContext } from 'react';
import { Sun, Zap, BatteryCharging, Shield, Check, X, Bot, Tv, Server, Wind, MessageCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
// FIX: Removed unused fetchHealthStatus import.
import { acceptRLSuggestion, rejectRLSuggestion } from '../services/api';
import { HealthStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../contexts/AppContext';
import EnergyFlowDiagram from '../components/shared/EnergyFlowDiagram';
import { formatCurrency } from '../utils/currency';
import DiagnosticAssistant from '../components/shared/DiagnosticAssistant';

const SummaryCard: React.FC<{ title: string; value: string | number; unit: string; icon: React.ReactNode; isLoading: boolean }> = ({ title, value, unit, icon, isLoading }) => (
  <Card className="flex flex-col">
    {isLoading ? (
      <>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-12 w-1/2" />
      </>
    ) : (
      <>
        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
          <span className="text-sm font-medium">{title}</span>
          {icon}
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">{unit}</span>
        </div>
      </>
    )}
  </Card>
);

const HealthBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => {
    let barColor = 'bg-green-500';
    if (value < 90) barColor = 'bg-yellow-500';
    if (value < 75) barColor = 'bg-red-500';

    return (
        <li className="flex items-center space-x-4">
            <div className="text-violet-500">{icon}</div>
            <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{value.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`${barColor} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
                </div>
            </div>
        </li>
    );
};

const DashboardPage: React.FC = () => {
  // FIX: Get healthStatus from context and derive isLoading state.
  const { healthStatus, latestTelemetry, rlSuggestion, setRlSuggestion, theme, currency } = useContext(AppContext)!;
  const isLoading = healthStatus === null;
  const [netLoadData, setNetLoadData] = useState<Array<{ time: string, net_load: number | undefined }>>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  
  const gridColor = theme === 'dark' ? '#4A5568' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#A0AEC0' : '#4A5568';
  
  // FIX: Removed useEffect for fetching healthStatus as it's now handled globally.

  useEffect(() => {
    if (latestTelemetry?.metrics.net_load) {
      const newPoint = {
        time: new Date(latestTelemetry.timestamp).toLocaleTimeString(),
        net_load: latestTelemetry.metrics.net_load,
      };
      setNetLoadData(prevData => [...prevData.slice(-29), newPoint]);
    }
  }, [latestTelemetry]);

  const currentFlows = {
    grid_to_load: healthStatus?.grid_draw ?? 0,
    pv_to_load: Math.min(latestTelemetry?.metrics.pv_generation ?? 0, latestTelemetry?.metrics.net_load ?? 0),
    pv_to_battery: (latestTelemetry?.metrics.pv_generation ?? 0) - Math.min(latestTelemetry?.metrics.pv_generation ?? 0, latestTelemetry?.metrics.net_load ?? 0),
    battery_to_load: latestTelemetry?.metrics.battery_discharge ?? 0,
    battery_to_grid: 0,
    pv_to_grid: 0,
  };
  
  const handleAccept = async () => {
    if (!rlSuggestion) return;
    setIsActionLoading(true);
    try {
      await acceptRLSuggestion('site_123', rlSuggestion.id);
      setRlSuggestion({ ...rlSuggestion, status: 'accepted' });
    } catch (err) {
      console.error('Failed to accept suggestion.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rlSuggestion) return;
    setIsActionLoading(true);
    try {
      await rejectRLSuggestion('site_123', rlSuggestion.id);
      setRlSuggestion({ ...rlSuggestion, status: 'rejected' });
    } catch (err) {
      console.error('Failed to reject suggestion.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Site Health" value={healthStatus?.site_health ?? 0} unit="%" icon={<Shield className="w-6 h-6 text-green-500" />} isLoading={isLoading} />
        <SummaryCard title="Grid Draw" value={healthStatus?.grid_draw ?? 0} unit="kW" icon={<Zap className="w-6 h-6 text-yellow-500" />} isLoading={isLoading} />
        <SummaryCard title="Battery SoC" value={healthStatus?.battery_soc ?? 0} unit="%" icon={<BatteryCharging className="w-6 h-6 text-violet-500" />} isLoading={isLoading} />
        <SummaryCard title="Today's PV Gen" value={healthStatus?.pv_generation_today ?? 0} unit="kWh" icon={<Sun className="w-6 h-6 text-orange-400" />} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card title={rlSuggestion?.status === 'pending' ? "Energy Dispatch Suggestion" : "Live Energy Dispatch"}>
                <EnergyFlowDiagram 
                    currentFlows={rlSuggestion?.status === 'pending' ? rlSuggestion.current_flows : currentFlows}
                    suggestedFlows={rlSuggestion?.status === 'pending' ? rlSuggestion.suggested_flows : null}
                />
                {rlSuggestion?.status === 'pending' && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-3">
                            <Bot className="w-6 h-6 text-violet-500 mr-3"/>
                            <div>
                                <p className="font-semibold">{rlSuggestion.action_summary}</p>
                                <p className="text-sm text-green-500 font-medium">Est. Savings: {formatCurrency(rlSuggestion.estimated_cost_savings, currency)}</p>
                            </div>
                        </div>
                         <div className="flex space-x-3">
                            <button onClick={handleAccept} disabled={isActionLoading} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                                <Check className="w-5 h-5 mr-2" /> Accept
                            </button>
                            <button onClick={handleReject} disabled={isActionLoading} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                                <X className="w-5 h-5 mr-2" /> Reject
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
        <Card title="Subsystem Health Status">
            {isLoading ? (
                <div className="space-y-6 p-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : (
                <ul className="space-y-6">
                    <HealthBar label="PV System" value={healthStatus?.pv_health ?? 0} icon={<Sun className="w-6 h-6" />} />
                    <HealthBar label="Battery SOH" value={healthStatus?.battery_soh ?? 0} icon={<BatteryCharging className="w-6 h-6" />} />
                    <HealthBar label="Inverter" value={healthStatus?.inverter_health ?? 0} icon={<Server className="w-6 h-6" />} />
                    <HealthBar label="EV Charger" value={healthStatus?.ev_charger_health ?? 0} icon={<Zap className="w-6 h-6" />} />
                </ul>
            )}
        </Card>
      </div>
      
    </div>
    <div className="fixed bottom-6 right-6 z-40">
        <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center justify-center w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-transform transform hover:scale-110"
            aria-label="Open AI Diagnostic Assistant"
        >
            <Bot className="w-7 h-7" />
        </button>
    </div>
    <DiagnosticAssistant isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
};

export default DashboardPage;
