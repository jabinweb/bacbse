'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, Copy, ExternalLink } from 'lucide-react';

interface Payment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  gateway: string;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  cashfreeOrderId?: string;
}

interface Subscription {
  id: string;
  status: string;
  planType: string;
  startDate: string;
  endDate: string;
  className?: string;
  subjectName?: string;
  isActive: boolean;
}

interface PaymentStatusResponse {
  payment?: Payment;
  subscriptions?: Subscription[];
  user?: { id: string; email: string; displayName: string };
}

export default function PaymentTroubleshoot({ paymentId }: { paymentId?: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualVerifyLoading, setManualVerifyLoading] = useState(false);

  const fetchPaymentStatus = useCallback(async () => {
    if (!paymentId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/status?paymentId=${paymentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment status');
      }

      setPaymentData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (session?.user && paymentId) {
      fetchPaymentStatus();
    }
  }, [session, paymentId, fetchPaymentStatus]);

  const handleManualVerify = async () => {
    if (!paymentId) return;

    setManualVerifyLoading(true);
    
    try {
      const response = await fetch('/api/payment/manual-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Manual verification completed successfully!');
        await fetchPaymentStatus(); // Refresh data
      } else {
        throw new Error(result.error || 'Manual verification failed');
      }
    } catch (err) {
      alert(`Manual verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setManualVerifyLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session?.user) {
    return (
      <Alert description="Please sign in to check your payment status." />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading payment information...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive" description={error} />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPaymentStatus}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  if (!paymentData?.payment) {
    return (
      <Alert description="No payment information found. If you made a payment, please wait a few minutes and try again." />
    );
  }

  const { payment, subscriptions = [] } = paymentData;
  const hasActiveSubscription = subscriptions.some(sub => sub.isActive);

  return (
    <div className="space-y-6">
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(payment.status)}
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge className={getStatusColor(payment.status)}>
                {payment.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Amount</p>
              <p className="font-semibold">₹{payment.amount / 100}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Gateway</p>
              <p className="font-semibold capitalize">{payment.gateway}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="font-semibold">
                {new Date(payment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Payment IDs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Payment ID:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{payment.id}</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(payment.id)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {payment.razorpayOrderId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Razorpay Order ID:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{payment.razorpayOrderId}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(payment.razorpayOrderId!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {payment.razorpayPaymentId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Razorpay Payment ID:</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{payment.razorpayPaymentId}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(payment.razorpayPaymentId!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasActiveSubscription ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {subscription.planType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Content: </span>
                      {subscription.className || subscription.subjectName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Valid Until: </span>
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert description="No subscriptions found for this payment. If you completed the payment successfully, please try manual verification below." />
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting Actions */}
      {payment.status === 'COMPLETED' && !hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert description="Your payment was successful, but we couldn't automatically create your subscription. This can happen due to temporary technical issues." />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleManualVerify}
                disabled={manualVerifyLoading}
              >
                {manualVerifyLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Manual Verification
              </Button>
              
              <Button variant="outline" onClick={fetchPaymentStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            If you&apos;re still experiencing issues, please contact our support team with your payment ID:
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/support" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(`Payment ID: ${payment.id}\nStatus: ${payment.status}\nAmount: ₹${payment.amount / 100}\nDate: ${new Date(payment.createdAt).toLocaleString()}`)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Payment Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}