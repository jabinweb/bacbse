'use client';

import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard,
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  XCircle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import PaymentTroubleshoot from '@/components/payment/PaymentTroubleshoot';

interface Payment {
  id: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paymentMethod: string | null;
  description: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [troubleshootPaymentId, setTroubleshootPaymentId] = useState<string | null>(null);

  const fetchPayments = useCallback(async (page: number = 1, status: string = 'all') => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        userId: user.id,
        page: page.toString(),
        limit: '10'
      });

      if (status !== 'all') {
        params.set('status', status);
      }

      const response = await fetch(`/api/user/payments?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payments');
      }

      setPayments(data.payments || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPayments(currentPage, statusFilter);
  }, [fetchPayments, currentPage, statusFilter]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SUCCESS: { 
        className: 'bg-green-100 text-green-800 border-green-300', 
        icon: CheckCircle, 
        text: 'Success' 
      },
      PENDING: { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        icon: Clock, 
        text: 'Pending' 
      },
      FAILED: { 
        className: 'bg-red-100 text-red-800 border-red-300', 
        icon: XCircle, 
        text: 'Failed' 
      },
      CANCELLED: { 
        className: 'bg-gray-100 text-gray-800 border-gray-300', 
        icon: XCircle, 
        text: 'Cancelled' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const getPaymentDescription = (payment: Payment) => {
    return payment.description || 'Payment';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600">Track all your transactions and payment details</p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ₹{payments.filter(p => p.status === 'SUCCESS')
                          .reduce((sum, p) => sum + p.amount, 0) / 100}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Payments</p>
                      <p className="text-2xl font-bold">{payments.length}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 border-0 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Successful</p>
                      <p className="text-2xl font-bold">
                        {payments.filter(p => p.status === 'SUCCESS').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Pending</p>
                      <p className="text-2xl font-bold">
                        {payments.filter(p => p.status === 'PENDING').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                  </div>
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-[160px] border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="success">✅ Success</SelectItem>
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                      <SelectItem value="failed">❌ Failed</SelectItem>
                      <SelectItem value="cancelled">⚪ Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>

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

        {payments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-600 mb-6">
                You haven&apos;t made any payments yet. Start learning by subscribing to a class!
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Browse Classes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Payments List */}
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Payment Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {getPaymentDescription(payment)}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(payment.createdAt)}
                              </span>
                              {payment.razorpayPaymentId && (
                                <span className="font-mono text-xs">
                                  ID: {payment.razorpayPaymentId}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 mb-1">
                              {formatAmount(payment.amount)}
                            </div>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Payment Method:</span>
                            <p className="text-gray-600 capitalize">
                              {payment.paymentMethod || 'Not specified'}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">Currency:</span>
                            <p className="text-gray-600">
                              {payment.currency}
                            </p>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">Transaction ID:</span>
                            <p className="text-gray-600 font-mono text-xs">
                              {payment.razorpayOrderId || payment.id}
                            </p>
                          </div>
                        </div>

                        {/* Failure Reason with Troubleshoot Option */}
                        {payment.status === 'FAILED' && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Payment Failed</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTroubleshootPaymentId(
                                    troubleshootPaymentId === payment.id ? null : payment.id
                                  )}
                                  className="text-xs"
                                >
                                  {troubleshootPaymentId === payment.id ? 'Hide' : 'Quick Fix'}
                                </Button>
                                {/* <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/dashboard/payment-troubleshoot/${payment.id}`, '_blank')}
                                  className="text-xs"
                                >
                                  Deep Analysis
                                </Button> */}
                              </div>
                            </div>
                            {payment.failureReason && (
                              <p className="text-sm text-red-600">{payment.failureReason}</p>
                            )}
                            {!payment.failureReason && (
                              <p className="text-sm text-red-600">Payment was not completed successfully. Click &apos;Troubleshoot&apos; for more details.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Troubleshooting Section */}
            {troubleshootPaymentId && (() => {
              const payment = payments.find(p => p.id === troubleshootPaymentId);
              return payment && payment.status === 'FAILED' ? (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Payment Troubleshooting</h3>
                        <p className="text-sm text-gray-600">Investigating payment ID: {troubleshootPaymentId}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTroubleshootPaymentId(null)}
                      >
                        Close
                      </Button>
                    </div>
                    <PaymentTroubleshoot paymentId={troubleshootPaymentId} />
                  </CardContent>
                </Card>
              ) : null;
            })()}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount} payments
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
}