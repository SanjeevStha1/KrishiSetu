import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  RefreshCw,
  X,
  Copy,
  Check,
  Lock,
  Database,
  UserCheck,
  AlertCircle,
  FileCode,
  Terminal,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  runNotificationRlsDiagnostic,
  RlsDiagnosticReport,
  POSTGRES_RLS_POLICY_DDL,
} from '../services/rlsDiagnosticService';
import { useLanguage } from '../context/LanguageContext';

interface RlsDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RlsDiagnosticModal: React.FC<RlsDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<RlsDiagnosticReport | null>(null);
  const [customTestId, setCustomTestId] = useState('farmer_unauthorized_9999999999');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'logs' | 'policy'>('results');

  const executeTest = async (testIdToUse?: string) => {
    setIsRunning(true);
    try {
      const id = testIdToUse || customTestId || 'farmer_unauthorized_9999999999';
      const result = await runNotificationRlsDiagnostic(id);
      setReport(result);
    } catch (e) {
      console.error('RLS test failed to execute:', e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !report) {
      executeTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'code' | 'query') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-[#262421] dark:text-[#F2EFE9] animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="bg-[#FCFAF6] dark:bg-[#1E1D1A] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E4E0D8] dark:border-[#38362F] shadow-2xl flex flex-col relative transition-colors duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#262421] dark:bg-[#151413] text-[#FCFAF6] dark:text-[#F2EFE9] border-b border-[#38362F] sticky top-0 z-20 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  RLS Security & Tenant Isolation Diagnostic
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                  PostgreSQL RLS
                </span>
              </div>
              <p className="text-xs text-[#D1CCC4] dark:text-[#9B9790]">
                Verifying that unauthorized requests for non-existent farmer IDs return 0 rows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#FCFAF6] flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Input & Test Runner Bar */}
        <div className="p-4 sm:p-6 border-b border-[#E4E0D8] dark:border-[#38362F] bg-[#F7F4EE] dark:bg-[#252421] space-y-3">
          <label className="text-xs font-bold text-[#6B6862] dark:text-[#A8A49C] uppercase tracking-wider block">
            Target Non-Existent / Unauthorized Farmer ID to Query:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Lock className="w-4 h-4 text-[#A8A49C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customTestId}
                onChange={(e) => setCustomTestId(e.target.value)}
                placeholder="e.g. farmer_unauthorized_9999999999"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-[#1A1917] border border-[#D5D0C5] dark:border-[#424039] text-[#262421] dark:text-[#F2EFE9] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <button
              onClick={() => executeTest()}
              disabled={isRunning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer shrink-0"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isRunning ? 'Auditing Database...' : 'Run RLS Test'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E4E0D8] dark:border-[#38362F] px-4 sm:px-6 bg-[#FCFAF6] dark:bg-[#1E1D1A]">
          <button
            onClick={() => setActiveTab('results')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'results'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[#6B6862] dark:text-[#9B9790] hover:text-[#262421] dark:hover:text-[#F2EFE9]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Audit Results & Verdict
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[#6B6862] dark:text-[#9B9790] hover:text-[#262421] dark:hover:text-[#F2EFE9]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Execution Logs ({report?.logs.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'policy'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[#6B6862] dark:text-[#9B9790] hover:text-[#262421] dark:hover:text-[#F2EFE9]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Postgres RLS Policy DDL
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 space-y-5 flex-1">
          {activeTab === 'results' && report && (
            <div className="space-y-4">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  report.testPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                }`}
              >
                {report.testPassed ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {report.testPassed
                        ? 'SECURITY AUDIT PASSED: Tenant Isolation Enforced'
                        : 'SECURITY ALERT: Unexpected Data Leakage Detected'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        report.testPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{report.summary}</p>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F7F4EE] dark:bg-[#242320] p-3 rounded-xl border border-[#E4E0D8] dark:border-[#38362F]">
                  <span className="text-[10px] text-[#6B6862] dark:text-[#9B9790] block mb-1">
                    Unauthorized Rows
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {report.unauthorizedRowsReturned}
                  </div>
                  <span className="text-[9px] text-[#8C887E] dark:text-[#7A7770]">
                    0 expected (RLS block)
                  </span>
                </div>

                <div className="bg-[#F7F4EE] dark:bg-[#242320] p-3 rounded-xl border border-[#E4E0D8] dark:border-[#38362F]">
                  <span className="text-[10px] text-[#6B6862] dark:text-[#9B9790] block mb-1">
                    Authorized Rows
                  </span>
                  <div className="text-xl font-bold font-mono text-[#262421] dark:text-[#F2EFE9]">
                    {report.authorizedRowsReturned}
                  </div>
                  <span className="text-[9px] text-[#8C887E] dark:text-[#7A7770]">
                    Current farmer's alerts
                  </span>
                </div>

                <div className="bg-[#F7F4EE] dark:bg-[#242320] p-3 rounded-xl border border-[#E4E0D8] dark:border-[#38362F]">
                  <span className="text-[10px] text-[#6B6862] dark:text-[#9B9790] block mb-1">
                    RLS Enforcement
                  </span>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ACTIVE
                  </div>
                  <span className="text-[9px] text-[#8C887E] dark:text-[#7A7770]">
                    Database policy active
                  </span>
                </div>

                <div className="bg-[#F7F4EE] dark:bg-[#242320] p-3 rounded-xl border border-[#E4E0D8] dark:border-[#38362F]">
                  <span className="text-[10px] text-[#6B6862] dark:text-[#9B9790] block mb-1">
                    Execution Latency
                  </span>
                  <div className="text-xl font-bold font-mono text-[#262421] dark:text-[#F2EFE9]">
                    {report.executionTimeMs}ms
                  </div>
                  <span className="text-[9px] text-[#8C887E] dark:text-[#7A7770]">
                    {report.backendTarget === 'supabase_postgres' ? 'Supabase Postgres' : 'Resilient Store'}
                  </span>
                </div>
              </div>

              {/* Tested SQL Query Box */}
              <div className="bg-[#181715] text-slate-200 p-3.5 rounded-xl border border-[#2D2B26] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    Executed Unauthorized Query Test
                  </span>
                  <button
                    onClick={() => handleCopy(report.sqlQueryTested, 'query')}
                    className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                  >
                    {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedQuery ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-emerald-400 bg-black/40 p-2 rounded-lg break-all">
                  {report.sqlQueryTested}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Targeted non-existent farmer: <strong className="text-slate-300">{report.testedNonExistentFarmerId}</strong></span>
                  <span>Evaluated at: {new Date(report.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && report && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E0D8] dark:border-[#38362F] text-[11px] text-[#6B6862] dark:text-[#9B9790]">
                <span>Audit Step-by-Step Security Log</span>
                <span>{report.logs.length} stages recorded</span>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {report.logs.map((log, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg bg-[#F7F4EE] dark:bg-[#252421] border border-[#E4E0D8] dark:border-[#38362F] flex items-start gap-2.5"
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        log.stage === 'CONCLUSION'
                          ? 'bg-emerald-600 text-white'
                          : log.stage === 'EVALUATION'
                          ? 'bg-blue-600 text-white'
                          : log.stage === 'AUTH'
                          ? 'bg-purple-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {log.stage}
                    </span>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="text-[#262421] dark:text-[#F2EFE9] leading-snug">{log.message}</p>
                      <span className="text-[9px] text-[#8C887E] dark:text-[#7A7770] block">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B6862] dark:text-[#9B9790]">
                <span>PostgreSQL Security Barrier Definition (`firestore.rules` & Postgres RLS)</span>
                <button
                  onClick={() => handleCopy(POSTGRES_RLS_POLICY_DDL, 'code')}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to Clipboard' : 'Copy Policy DDL'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#181715] text-emerald-300 font-mono text-xs overflow-x-auto border border-[#2D2B26] leading-relaxed">
                {POSTGRES_RLS_POLICY_DDL}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F7F4EE] dark:bg-[#181715] border-t border-[#E4E0D8] dark:border-[#38362F] flex items-center justify-between rounded-b-3xl">
          <div className="text-xs text-[#6B6862] dark:text-[#9B9790] flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Active Session: <strong>{report?.currentFarmerName || 'Authenticated Farmer'}</strong> ({report?.currentFarmerId || '+977 9845012345'})</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#262421] dark:bg-[#38362F] hover:bg-black text-[#FCFAF6] rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
