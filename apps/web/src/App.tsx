import React, { useEffect, useState } from 'react';
import { useAuthStore } from './lib/auth';
import { api } from './lib/api';
import { SetupWizard } from './features/setup/SetupWizard';
import { AuthPage } from './features/auth/AuthPage';
import { PosPage } from './features/pos/PosPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { Role } from '@pos/types';

export function App() {
  const user = useAuthStore((state) => state.user);
  const [setupChecked, setSetupChecked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  const [allowReset, setAllowReset] = useState(false);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const res: any = await api.get('/setup/status');
      setIsInitialized(res.data?.is_initialized ?? true);
      setAllowReset(res.data?.allow_reset ?? false);
    } catch (err) {
      // Backend not running setup or fallback to ready
      setIsInitialized(true);
    } finally {
      setSetupChecked(true);
    }
  };

  if (!setupChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm font-sans">
        Checking POS configuration...
      </div>
    );
  }

  if (!isInitialized) {
    return <SetupWizard allowReset={allowReset} onComplete={() => setIsInitialized(true)} />;
  }

  if (!user) {
    return <AuthPage />;
  }

  // Kasir role goes straight to Front Office (Kasir interface)
  if (user.role === Role.KASIR) {
    return <PosPage />;
  }

  // Manager/Owner/Staff/SuperAdmin goes to Back Office with toggle capability
  return <DashboardPage />;
}
