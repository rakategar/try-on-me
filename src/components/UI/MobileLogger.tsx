'use client';

import { useEffect, useState, useRef } from 'react';

export default function MobileLogger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const logsRef = useRef<string[]>([]);

  useEffect(() => {
    // Override console.log
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        logsRef.current = [...logsRef.current.slice(-30), `[LOG] ${new Date().toLocaleTimeString()} - ${message}`];
        setLogs([...logsRef.current]);
      }, 0);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setTimeout(() => {
        logsRef.current = [...logsRef.current.slice(-30), `[ERROR] ${new Date().toLocaleTimeString()} - ${message}`];
        setLogs([...logsRef.current]);
      }, 0);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setTimeout(() => {
        logsRef.current = [...logsRef.current.slice(-30), `[WARN] ${new Date().toLocaleTimeString()} - ${message}`];
        setLogs([...logsRef.current]);
      }, 0);
    };

    originalLog('🚀 [MobileLogger] Logger initialized');

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-[9999] font-bold"
      >
        Show Logs ({logs.length})
      </button>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/95 text-white p-4 overflow-auto z-[9999] font-mono text-xs">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-black pb-2">
        <h2 className="text-lg font-bold">📱 Mobile Console</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              logsRef.current = [];
              setLogs([]);
            }}
            className="bg-red-500 px-3 py-1 rounded font-bold"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 px-3 py-1 rounded font-bold"
          >
            Hide
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        {logs.length === 0 && (
          <div className="text-gray-400">No logs yet...</div>
        )}
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              log.includes('[ERROR]') ? 'bg-red-900/50 text-red-200' :
              log.includes('[WARN]') ? 'bg-yellow-900/50 text-yellow-200' :
              'bg-gray-800/50'
            }`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
