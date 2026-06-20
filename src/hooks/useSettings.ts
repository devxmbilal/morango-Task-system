import { useState, useCallback } from 'react';
import type { WorkspaceSettings } from '../types';
import { api, API_BASE } from '../lib/api';
import { toastSuccess, toastError } from '../lib/toast';

export function useSettings() {
  const [settings, setSettings] = useState<WorkspaceSettings>({
    companyName: 'Morango AI',
    accent: '#4f46e5',
    sidebarTheme: 'light',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    smtpFrom: '',
    emailEnabled: false,
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Settings endpoint is public (no auth needed), so use raw fetch
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (field: string, val: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: val }));
    try {
      await api.put('/settings', { [field]: val });
      toastSuccess('Settings saved!');
      return { ok: true };
    } catch (e: any) {
      toastError(e.message || 'Failed to save settings');
      return { ok: false };
    }
  };

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings,
  };
}
