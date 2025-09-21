import { useState, useEffect } from 'react';
import { getMockMode } from '../lib/api';

export function useMockMode() {
  const [isMockMode, setIsMockMode] = useState(getMockMode());

  useEffect(() => {
    // Check for changes to mock mode every 200ms (optimized for performance)
    // This ensures all components stay in sync when mode changes
    const interval = setInterval(() => {
      const currentMockMode = getMockMode();
      if (currentMockMode !== isMockMode) {
        if (import.meta.env.DEV) {
          console.log(`🔄 useMockMode: Mode changed ${isMockMode} → ${currentMockMode}`);
        }
        setIsMockMode(currentMockMode);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isMockMode]);

  return isMockMode;
}