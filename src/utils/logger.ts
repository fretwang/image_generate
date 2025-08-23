// 日志工具类
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class Logger {
  private maxLogs = 1000; // 最大日志条数

  private addLog(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      message,
      data
    };

    // 获取现有日志
    const existingLogs = this.getLogs();
    
    // 添加新日志到开头
    const updatedLogs = [logEntry, ...existingLogs];
    
    // 限制日志数量
    if (updatedLogs.length > this.maxLogs) {
      updatedLogs.splice(this.maxLogs);
    }

    // 保存到localStorage
    try {
      localStorage.setItem('debug_logs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }

    // 同时输出到控制台
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
  }

  info(message: string, data?: any) {
    this.addLog('info', message, data);
  }

  warn(message: string, data?: any) {
    this.addLog('warn', message, data);
  }

  error(message: string, data?: any) {
    this.addLog('error', message, data);
  }

  debug(message: string, data?: any) {
    this.addLog('debug', message, data);
  }

  getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem('debug_logs');
      if (logs) {
        return JSON.parse(logs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to get logs from localStorage:', error);
    }
    return [];
  }

  clearLogs() {
    localStorage.removeItem('debug_logs');
  }

  // Google OAuth 专用日志方法
  logGoogleAuth(step: string, data?: any) {
    this.info(`Google OAuth: ${step}`, data);
  }

  logGoogleError(step: string, error: any) {
    this.error(`Google OAuth Error: ${step}`, error);
  }

  // 邮件服务专用日志方法
  logEmail(action: string, data?: any) {
    this.info(`Email Service: ${action}`, data);
  }

  logEmailError(action: string, error: any) {
    this.error(`Email Service Error: ${action}`, error);
  }

  // API调用专用日志方法
  logApiCall(method: string, url: string, data?: any) {
    this.debug(`API Call: ${method} ${url}`, data);
  }

  logApiError(method: string, url: string, error: any) {
    this.error(`API Error: ${method} ${url}`, error);
  }

  // 翻译系统专用日志方法
  logTranslationMissing(language: string, path: string, fallback: string) {
    this.warn(`Translation Missing [${language}]: ${path}`, { 
      language, 
      path, 
      fallback,
      timestamp: new Date().toISOString()
    });
  }

  logTranslationError(language: string, path: string, error: any, fallback: string) {
    this.error(`Translation Error [${language}]: ${path}`, { 
      language, 
      path, 
      error: error instanceof Error ? error.message : error,
      fallback,
      timestamp: new Date().toISOString()
    });
  }
}

// 创建全局日志实例
export const logger = new Logger();

// 导出日志级别类型
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';