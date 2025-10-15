'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Plus,
  Send,
  Eye,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ANNOUNCEMENT' | 'SUBSCRIPTION_REMINDER' | 'PAYMENT_REMINDER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  data?: Record<string, unknown>;
  expiresAt?: string;
  created_at: string;
  updatedAt: string;
  user?: {
    name?: string;
    email?: string;
  };
}

interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<string, number>;
  notificationsByPriority: Record<string, number>;
}

interface CreateNotificationData {
  title: string;
  message: string;
  type: string;
  priority: string;
  userId?: string;
  expiresAt?: string;
  data?: Record<string, unknown>;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    notificationsByType: {},
    notificationsByPriority: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [readFilter, setReadFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState<CreateNotificationData>({
    title: '',
    message: '',
    type: 'INFO',
    priority: 'NORMAL'
  });
  const itemsPerPage = 20;

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = {
      INFO: { icon: Info, className: 'text-blue-600' },
      SUCCESS: { icon: CheckCircle, className: 'text-green-600' },
      WARNING: { icon: AlertTriangle, className: 'text-yellow-600' },
      ERROR: { icon: AlertCircle, className: 'text-red-600' },
      ANNOUNCEMENT: { icon: Bell, className: 'text-purple-600' },
      SUBSCRIPTION_REMINDER: { icon: Bell, className: 'text-orange-600' },
      PAYMENT_REMINDER: { icon: Bell, className: 'text-pink-600' },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INFO;
    const IconComponent = config.icon;
    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INFO: { label: 'Info', className: 'bg-blue-100 text-blue-800' },
      SUCCESS: { label: 'Success', className: 'bg-green-100 text-green-800' },
      WARNING: { label: 'Warning', className: 'bg-yellow-100 text-yellow-800' },
      ERROR: { label: 'Error', className: 'bg-red-100 text-red-800' },
      ANNOUNCEMENT: { label: 'Announcement', className: 'bg-purple-100 text-purple-800' },
      SUBSCRIPTION_REMINDER: { label: 'Subscription', className: 'bg-orange-100 text-orange-800' },
      PAYMENT_REMINDER: { label: 'Payment', className: 'bg-pink-100 text-pink-800' },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INFO;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { label: 'Low', className: 'bg-gray-100 text-gray-800' },
      NORMAL: { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
      HIGH: { label: 'High', className: 'bg-orange-100 text-orange-800' },
      URGENT: { label: 'Urgent', className: 'bg-red-100 text-red-800 font-semibold' },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.NORMAL;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const createNotification = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData)
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        setCreateData({
          title: '',
          message: '',
          type: 'INFO',
          priority: 'NORMAL'
        });
        await loadNotifications();
        await loadStats();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || notification.type === typeFilter;
    const matchesPriority = priorityFilter === 'ALL' || notification.priority === priorityFilter;
    const matchesRead = readFilter === 'ALL' || 
                       (readFilter === 'READ' && notification.isRead) ||
                       (readFilter === 'UNREAD' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const exportNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `notifications-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting notifications:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications Management</h1>
        <p className="text-gray-600">Create and manage system notifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications}</div>
            <p className="text-xs text-gray-500">All notifications sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unreadNotifications}</div>
            <p className="text-xs text-gray-500">Awaiting user attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
            <Info className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {Object.keys(stats.notificationsByType).length > 0 
                ? Object.entries(stats.notificationsByType)
                    .sort(([,a], [,b]) => b - a)[0][0]
                : 'None'}
            </div>
            <p className="text-xs text-gray-500">Most frequent type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.notificationsByPriority.HIGH || 0) + (stats.notificationsByPriority.URGENT || 0)}
            </div>
            <p className="text-xs text-gray-500">High + urgent notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Notification Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={createData.title}
                  onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={createData.type} onValueChange={(value) => setCreateData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                    <SelectItem value="SUBSCRIPTION_REMINDER">Subscription Reminder</SelectItem>
                    <SelectItem value="PAYMENT_REMINDER">Payment Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={createData.priority} onValueChange={(value) => setCreateData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">User ID (Optional)</Label>
                <Input
                  id="userId"
                  value={createData.userId || ''}
                  onChange={(e) => setCreateData(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Leave empty for broadcast"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={createData.message}
                  onChange={(e) => setCreateData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={createData.expiresAt || ''}
                  onChange={(e) => setCreateData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={createNotification} disabled={!createData.title || !createData.message}>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </span>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
              <Button onClick={loadNotifications} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportNotifications} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type Filter</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                  <SelectItem value="SUBSCRIPTION_REMINDER">Subscription Reminder</SelectItem>
                  <SelectItem value="PAYMENT_REMINDER">Payment Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Filter</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="read">Read Status</Label>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="UNREAD">Unread</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading notifications...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Recipient</th>
                    <th className="text-left py-3 px-4 font-medium">Priority</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Created</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotifications.map((notification) => (
                    <tr 
                      key={notification.id} 
                      className={`border-b hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          {getTypeBadge(notification.type)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-gray-500 truncate">{notification.message}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {notification.user ? (
                            <div>
                              <div className="font-medium">{notification.user.name}</div>
                              <div className="text-xs text-gray-500">{notification.user.email}</div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Users className="h-3 w-3" />
                              Broadcast
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(notification.priority)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {notification.isRead ? (
                            <Badge className="bg-gray-100 text-gray-800">Read</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Unread</Badge>
                          )}
                          {notification.expiresAt && new Date(notification.expiresAt) < new Date() && (
                            <Badge className="bg-yellow-100 text-yellow-800">Expired</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No notifications found matching your criteria
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
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
    </div>
  );
}