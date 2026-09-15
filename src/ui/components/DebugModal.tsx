import React, { useState, useEffect } from 'react';
import { DebugTracker, DebugReportContext } from '../../core/debug/DebugTracker';
import { Bug, Copy, Check, Trash2, X, AlertTriangle, Terminal, Activity } from 'lucide-react';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: DebugReportContext;
}

export const DebugModal: React.FC<DebugModalProps> = ({ isOpen, onClose, context }) => {
  const [copied, setCopied] = useState(false);
  const [logRefresh, setLogRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<'report' | 'logs'>('report');

  const tracker = DebugTracker.getInstance();

  useEffect(() => {
    const unsub = tracker.subscribe(() => {
      setLogRefresh((n) => n + 1);
    });
    return unsub;
  }, [tracker]);

  if (!isOpen) return null;

  let report = '';
  try {
    report = tracker.generateMarkdownReport(context);
  } catch (e: any) {
    report = `### Diagnostic Error: ${e?.message || 'Failed to generate report'}`;
  }
  const logs = tracker.getLogs();
  const errorCount = tracker.getErrorCount();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for restricted clipboard contexts
      const textarea = document.getElementById('debug-report-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    }
  };

  const handleSimulateError = () => {
    tracker.addLog('error', 'Manual Test Error: Diagnostics check triggered by user', {
      view: context.view,
      time: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Debug & Diagnostic Inspector</h3>
                {errorCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold">
                    {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Current View: <span className="font-mono text-amber-400">{context.view}</span> • Copy and paste this text to report issues.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="px-5 py-3 bg-neutral-900/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'report' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Markdown Report
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'logs' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live Logs ({logs.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateError}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Add a test error to verify logging"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Test Error
            </button>
            <button
              type="button"
              onClick={() => tracker.clearLogs()}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-500 text-black'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Debug Info'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {copied && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Diagnostic report copied to clipboard! You can now paste directly into the chat prompt.</span>
            </div>
          )}

          {activeTab === 'report' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Copyable Diagnostic Text (Click text area or use button above):</span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('debug-report-textarea') as HTMLTextAreaElement;
                    el?.select();
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Select All
                </button>
              </div>
              <textarea
                id="debug-report-textarea"
                readOnly
                value={report}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full h-80 bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-xs text-neutral-300 leading-relaxed focus:outline-none focus:border-amber-500 resize-none selection:bg-amber-500 selection:text-black"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-neutral-400">
                Log Stream ({logs.length} events recorded):
              </div>
              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                  No events logged yet. Triggering actions, navigating views, or throwing darts will record activity.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-1 ${
                        log.type === 'error'
                          ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                          : log.type === 'warn'
                          ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] opacity-75">
                        <span className="font-bold uppercase tracking-wider">[{log.type}]</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="font-semibold">{log.message}</div>
                      {log.details && (
                        <pre className="text-[10px] text-neutral-400 bg-black/40 p-1.5 rounded overflow-x-auto">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-500">
          <span>Darts Sim Diagnostic Tooling</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
