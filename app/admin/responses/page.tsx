'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, AlertCircle, Download, Search, Mail, Phone, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FormResponse {
  id: string;
  formType: 'CONTACT' | 'DEMO' | 'SUPPORT';
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

const formTypeOptions = [
  { value: 'all', label: 'All Forms' },
  { value: 'CONTACT', label: 'Contact Forms' },
  { value: 'DEMO', label: 'Demo Requests' },
  { value: 'SUPPORT', label: 'Support Requests' },
];

export default function ResponsesPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const authLoading = status === 'loading';
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormType, setFilterFormType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Enhanced admin check
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    // Only redirect if we're sure the user is not an admin and auth is fully loaded
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      console.log('Redirecting non-admin user to home');
      window.location.href = '/';
      return;
    }

    // Only fetch data once when user is confirmed admin and data hasn't been fetched yet
    if (isAdmin && !dataFetched) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const responsesResponse = await fetch('/api/admin/responses');
          const responsesData = await responsesResponse.json();
          // Use the 'data' property from the API response
          setResponses(Array.isArray(responsesData.data) ? responsesData.data : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching form responses:', error);
          setResponses([]);
          setDataFetched(true);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else if (!isLoadingAuth && !user) {
      setLoading(false);
    } else if (!isLoadingAuth && userRole !== 'ADMIN') {
      setLoading(false);
    }
  }, [isAdmin, isLoadingAuth, dataFetched, user, userRole]);

  const deleteResponse = async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this form response?')) return;
    
    try {
      const response = await fetch(`/api/admin/responses?id=${responseId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setResponses(responses.filter(resp => resp.id !== responseId));
      }
    } catch (error) {
      console.error('Error deleting form response:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Type', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Created', 'Updated'],
      ...responses.map(response => [
        response.formType,
        response.name,
        response.email,
        response.phone || '',
        response.subject || '',
        response.message?.replace(/"/g, '""') || '',
        response.status,
        new Date(response.createdAt).toLocaleString(),
        new Date(response.updatedAt).toLocaleString()
      ])
    ];

    const csvString = csvContent.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-responses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const responsesResponse = await fetch('/api/admin/responses');
      const responsesData = await responsesResponse.json();
      setResponses(Array.isArray(responsesData.data) ? responsesData.data : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const updateResponseStatus = async (responseId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/responses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId, status: newStatus }),
      });
      
      if (response.ok) {
        setResponses(responses.map(resp => 
          resp.id === responseId ? { ...resp, status: newStatus as FormResponse['status'], updatedAt: new Date().toISOString() } : resp
        ));
      }
    } catch (error) {
      console.error('Error updating response status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getFormTypeBadge = (formType: string) => {
    const colors = {
      CONTACT: 'bg-blue-100 text-blue-800',
      DEMO: 'bg-purple-100 text-purple-800',
      SUPPORT: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={colors[formType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {formType}
      </Badge>
    );
  };

  // Filter responses based on search term and filters
  const filteredResponses = useMemo(() => {
    let filtered = responses;
    
    // Filter by form type
    if (filterFormType !== 'all') {
      filtered = filtered.filter(resp => resp.formType === filterFormType);
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(resp => resp.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(resp => 
        resp.name?.toLowerCase().includes(searchLower) ||
        resp.email?.toLowerCase().includes(searchLower) ||
        resp.subject?.toLowerCase().includes(searchLower) ||
        resp.message?.toLowerCase().includes(searchLower) ||
        resp.formType?.toLowerCase().includes(searchLower) ||
        resp.status?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [responses, searchTerm, filterFormType, filterStatus]);

  // Calculate status stats
  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredResponses.forEach(response => {
      const status = response.status || 'PENDING';
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }, [filteredResponses]);

  // Show loading while checking auth and role
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Form Responses</h1>
            <p className="text-muted-foreground">Manage demo request form submissions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={refreshData} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, subject, message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Select value={filterFormType} onValueChange={setFilterFormType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by form type" />
                </SelectTrigger>
                <SelectContent>
                  {formTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(responses) ? responses.length : 0}</div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground">
                  {filteredResponses.length} matching
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats.PENDING || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats.IN_PROGRESS || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats.RESOLVED || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusStats.CLOSED || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Form Responses List */}
        <Card>
          <CardHeader>
            <CardTitle>All Form Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(filteredResponses) && filteredResponses.map((response) => (
                <div key={response.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1 space-y-3">
                    {/* Header with name and badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-lg">{response.name}</h3>
                      {getFormTypeBadge(response.formType)}
                      {getStatusBadge(response.status)}
                    </div>
                    
                    {/* Contact Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${response.email}`} className="text-blue-600 hover:underline">
                          {response.email}
                        </a>
                      </div>
                      {response.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${response.phone}`} className="text-blue-600 hover:underline">
                            {response.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Subject and Message */}
                    {response.subject && (
                      <div>
                        <span className="font-medium text-sm text-gray-700">Subject:</span>
                        <p className="text-gray-600 mt-1">{response.subject}</p>
                      </div>
                    )}
                    
                    {response.message && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium text-sm text-gray-700">Message:</span>
                        </div>
                        <p className="text-gray-600 text-sm max-w-2xl">
                          {response.message.length > 200 
                            ? `${response.message.substring(0, 200)}...` 
                            : response.message
                          }
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {new Date(response.createdAt).toLocaleString()}</span>
                      </div>
                      {response.updatedAt !== response.createdAt && (
                        <span>Updated: {new Date(response.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 lg:mt-0 lg:ml-4">
                    <Select
                      value={response.status}
                      onValueChange={(value) => updateResponseStatus(response.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteResponse(response.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredResponses.length === 0 && (searchTerm || filterFormType !== 'all' || filterStatus !== 'all') && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No responses found matching your filters.</p>
                </div>
              )}
              
              {(!Array.isArray(responses) || responses.length === 0) && !searchTerm && filterFormType === 'all' && filterStatus === 'all' && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No form responses found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
