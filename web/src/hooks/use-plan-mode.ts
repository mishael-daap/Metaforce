"use client";

import { useState, useCallback } from 'react';

export type PlanMode = 'plan' | 'execute';

export function usePlanMode() {
  const [mode, setMode] = useState<PlanMode>('plan');

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'plan' ? 'execute' : 'plan');
  }, []);

  const setPlanMode = useCallback(() => setMode('plan'), []);
  const setExecuteMode = useCallback(() => setMode('execute'), []);

  return {
    mode,
    toggleMode,
    setPlanMode,
    setExecuteMode,
    isPlanMode: mode === 'plan',
    isExecuteMode: mode === 'execute',
  };
}
