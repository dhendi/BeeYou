/**
 * BeeYou Production Error Telemetry & Diagnostic Logger
 * Catches runtime exceptions, network drops, and corrupted local state gracefully.
 * Prevents blank white screens and logs diagnostic crash reports.
 */

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  handled: boolean;
  metadata?: Record<string, any>;
}

const ERROR_LOGS_KEY = 'beeyou_error_telemetry_logs';
const MAX_STORED_ERRORS = 25;

class ErrorTelemetryLogger {
  private inMemoryQueue: ErrorReport[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachGlobalHandlers();
    }
  }

  private attachGlobalHandlers(): void {
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { source: 'unhandledrejection' }
      );
    });
  }

  /**
   * Captures an exception with context metadata
   */
  captureException(error: Error, metadata?: Record<string, any>): ErrorReport {
    const report: ErrorReport = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      message: error.message || 'Unknown runtime exception',
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      handled: true,
      metadata,
    };

    console.error('🚨 [BeeYou Telemetry Captured]', report);

    this.inMemoryQueue.push(report);
    if (this.inMemoryQueue.length > MAX_STORED_ERRORS) {
      this.inMemoryQueue.shift();
    }

    try {
      localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(this.inMemoryQueue));
    } catch {}

    return report;
  }

  /**
   * Retrieve recent crash logs for debugging / caregiver support
   */
  getRecentErrors(): ErrorReport[] {
    try {
      const raw = localStorage.getItem(ERROR_LOGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return this.inMemoryQueue;
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.inMemoryQueue = [];
    try {
      localStorage.removeItem(ERROR_LOGS_KEY);
    } catch {}
  }
}

export const errorTelemetry = new ErrorTelemetryLogger();
