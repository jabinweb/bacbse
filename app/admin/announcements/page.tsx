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
  Megaphone, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'UPDATE' | 'MAINTENANCE' | 'PROMOTION' | 'WARNING';
  isActive: boolean;
  targetUsers: string[];
  startDate?: string;
  endDate?: string;
  created_at: string;
  updatedAt: string;
}

interface AnnouncementStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  announcementsByType: Record<string, number>;
  scheduledAnnouncements: number;
  expiredAnnouncements: number;
}

interface CreateAnnouncementData {
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  targetUsers: string[];
  startDate?: string;
  endDate?: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<AnnouncementStats>({
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    announcementsByType: {},
    scheduledAnnouncements: 0,
    expiredAnnouncements: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createData, setCreateData] = useState<CreateAnnouncementData>({
    title: '',
    content: '',
    type: 'INFO',
    isActive: true,
    targetUsers: []
  });
  const itemsPerPage = 20;

  useEffect(() => {
    loadAnnouncements();
    loadStats();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/announcements/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading announcement stats:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = {
      INFO: { icon: Info, className: 'text-blue-600' },
      UPDATE: { icon: CheckCircle, className: 'text-green-600' },
      MAINTENANCE: { icon: Wrench, className: 'text-orange-600' },
      PROMOTION: { icon: Megaphone, className: 'text-purple-600' },
      WARNING: { icon: AlertTriangle, className: 'text-red-600' },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INFO;
    const IconComponent = config.icon;
    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      INFO: { label: 'Info', className: 'bg-blue-100 text-blue-800' },
      UPDATE: { label: 'Update', className: 'bg-green-100 text-green-800' },
      MAINTENANCE: { label: 'Maintenance', className: 'bg-orange-100 text-orange-800' },
      PROMOTION: { label: 'Promotion', className: 'bg-purple-100 text-purple-800' },
      WARNING: { label: 'Warning', className: 'bg-red-100 text-red-800' },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INFO;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date();
    const startDate = announcement.startDate ? new Date(announcement.startDate) : null;
    const endDate = announcement.endDate ? new Date(announcement.endDate) : null;

    if (!announcement.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }

    if (startDate && startDate > now) {
      return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
    }

    if (endDate && endDate < now) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }

    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const createAnnouncement = async () => {
    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : '/api/admin/announcements';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData)
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        setEditingId(null);
        setCreateData({
          title: '',
          content: '',
          type: 'INFO',
          isActive: true,
          targetUsers: []
        });
        await loadAnnouncements();
        await loadStats();
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setCreateData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
      targetUsers: announcement.targetUsers,
      startDate: announcement.startDate,
      endDate: announcement.endDate
    });
    setEditingId(announcement.id);
    setShowCreateForm(true);
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
        await loadStats();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const toggleStatus = async (announcementId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      
      if (response.ok) {
        setAnnouncements(prev => prev.map(a => 
          a.id === announcementId ? { ...a, isActive: !isActive } : a
        ));
      }
    } catch (error) {
      console.error('Error toggling announcement status:', error);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = !searchTerm || 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || announcement.type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      const now = new Date();
      const startDate = announcement.startDate ? new Date(announcement.startDate) : null;
      const endDate = announcement.endDate ? new Date(announcement.endDate) : null;

      switch (statusFilter) {
        case 'ACTIVE':
          matchesStatus = announcement.isActive && 
                         (!startDate || startDate <= now) && 
                         (!endDate || endDate >= now);
          break;
        case 'INACTIVE':
          matchesStatus = !announcement.isActive;
          break;
        case 'SCHEDULED':
          matchesStatus = !!announcement.isActive && !!startDate && startDate > now;
          break;
        case 'EXPIRED':
          matchesStatus = !!endDate && endDate < now;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  const exportAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `announcements-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting announcements:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements Management</h1>
        <p className="text-gray-600">Create and manage system announcements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnnouncements}</div>
            <p className="text-xs text-gray-500">All announcements created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAnnouncements}</div>
            <p className="text-xs text-gray-500">Currently visible to users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.scheduledAnnouncements}</div>
            <p className="text-xs text-gray-500">Scheduled for future</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredAnnouncements}</div>
            <p className="text-xs text-gray-500">Past end date</p>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Announcement Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={createData.title}
                    onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Announcement title"
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
                      <SelectItem value="UPDATE">Update</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="PROMOTION">Promotion</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={createData.startDate || ''}
                    onChange={(e) => setCreateData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={createData.endDate || ''}
                    onChange={(e) => setCreateData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={createData.content}
                  onChange={(e) => setCreateData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={createData.isActive}
                  onChange={(e) => setCreateData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <Label htmlFor="isActive">Make announcement active immediately</Label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={createAnnouncement} 
                disabled={!createData.title || !createData.content}
              >
                {editingId ? 'Update Announcement' : 'Create Announcement'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingId(null);
                  setCreateData({
                    title: '',
                    content: '',
                    type: 'INFO',
                    isActive: true,
                    targetUsers: []
                  });
                }}
              >
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
                Create Announcement
              </Button>
              <Button onClick={loadAnnouncements} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportAnnouncements} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
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
                  placeholder="Search announcements..."
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
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="PROMOTION">Promotion</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements ({filteredAnnouncements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading announcements...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Schedule</th>
                    <th className="text-left py-3 px-4 font-medium">Created</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAnnouncements.map((announcement) => (
                    <tr 
                      key={announcement.id} 
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(announcement.type)}
                          {getTypeBadge(announcement.type)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <div className="font-medium text-sm">{announcement.title}</div>
                          <div className="text-xs text-gray-500 truncate">{announcement.content}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(announcement)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {announcement.startDate && (
                            <div className="text-green-600">
                              Start: {format(new Date(announcement.startDate), 'MMM dd, HH:mm')}
                            </div>
                          )}
                          {announcement.endDate && (
                            <div className="text-red-600">
                              End: {format(new Date(announcement.endDate), 'MMM dd, HH:mm')}
                            </div>
                          )}
                          {!announcement.startDate && !announcement.endDate && (
                            <span className="text-gray-500">No schedule</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editAnnouncement(announcement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(announcement.id, announcement.isActive)}
                          >
                            {announcement.isActive ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4 opacity-50" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAnnouncement(announcement.id)}
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

              {filteredAnnouncements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No announcements found matching your criteria
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAnnouncements.length)} of {filteredAnnouncements.length} announcements
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