import { useState, useEffect } from 'react';
import { getMockMode } from '../lib/api';

export function useMockMode() {
  const [isMockMode, setIsMockMode] = useState(getMockMode());

  useEffect(() => {
    // Check for changes to mock mode every 100ms
    // This ensures all components stay in sync when mode changes
    const interval = setInterval(() => {
      const currentMockMode = getMockMode();
      if (currentMockMode !== isMockMode) {
        console.log(`🔄 useMockMode: Mode changed ${isMockMode} → ${currentMockMode}`);
        setIsMockMode(currentMockMode);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isMockMode]);

  return isMockMode;
}