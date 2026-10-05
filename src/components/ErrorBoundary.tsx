import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BeeYou Uncaught Error:', error, errorInfo);
  }

  private handleResetApp = () => {
    try {
      // Clear potentially corrupt local storage keys while preserving important settings if possible
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  private handleClearAllAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-amber-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                BeeYou is Refreshing
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                A new version was deployed. Tap below to refresh your view and load the latest updates.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left overflow-x-auto text-[11px] font-mono text-slate-600 max-h-24 scrollbar-thin">
                {this.state.error.message || 'Unknown error'}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleResetApp}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAllAndReload}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Clear Cache & Hard Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
