import { useState, useEffect, useRef } from 'react';
import { MOCK_ALERTS, MOCK_RL_SUGGESTION } from '../services/mockData';

export const useWebSocket = (url: string, onMessage: (event: MessageEvent) => void, enabled: boolean) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const isMock = url === 'wss://mock-api.energy-ems.com/ws/site/site_123';

    if (!enabled) {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
      setConnectionStatus('disconnected');
      return;
    }

    // --- Mock WebSocket Implementation ---
    if (isMock) {
      setConnectionStatus('connecting');
      const connectTimeout = setTimeout(() => {
        console.log('Mock WebSocket connected');
        setConnectionStatus('connected');
      }, 500);

      const telemetryInterval = setInterval(() => {
        const now = Date.now();
        const pvGeneration = 250 + Math.sin(now / 20000) * 50;
        const netLoad = 350 + Math.sin(now / 8000) * 20;
        const batterySoc = 75 + Math.cos(now / 15000) * 10;
        
        const newTelemetry = {
          type: 'telemetry_update',
          payload: {
            timestamp: new Date().toISOString(),
            site_id: "site_123",
            device_id: "inv_22",
            subsystem: "inverter",
            metrics: {
              voltage: 415 + Math.sin(now / 10000) * 5,
              current: 12 + Math.cos(now / 10000) * 2,
              frequency: 50 + (Math.random() - 0.5) * 0.1,
              temp_c: 65 + Math.sin(now / 5000),
              pv_generation: pvGeneration,
              pv_irradiance: 600 + Math.sin(now / 20000) * 100,
              soc_batt: batterySoc,
              net_load: netLoad,
              battery_discharge: 0, // Assume no discharge initially
            },
          }
        };
        onMessage({ data: JSON.stringify(newTelemetry) } as MessageEvent);
      }, 2000);

      const alertTimeout = setTimeout(() => {
          const newAlert = {
              type: 'alert',
              payload: {
                  ...MOCK_ALERTS[1], // warning alert
                  id: `alert-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  status: 'active'
              }
          };
          onMessage({ data: JSON.stringify(newAlert) } as MessageEvent);
      }, 10000);

      const suggestionTimeout = setTimeout(() => {
        const newSuggestion = {
            type: 'rl_suggestion',
            payload: { ...MOCK_RL_SUGGESTION, id: `rl-${Date.now()}` }
        };
        onMessage({ data: JSON.stringify(newSuggestion) } as MessageEvent);
      }, 15000);

      return () => {
        clearTimeout(connectTimeout);
        clearInterval(telemetryInterval);
        clearTimeout(alertTimeout);
        clearTimeout(suggestionTimeout);
        setConnectionStatus('disconnected');
        console.log('Mock WebSocket disconnected');
      };
    }

    // --- Real WebSocket Implementation ---
    const connect = () => {
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) return;

      setConnectionStatus('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        if(reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      };

      ws.current.onmessage = onMessage;

      ws.current.onerror = () => {
        console.error('WebSocket error occurred. This is often due to a connection failure. See the onclose event for more details.');
      };

      ws.current.onclose = (event: CloseEvent) => {
        console.log(`WebSocket disconnected: Code=${event.code}, Reason='${event.reason}', WasClean=${event.wasClean}`);
        setConnectionStatus('disconnected');
        
        const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
        reconnectTimeout.current = window.setTimeout(connect, delay);
        reconnectAttempts.current++;
      };
    };

    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null; 
        ws.current.close();
      }
    };
  }, [url, onMessage, enabled]);

  return { connectionStatus };
};
