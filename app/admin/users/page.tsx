'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, RefreshCw, AlertCircle, UserCheck, Plus, Edit, UserX, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Subscription {
  id: string;
  status: string;
  amount?: number;
  planType: string;
  startDate: string;
  endDate?: string;
  created_at: string;
}

interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoUrl?: string | null; // Add photo URL support
  creationTime: string;
  lastSignInTime: string | null;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  totalPayments: number;
  totalAmountPaid: number;
  role?: string; // Add role to interface
  isActive?: boolean; // Add isActive to interface
}

interface UserFormData {
  email: string;
  displayName: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER';
  isActive: boolean;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const loading = status === 'loading';
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    password: '',
    role: 'USER',
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced admin check
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);

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
        setDataLoading(true);
        try {
          const usersResponse = await fetch('/api/admin/users');
          const usersData = await usersResponse.json();

          // Ensure array is returned
          setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching users data:', error);
          setRegisteredUsers([]);
          setDataFetched(true);
        } finally {
          setDataLoading(false);
        }
      };

      fetchData();
    } else if (!isLoadingAuth && !user) {
      setDataLoading(false);
    } else if (!isLoadingAuth && userRole !== 'ADMIN') {
      setDataLoading(false);
    }
  }, [isAdmin, isLoadingAuth, dataFetched, user, userRole]);

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setRegisteredUsers(registeredUsers.filter(user => user.uid !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        refreshData();
        setFormOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.uid,
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          isActive: formData.isActive,
        }),
      });

      if (response.ok) {
        refreshData();
        setFormOpen(false);
        setEditingUser(null);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      displayName: '',
      password: '',
      role: 'USER',
      isActive: true,
    });
  };

  const openEditForm = (user: RegisteredUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName || '',
      password: '', // Don't populate password for editing
      role: 'USER', // Default, would need to be fetched from user data
      isActive: true, // Default, would need to be fetched from user data
    });
    setFormOpen(true);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          isActive: !currentStatus 
        }),
      });
      
      if (response.ok) {
        refreshData();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      
      setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return registeredUsers;
    
    const searchLower = searchTerm.toLowerCase();
    return registeredUsers.filter(user => 
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  }, [registeredUsers, searchTerm]);

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

  if (dataLoading) {
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
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage registered users and their subscriptions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshData} variant="outline" disabled={dataLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registeredUsers.length}</div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground">
                  {filteredUsers.length} matching search
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registeredUsers.filter(u => u.hasActiveSubscription).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registeredUsers.reduce((sum, u) => sum + u.totalPayments, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.round(registeredUsers.reduce((sum, u) => sum + u.totalAmountPaid, 0) / 100).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((registeredUser) => (
                <div key={registeredUser.uid} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      {registeredUser.photoUrl && (
                        <AvatarImage src={registeredUser.photoUrl} alt={registeredUser.displayName || 'User'} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                        {registeredUser.displayName?.[0] || registeredUser.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{registeredUser.displayName || 'Anonymous'}</h3>
                      <p className="text-sm text-muted-foreground">{registeredUser.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={registeredUser.hasActiveSubscription ? 'default' : 'secondary'}>
                          {registeredUser.hasActiveSubscription ? 'Active Subscriber' : 'Free User'}
                        </Badge>
                        <Badge 
                          variant={registeredUser.role === 'ADMIN' ? 'destructive' : registeredUser.role === 'TEACHER' ? 'default' : 'outline'}
                        >
                          {registeredUser.role || 'USER'}
                        </Badge>
                        <Badge variant={registeredUser.isActive !== false ? 'default' : 'secondary'}>
                          {registeredUser.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                        {registeredUser.subscription && (
                          <Badge variant="outline">
                            {registeredUser.subscription.planType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{Math.round(registeredUser.totalAmountPaid / 100).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{registeredUser.totalPayments} payments</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(registeredUser.creationTime).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(registeredUser)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={registeredUser.hasActiveSubscription ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => toggleUserStatus(registeredUser.uid, true)}
                      >
                        {registeredUser.hasActiveSubscription ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(registeredUser.uid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found matching &quot;{searchTerm}&quot;</p>
                </div>
              )}
              {registeredUsers.length === 0 && !searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={formOpen} onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingUser(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={!!editingUser} // Don't allow email changes for existing users
                  />
                </div>
                
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    required
                  />
                </div>

                {!editingUser && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required={!editingUser}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'USER' | 'ADMIN' | 'MODERATOR' | 'TEACHER') => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active User</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
