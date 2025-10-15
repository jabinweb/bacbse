'use client';

import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, CreditCard, AlertCircle, AlertTriangle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Subscription {
  id: string;
  planType: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'GRACE_PERIOD' | 'PENDING_RENEWAL';
  startDate: string;
  endDate: string;
  className?: string;
  subjectName?: string;
  amount: number;
  autoRenew: boolean;
}

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAutoRenewal, setUpdatingAutoRenewal] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/subscriptions?userId=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch subscriptions');
        }

        setSubscriptions(data.subscriptions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user?.id]);

  const toggleAutoRenewal = async (subscriptionId: string, autoRenew: boolean) => {
    setUpdatingAutoRenewal(true);
    try {
      const response = await fetch('/api/admin/subscriptions/auto-renewal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          autoRenew,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update auto-renewal setting');
      }

      // Update the subscription in the local state
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, autoRenew }
          : sub
      ));

    } catch (error) {
      console.error('Error updating auto-renewal:', error);
      alert('Failed to update auto-renewal setting. Please try again.');
    } finally {
      setUpdatingAutoRenewal(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Expired</Badge>;
      case 'GRACE_PERIOD':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Grace Period</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Cancelled</Badge>;
      case 'PENDING_RENEWAL':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Pending Renewal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeUntilExpiry = (endDateString: string) => {
    const endDate = new Date(endDateString);
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { expired: true, days: Math.abs(daysDiff), text: `Expired ${Math.abs(daysDiff)} days ago` };
    } else if (daysDiff === 0) {
      return { expired: false, urgent: true, days: 0, text: 'Expires today' };
    } else if (daysDiff <= 7) {
      return { expired: false, urgent: true, days: daysDiff, text: `Expires in ${daysDiff} day${daysDiff > 1 ? 's' : ''}` };
    } else {
      return { expired: false, urgent: false, days: daysDiff, text: `${daysDiff} days remaining` };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
          <p className="text-gray-600">Manage your active subscriptions and view payment history</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscriptions</h3>
              <p className="text-gray-600 mb-6">
                You don&apos;t have any active subscriptions. Browse our classes to get started!
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Browse Classes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((subscription) => {
              const expiryInfo = getTimeUntilExpiry(subscription.endDate);
              
              return (
                <Card key={subscription.id} className={`overflow-hidden ${expiryInfo.urgent ? 'border-orange-300 bg-orange-50' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">
                        {subscription.className || subscription.subjectName || 'Subscription'}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subscription.status)}
                        {expiryInfo.urgent && !expiryInfo.expired && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            ⚠️ {expiryInfo.text}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Start Date</p>
                          <p className="text-sm text-gray-600">{formatDate(subscription.startDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">End Date</p>
                          <p className="text-sm text-gray-600">{formatDate(subscription.endDate)}</p>
                          {subscription.status === 'ACTIVE' && (
                            <p className={`text-xs ${expiryInfo.urgent ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                              {expiryInfo.text}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Amount Paid</p>
                          <p className="text-sm text-gray-600">₹{subscription.amount / 100}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status-specific alerts and actions */}
                    {subscription.status === 'ACTIVE' && expiryInfo.urgent && (
                      <div className="mt-4 p-4 bg-orange-100 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="font-medium text-orange-800">Renewal Required Soon</p>
                              <p className="text-sm text-orange-700">
                                {expiryInfo.text}. Renew now to avoid service interruption.
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => window.location.href = '/dashboard'}
                          >
                            Renew Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {subscription.status === 'GRACE_PERIOD' && (
                      <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="font-medium text-yellow-800">Grace Period Active</p>
                              <p className="text-sm text-yellow-700">
                                Your subscription has expired but you have limited access. Renew now to restore full access.
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            onClick={() => window.location.href = '/dashboard'}
                          >
                            Renew Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {subscription.status === 'EXPIRED' && (
                      <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-medium text-red-800">Subscription Expired</p>
                              <p className="text-sm text-red-700">
                                Your access has ended. Resubscribe to continue your learning journey.
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => window.location.href = '/dashboard'}
                          >
                            Resubscribe
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Auto-renewal settings */}
                    {subscription.status !== 'EXPIRED' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <RotateCcw className="h-4 w-4 text-blue-600" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Auto-renewal</span>
                              <p className="text-xs text-gray-600">
                                {subscription.autoRenew 
                                  ? 'Your subscription will renew automatically' 
                                  : 'Manual renewal required'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleAutoRenewal(subscription.id, !subscription.autoRenew)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              subscription.autoRenew ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            disabled={updatingAutoRenewal}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                subscription.autoRenew ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {subscription.status === 'ACTIVE' && !expiryInfo.urgent && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Active subscription</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          You have full access to this content until {formatDate(subscription.endDate)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}