import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, RefreshCw, Bug, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface DebugLogsProps {
  onClose: () => void;
}

const DebugLogs: React.FC<DebugLogsProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');

  useEffect(() => {
    // 获取存储的日志
    const storedLogs = localStorage.getItem('debug_logs');
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setLogs(parsedLogs);
      } catch (error) {
        console.error('Failed to parse stored logs:', error);
      }
    }

    // 监听新的日志
    const handleStorageChange = () => {
      const newLogs = localStorage.getItem('debug_logs');
      if (newLogs) {
        try {
          const parsedLogs = JSON.parse(newLogs).map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          }));
          setLogs(parsedLogs);
        } catch (error) {
          console.error('Failed to parse new logs:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 定期刷新日志
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const clearLogs = () => {
    localStorage.removeItem('debug_logs');
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}${
        log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''
      }`
    ).join('\n\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const refreshLogs = () => {
    const storedLogs = localStorage.getItem('debug_logs');
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setLogs(parsedLogs);
      } catch (error) {
        console.error('Failed to refresh logs:', error);
      }
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'debug':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bug className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">系统日志</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {filteredLogs.length} 条记录
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshLogs}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="刷新日志"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={downloadLogs}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="下载日志"
            >
              <Download className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={clearLogs}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="清空日志"
            >
              <Trash2 className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 过滤器 */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">过滤级别:</span>
            {['all', 'error', 'warn', 'info', 'debug'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {level === 'all' ? '全部' : level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 日志列表 */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Bug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无日志记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${getLevelColor(log.level)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium uppercase tracking-wide ${
                          log.level === 'error' ? 'text-red-600' :
                          log.level === 'warn' ? 'text-yellow-600' :
                          log.level === 'info' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm mb-2">{log.message}</p>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            查看详细数据
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>日志自动保存在浏览器本地存储中</span>
            <span>最新日志在顶部显示</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugLogs;