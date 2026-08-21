import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Server, Database, Store, User, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../lib/auth';

interface Props {
  onComplete: () => void;
  allowReset: boolean;
}

export function SetupWizard({ onComplete, allowReset }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbTestMessage, setDbTestMessage] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  // Step 1: Env & DB
  const [deploymentTarget, setDeploymentTarget] = useState<'LOCALHOST' | 'VPS'>('LOCALHOST');
  const [dbType, setDbType] = useState<'POSTGRESQL' | 'MARIADB' | 'SQLITE'>('POSTGRESQL');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState(5432);
  const [dbName, setDbName] = useState('pos_db');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPassword, setDbPassword] = useState('');

  // Step 2: Store Profile & SuperAdmin
  const [storeName, setStoreName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const testConnection = async () => {
    setError(null);
    setDbTestMessage(null);
    setLoading(true);
    try {
      const res: any = await api.post('/setup/test-db', {
        db_type: dbType,
        host: dbHost,
        port: Number(dbPort),
        database: dbName,
        username: dbUser,
        password: dbPassword,
      });
      setDbTestMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSetup = async () => {
    setError(null);
    setLoading(true);

    try {
      const res: any = await api.post('/setup/complete', {
        deployment_target: deploymentTarget,
        db_type: dbType,
        db_host: dbHost,
        db_port: Number(dbPort),
        db_name: dbName,
        db_user: dbUser,
        db_password: dbPassword,
        store_name: storeName,
        slogan,
        address,
        contact,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword,
      });

      // Auto login as superadmin
      const loginRes: any = await api.post('/auth/login', {
        email: adminEmail,
        password: adminPassword,
      });

      setAuth(loginRes.data.access_token, loginRes.data.user);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Setup completion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDev = async () => {
    if (!confirm('Are you sure you want to reset setup? All database tables will be cleared in DEV mode.')) return;
    try {
      await api.post('/setup/reset');
      alert('Dev environment setup reset successfully.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Wizard Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Store className="text-indigo-400" />
              <span>POS System Setup Wizard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure environment, database, and superadmin account</p>
          </div>
          {allowReset && (
            <button
              onClick={handleResetDev}
              className="flex items-center gap-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs px-3 py-1.5 rounded-lg transition"
              title="Reset setup (Development Mode Only)"
            >
              <RotateCcw size={14} /> Dev Reset
            </button>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 bg-slate-900/60 border-b border-slate-700 text-xs font-semibold">
          <div className={`py-3 px-4 flex items-center gap-2 border-r border-slate-700 ${step === 1 ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500'}`}>
            <Server size={16} /> <span>1. Environment & DB</span>
          </div>
          <div className={`py-3 px-4 flex items-center gap-2 border-r border-slate-700 ${step === 2 ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500'}`}>
            <User size={16} /> <span>2. Store & Admin</span>
          </div>
          <div className={`py-3 px-4 flex items-center gap-2 ${step === 3 ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500'}`}>
            <CheckCircle2 size={16} /> <span>3. Verification</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-200 p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Deployment Target</label>
                  <select
                    value={deploymentTarget}
                    onChange={(e) => setDeploymentTarget(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOCALHOST">Localhost (Development)</option>
                    <option value="VPS">VPS / Remote Server</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Database Driver</label>
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="POSTGRESQL">PostgreSQL</option>
                    <option value="MARIADB">MariaDB / MySQL</option>
                    <option value="SQLITE">SQLite (Embedded)</option>
                  </select>
                </div>
              </div>

              {dbType !== 'SQLITE' && (
                <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-xl space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-400 mb-1">Database Host</label>
                      <input
                        type="text"
                        value={dbHost}
                        onChange={(e) => setDbHost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Port</label>
                      <input
                        type="number"
                        value={dbPort}
                        onChange={(e) => setDbPort(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Database Name</label>
                      <input
                        type="text"
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Username</label>
                      <input
                        type="text"
                        value={dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Password</label>
                      <input
                        type="password"
                        value={dbPassword}
                        onChange={(e) => setDbPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={testConnection}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-1.5 px-3 rounded text-xs transition flex items-center gap-1"
                    >
                      <Database size={14} /> Test DB Connection
                    </button>
                    {dbTestMessage && (
                      <span className="text-green-400 text-xs font-semibold">{dbTestMessage}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/40 p-4 border border-slate-700 rounded-xl space-y-3">
                <h3 className="font-bold text-indigo-400">Store / Business Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Store Name *</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Slogan</label>
                    <input
                      type="text"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      placeholder="e.g. Best Coffee in Town"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 border border-slate-700 rounded-xl space-y-3">
                <h3 className="font-bold text-indigo-400">SuperAdmin Credentials</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-xl space-y-2">
                <h3 className="font-bold text-indigo-400 text-sm mb-2">Summary Verification</h3>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Deployment Environment:</span>
                  <span className="font-semibold text-white">{deploymentTarget}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="font-semibold text-white">{dbType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Store Name:</span>
                  <span className="font-semibold text-white">{storeName || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">SuperAdmin Email:</span>
                  <span className="font-semibold text-white">{adminEmail || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/80 flex justify-between items-center">
          <button
            type="button"
            disabled={step === 1 || loading}
            onClick={() => setStep((s) => s - 1)}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-medium py-2 px-4 rounded-lg text-xs"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={loading || (step === 2 && (!storeName || !adminEmail || !adminPassword))}
              onClick={() => setStep((s) => s + 1)}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold py-2 px-5 rounded-lg text-xs shadow"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinishSetup}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg text-xs shadow"
            >
              {loading ? 'Initializing...' : 'Finish & Launch POS'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
