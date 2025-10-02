
import React, { useState, useEffect, useContext } from 'react';
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { acknowledgeAlert } from '../services/api';
import { AppContext } from '../contexts/AppContext';

const AlertItem = ({ alert: initialAlert, onAcknowledge }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alert, setAlert] = useState(initialAlert);

  const getSeverityStyles = () => {
    switch (alert.severity) {
      case 'critical': return { icon: <ShieldAlert className="w-6 h-6 text-red-500" />, color: 'border-red-500' };
      case 'warning': return { icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />, color: 'border-yellow-500' };
      case 'info': return { icon: <Info className="w-6 h-6 text-violet-500" />, color: 'border-violet-500' };
      default: return { icon: <Info />, color: 'border-gray-500' };
    }
  };

  const { icon, color } = getSeverityStyles();

  const handleAcknowledge = async (e) => {
    e.stopPropagation();
    await onAcknowledge(alert.id);
    setAlert({ ...alert, status: 'acknowledged' });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 p-4 cursor-pointer transition-all duration-300 ${color}`} onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <div className="ml-4">
            <p className="font-semibold text-gray-900 dark:text-white">{alert.message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{alert.device_id} - {new Date(alert.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${alert.status === 'active' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {alert.status}
            </span>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
          <p className="font-bold text-gray-700 dark:text-gray-300">Diagnosis:</p>
          <p className="mb-2 text-gray-500 dark:text-gray-400">{alert.diagnosis}</p>
          <p className="font-bold text-gray-700 dark:text-gray-300">Recommended Action:</p>
          <p className="mb-4 text-gray-500 dark:text-gray-400">{alert.recommended_action}</p>
          {alert.status === 'active' && (
            <button onClick={handleAcknowledge} className="flex items-center px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-md text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Acknowledge
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const AlertsPage: React.FC = () => {
  const { alerts, setAlerts } = useContext(AppContext)!;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (alerts.length === 0) {
        // Initial load is mocked via api.ts, this component will use context after that.
        // This is a fallback if context is empty on first load.
        import('../services/api').then(api => {
            api.fetchAlerts('site_123').then(initialAlerts => {
                setAlerts(initialAlerts);
                setIsLoading(false);
            });
        });
    } else {
        setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert('site_123', alertId);
      setAlerts(prevAlerts =>
        prevAlerts.map(a => (a.id === alertId ? { ...a, status: 'acknowledged' } : a))
      );
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  return (
    <Card title="Alerts Feed">
      {isLoading ? (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <AlertItem key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default AlertsPage;
