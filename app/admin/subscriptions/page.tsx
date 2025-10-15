'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Crown, Calendar, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AvatarImage } from '@radix-ui/react-avatar';

interface Subscription {
  id: string;
  userId: string;
  paymentId: string;
  amount: number;
  status: string;
  created_at: string;
  planType: string;
  planName?: string;
  class?: {
    id: number;
    name: string;
  } | null;
  subject?: {
    id: string;
    name: string;
  } | null;
}

interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string | null;
  creationTime: string;
  lastSignInTime: string | null;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  photoUrl?: string;
}

export default function SubscriptionsPage() {
  // State for classes and subjects
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const loading = status === 'loading';
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formUserId, setFormUserId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formPlanType, setFormPlanType] = useState('CLASS');
  const [planTypes, setPlanTypes] = useState<string[]>(["CLASS", "SUBJECT", "CUSTOM"]);

  // Enhanced admin check - wait for userRole to be loaded
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = loading || (user && userRole === null);

// Fetch classes for dropdown
useEffect(() => {
  if (showCreateModal) {
    fetch('/api/admin/classes')
      .then(res => res.json())
      .then(data => setClasses(Array.isArray(data) ? data : []));
  }
}, [showCreateModal]);

// Fetch subjects for selected class
useEffect(() => {
  if (showCreateModal && formClassId) {
    fetch(`/api/admin/subjects?classId=${formClassId}`)
      .then(res => res.json())
      .then(data => setSubjects(Array.isArray(data) ? data : []));
  } else if (showCreateModal) {
    setSubjects([]);
  }
}, [showCreateModal, formClassId]);
  // Fetch unique plan types from the backend
  useEffect(() => {
    if (showCreateModal) {
      fetch('/api/admin/subscriptions?distinct=planType')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPlanTypes(Array.from(new Set(["CLASS", "SUBJECT", "CUSTOM", ...data.map((s: { planType: string }) => s.planType).filter(Boolean)])));
          }
        });
    }
  }, [showCreateModal]);

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
          const [subscriptionsResponse, usersResponse] = await Promise.all([
            fetch('/api/admin/subscriptions'),
            fetch('/api/admin/users')
          ]);
          
          const subscriptionsData = await subscriptionsResponse.json();
          const usersData = await usersResponse.json();

          // Ensure arrays are returned
          setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
          setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching subscription data:', error);
          setSubscriptions([]);
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

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, status: newStatus }),
      });
      
      if (response.ok) {
        setSubscriptions(subscriptions.map(sub => 
          sub.id === subscriptionId ? { ...sub, status: newStatus } : sub
        ));
        // Also update the users list
        setRegisteredUsers(registeredUsers.map(user => 
          user.subscription?.id === subscriptionId 
            ? { ...user, subscription: { ...user.subscription, status: newStatus }, hasActiveSubscription: newStatus === 'active' }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      const response = await fetch(`/api/admin/subscriptions?id=${subscriptionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const refreshData = async () => {
    setDataLoading(true);
    try {
      const [subscriptionsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/users')
      ]);
      
      const subscriptionsData = await subscriptionsResponse.json();
      const usersData = await usersResponse.json();
      
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setRegisteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSubscriptions([]);
      setRegisteredUsers([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Filter subscriptions based on search term
  const filteredSubscriptions = useMemo(() => {
    if (!searchTerm.trim()) return subscriptions;
    
    const searchLower = searchTerm.toLowerCase();
    return subscriptions.filter(subscription => {
      const user = registeredUsers.find(user => user.uid === subscription.userId);
      return (
        user?.displayName?.toLowerCase().includes(searchLower) ||
        user?.email?.toLowerCase().includes(searchLower) ||
        subscription.status.toLowerCase().includes(searchLower) ||
        subscription.paymentId.toLowerCase().includes(searchLower) ||
        subscription.class?.name?.toLowerCase().includes(searchLower) ||
        subscription.subject?.name?.toLowerCase().includes(searchLower) ||
        subscription.planName?.toLowerCase().includes(searchLower)
      );
    });
  }, [subscriptions, searchTerm, registeredUsers]);

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

  const activeSubscriptions = Array.isArray(subscriptions) ? subscriptions.filter(s => s.status === 'ACTIVE') : [];
  const totalRevenue = Array.isArray(subscriptions) ? subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) : 0;


  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-muted-foreground">Manage user subscriptions and payments</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateModal(true)} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              + Create Subscription
            </Button>
            <Button onClick={refreshData} disabled={dataLoading} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Create Subscription Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowCreateModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Create Subscription</h2>
              {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setFormLoading(true);
                setFormError('');
                try {
                  const res = await fetch('/api/admin/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: formUserId,
                      planType: formPlanType,
                      classId: Number(formClassId),
                      subjectId: formSubjectId || undefined,
                      amount: Number(formAmount),
                      status: formStatus
                    })
                  });
                  if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'Failed to create subscription');
                  }
                  setShowCreateModal(false);
                  setFormUserId('');
                  setFormClassId('');
                  setFormSubjectId('');
                  setFormAmount('');
                  setFormStatus('ACTIVE');
                  setFormPlanType('CLASS');
                  refreshData();
                } catch (err) {
                  if (err instanceof Error) {
                    setFormError(err.message || 'Failed to create subscription');
                  } else {
                    setFormError('Failed to create subscription');
                  }
                } finally {
                  setFormLoading(false);
                }
              }}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">User</label>
                  <select value={formUserId} onChange={e => setFormUserId(e.target.value)} required className="w-full border rounded px-2 py-1">
                    <option value="">Select user...</option>
                    {registeredUsers.map(u => (
                      <option key={u.uid} value={u.uid}>{u.displayName || u.email}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Class <span className="text-red-500">*</span></label>
                  <select value={formClassId} onChange={e => { setFormClassId(e.target.value); setFormSubjectId(''); }} required className="w-full border rounded px-2 py-1">
                    <option value="">Select class...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Subject (optional)</label>
                  <select value={formSubjectId} onChange={e => setFormSubjectId(e.target.value)} className="w-full border rounded px-2 py-1" disabled={!formClassId || subjects.length === 0}>
                    <option value="">None</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Amount (in paise)</label>
                  <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} required min="1" className="w-full border rounded px-2 py-1" placeholder="Amount in paise (e.g. 10000 for ₹100)" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Plan Type</label>
                  <select value={formPlanType} onChange={e => setFormPlanType(e.target.value)} required className="w-full border rounded px-2 py-1">
                    {planTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value)} required className="w-full border rounded px-2 py-1">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create Subscription'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user name, email, status, class, subject, or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground">
                  {filteredSubscriptions.length} matching search
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Math.round(totalRevenue / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredSubscriptions.map((subscription) => {
            const subscriptionUser = registeredUsers.find(user => user.uid === subscription.userId);
            const isActive = subscription.status === 'ACTIVE';
            
            return (
              <Card key={subscription.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className={`pb-4 ${isActive ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-gray-50 to-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`relative ${isActive ? 'ring-2 ring-green-200' : 'ring-2 ring-gray-200'} rounded-full`}>
                        <Avatar className="h-10 w-10">
                            {subscriptionUser?.photoUrl && (
                              <AvatarImage src={subscriptionUser?.photoUrl} alt={subscriptionUser?.displayName || 'User'} />
                            )}
                          <AvatarFallback className={`${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} font-semibold text-sm`}>
                            {subscriptionUser?.displayName?.[0] || subscriptionUser?.email?.[0].toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {isActive && (
                          <div className="absolute top-0 right-1 bg-green-500 text-white rounded-full p-1">
                            <Crown className="h-2 w-2" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {subscriptionUser?.displayName || 'Anonymous User'}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {subscriptionUser?.email || subscription.userId.slice(0, 8) + '...'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={isActive ? 'default' : 'secondary'}
                      className={`${isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800'} font-medium text-xs`}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-4">
                  {/* Subscription Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <DollarSign className="h-3 w-3 text-blue-600" />
                      <div>
                        <div className="text-xs text-blue-600 font-medium">Amount</div>
                        <div className="font-semibold text-gray-900 text-sm">₹{subscription.amount/100}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <Calendar className="h-3 w-3 text-purple-600" />
                      <div>
                        <div className="text-xs text-purple-600 font-medium">Date</div>
                        <div className="font-semibold text-gray-900 text-xs">
                          {new Date(subscription.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Class/Subject Information */}
                  <div className="space-y-2">
                    {subscription.class && (
                      <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-indigo-600 font-medium">Class Subscription</div>
                          <div className="font-semibold text-gray-900 text-sm line-clamp-1">{subscription.class.name}</div>
                        </div>
                      </div>
                    )}
                    {subscription.subject && (
                      <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                        <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-emerald-600 font-medium">Subject Subscription</div>
                          <div className="font-semibold text-gray-900 text-sm line-clamp-1">{subscription.subject.name}</div>
                        </div>
                      </div>
                    )}
                    {subscription.planName && !subscription.class && !subscription.subject && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-orange-600 font-medium">Plan</div>
                          <div className="font-semibold text-gray-900 text-sm line-clamp-1">{subscription.planName}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={subscription.status === 'ACTIVE' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSubscriptionStatus(subscription.id, 'ACTIVE')}
                        className="flex-1 text-xs h-8"
                        disabled={subscription.status === 'ACTIVE'}
                      >
                        {subscription.status === 'ACTIVE' ? 'Active' : 'Activate'}
                      </Button>
                      <Button
                        variant={subscription.status === 'INACTIVE' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSubscriptionStatus(subscription.id, 'INACTIVE')}
                        className="flex-1 text-xs h-8"
                        disabled={subscription.status === 'INACTIVE'}
                      >
                        {subscription.status === 'INACTIVE' ? 'Inactive' : 'Deactivate'}
                      </Button>
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSubscription(subscription.id)}
                      className="w-full text-xs h-8"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredSubscriptions.length === 0 && searchTerm && (
          <Card className="p-12 text-center">
            <Crown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Subscriptions Found</h3>
            <p className="text-muted-foreground">No subscriptions match your search for &quot;{searchTerm}&quot;</p>
          </Card>
        )}

        {subscriptions.length === 0 && !searchTerm && (
          <Card className="p-12 text-center">
            <Crown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Subscriptions Found</h3>
            <p className="text-muted-foreground">Subscription data will appear here once users start subscribing.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

