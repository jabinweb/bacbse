'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Search,   
  Filter, 
  Download, 
  RefreshCw,
  AlertCircle,
  XCircle,
  Info,
  Zap,
  Calendar,
  User,
  Code
} from 'lucide-react';
import { format } from 'date-fns';


interface ErrorLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  details?: string;
  userId?: string;
  paymentId?: string;
  timestamp: string;
  stack?: string;
}

interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsBySource: Record<string, number>;
  recentTrends: { date: string; count: number; }[];
}

export default function AdminErrorLogsPage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    totalErrors: 0,
    criticalErrors: 0,
    errorsByLevel: {},
    errorsBySource: {},
    recentTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const itemsPerPage = 50;

  useEffect(() => {
    loadErrorLogs();
    loadStats();
  }, []);

  const loadErrorLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/error-logs');
      if (response.ok) {
        const data = await response.json();
        setErrorLogs(data.errorLogs || []);
      }
    } catch (error) {
      console.error('Error loading error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/error-logs/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading error stats:', error);
    }
  };

  const getLevelIcon = (level: string) => {
    const levelConfig = {
      INFO: { icon: Info, className: 'text-blue-600' },
      WARN: { icon: AlertTriangle, className: 'text-yellow-600' },
      ERROR: { icon: XCircle, className: 'text-red-600' },
      CRITICAL: { icon: Zap, className: 'text-red-700' },
    };
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.INFO;
    const IconComponent = config.icon;
    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      INFO: { label: 'Info', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      WARN: { label: 'Warning', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      ERROR: { label: 'Error', className: 'bg-red-100 text-red-800 border-red-200' },
      CRITICAL: { label: 'Critical', className: 'bg-red-200 text-red-900 border-red-300 font-semibold' },
    };
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.INFO;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredErrorLogs = errorLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesSource = sourceFilter === 'ALL' || log.source === sourceFilter;
    
    return matchesSearch && matchesLevel && matchesSource;
  });

  const paginatedErrorLogs = filteredErrorLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredErrorLogs.length / itemsPerPage);
  const uniqueSources = Array.from(new Set(errorLogs.map(log => log.source))).sort();

  const exportErrorLogs = async () => {
    try {
      const response = await fetch('/api/admin/error-logs/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `error-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting error logs:', error);
    }
  };

  const clearOldLogs = async () => {
    if (!confirm('Are you sure you want to clear error logs older than 30 days?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/error-logs/cleanup', {
        method: 'POST',
      });
      if (response.ok) {
        await loadErrorLogs();
        await loadStats();
      }
    } catch (error) {
      console.error('Error clearing old logs:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Logs</h1>
        <p className="text-gray-600">Monitor and analyze system errors and issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors}</div>
            <p className="text-xs text-gray-500">All time errors logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalErrors}</div>
            <p className="text-xs text-gray-500">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate (24h)</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recentTrends.length > 0 ? stats.recentTrends[0].count : 0}
            </div>
            <p className="text-xs text-gray-500">Errors in last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Error Source</CardTitle>
            <Code className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Object.keys(stats.errorsBySource).length > 0 
                ? Object.entries(stats.errorsBySource)
                    .sort(([,a], [,b]) => b - a)[0][0]
                : 'None'}
            </div>
            <p className="text-xs text-gray-500">Most frequent error source</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </span>
            <div className="flex gap-2">
              <Button onClick={loadErrorLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportErrorLogs} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={clearOldLogs} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Cleanup Old Logs
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by message, source, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level Filter</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="WARN">Warning</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source Filter</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs ({filteredErrorLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading error logs...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Level</th>
                    <th className="text-left py-3 px-4 font-medium">Source</th>
                    <th className="text-left py-3 px-4 font-medium">Message</th>
                    <th className="text-left py-3 px-4 font-medium">User/Payment</th>
                    <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedErrorLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className={`border-b hover:bg-gray-50 cursor-pointer ${
                        log.level === 'CRITICAL' ? 'bg-red-50' : 
                        log.level === 'ERROR' ? 'bg-orange-50' : ''
                      }`}
                      onClick={() => setSelectedError(log)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-sm">{log.source}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <div className="text-sm font-medium truncate">{log.message}</div>
                          {log.details && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {JSON.parse(log.details).error || log.details}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {log.userId && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <User className="h-3 w-3" />
                              {log.userId.substring(0, 8)}...
                            </div>
                          )}
                          {log.paymentId && (
                            <div className="flex items-center gap-1 text-green-600">
                              <AlertTriangle className="h-3 w-3" />
                              {log.paymentId.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedError(log);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredErrorLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No error logs found matching your criteria
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredErrorLogs.length)} of {filteredErrorLogs.length} logs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getLevelIcon(selectedError.level)}
                  <h2 className="text-xl font-semibold">Error Details</h2>
                  {getLevelBadge(selectedError.level)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedError(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Error ID</Label>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedError.id}</div>
                  </div>
                  <div>
                    <Label className="font-medium">Timestamp</Label>
                    <div className="text-sm bg-gray-100 p-2 rounded">
                      {format(new Date(selectedError.timestamp), 'PPpp')}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Source</Label>
                  <div className="text-sm bg-gray-100 p-2 rounded">{selectedError.source}</div>
                </div>

                <div>
                  <Label className="font-medium">Message</Label>
                  <div className="text-sm bg-gray-100 p-3 rounded">{selectedError.message}</div>
                </div>

                {selectedError.details && (
                  <div>
                    <Label className="font-medium">Details</Label>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedError.details), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedError.stack && (
                  <div>
                    <Label className="font-medium">Stack Trace</Label>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto font-mono">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}

                {(selectedError.userId || selectedError.paymentId) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedError.userId && (
                      <div>
                        <Label className="font-medium">User ID</Label>
                        <div className="font-mono text-sm bg-blue-50 p-2 rounded">{selectedError.userId}</div>
                      </div>
                    )}
                    {selectedError.paymentId && (
                      <div>
                        <Label className="font-medium">Payment ID</Label>
                        <div className="font-mono text-sm bg-green-50 p-2 rounded">{selectedError.paymentId}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}