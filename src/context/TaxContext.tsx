import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AppState } from '../types/tax';
import { storageService } from '../services/storageService';
import { INITIAL_APP_STATE } from '../constants/initialState';

interface TaxContextType {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  resetAll: () => Promise<void>;
  reloadState: () => Promise<void>;
}

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(INITIAL_APP_STATE);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<any>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 1. Initiales Laden beim App-Start
  useEffect(() => {
    let isCancelled = false;
    storageService.loadState().then((loadedState) => {
      if (isCancelled) return;
      setState(loadedState);
      stateRef.current = loadedState;
      isLoadedRef.current = true;
      setLastSaved(new Date(loadedState.letztesUpdate || Date.now()));
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Automatisches debounced Speichern (Autosave B2)
  useEffect(() => {
    if (!isLoadedRef.current) return;

    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const currentState = stateRef.current;
      await storageService.saveState(currentState);
      setIsSaving(false);
      setLastSaved(new Date());
    }, 600);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  // Beforeunload / Tab-Close Flush: Garantiert sofortiges Speichern beim Verlassen
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoadedRef.current) {
        // Synchroner / unmittelbarer Spiegel in localStorage
        try {
          localStorage.setItem('steuer_cockpit_2026_fallback', JSON.stringify({
            ...stateRef.current,
            letztesUpdate: new Date().toISOString()
          }));
        } catch (e) {
          console.warn('Sync flush error on unload:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  };

  const resetAll = async () => {
    const fresh = await storageService.resetToDefaults();
    setState(fresh);
    setLastSaved(new Date());
  };

  const reloadState = async () => {
    const reloaded = await storageService.loadState();
    setState(reloaded);
    setLastSaved(new Date());
  };

  return (
    <TaxContext.Provider value={{ state, updateState, isSaving, lastSaved, resetAll, reloadState }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = (): TaxContextType => {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
};
