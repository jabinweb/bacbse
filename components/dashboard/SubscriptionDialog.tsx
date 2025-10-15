'use client';

// Type declarations for Cashfree SDK
declare module '@cashfreepayments/cashfree-js' {
  export function load(config: {
    mode: 'sandbox' | 'production';
  }): Promise<{
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget: string;
    }) => Promise<{
      error?: { message: string };
      paymentDetails?: {
        paymentId?: string;
        orderId?: string;
        status?: string;
        amount?: number;
        currency?: string;
      };
      redirect?: boolean;
    }>;
  }>;
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Star, Zap, BookOpen, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentError {
  message?: string;
  code?: string;
  description?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
    Cashfree: {
      checkout: (options: { paymentSessionId: string; redirectTarget: string }) => Promise<{
        error?: { message: string };
        paymentDetails?: {
          paymentId?: string;
          orderId?: string;
          status?: string;
          amount?: number;
          currency?: string;
        };
        redirect?: boolean;
      }>;
    };
  }
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  price?: number; // Price in paisa
  currency?: string; // Currency (INR, USD, etc.)
  isSubscribed?: boolean; // Whether user already has this subject
  subscriptionType?: 'school' | 'class_subscription' | 'subject_subscription'; // How they have access
  chapters: Array<{
    id: string;
    name: string;
    topics: Array<{ id: string; name: string; }>;
  }>;
}

interface ClassData {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string; // Currency (INR, USD, etc.)
  subjects: Subject[];
}

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData;
  onSubscribe: (type: 'class' | 'subject', options: { classId?: number; subjectId?: string; amount: number }) => void;
  disableAutoRedirect?: boolean; // Optional prop to disable automatic redirection
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  open,
  onClose,
  classData,
  onSubscribe,
  disableAutoRedirect = false
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    show: boolean;
    type: 'class' | 'subject';
    details?: {
      classId?: string;
      subjectId?: string;
      amount?: number;
      subscriptionName?: string;
    };
  }>({ show: false, type: 'class' });
  
  // Check if user has class subscription (all subjects subscribed via class_subscription)
  const hasClassSubscription = classData.subjects.every(subject => 
    subject.isSubscribed && subject.subscriptionType === 'class_subscription'
  );
  
  // Check if user has any subject subscriptions (for upgrade scenario)
  const hasSubjectSubscriptions = classData.subjects.some(subject => 
    subject.isSubscribed && subject.subscriptionType === 'subject_subscription'
  );
  
  // Check if this is an upgrade scenario (has some subject subscriptions but not full class)
  const isUpgradeScenario = hasSubjectSubscriptions && !hasClassSubscription;
  
  // Get unsubscribed subjects for individual subscription tab
  const unsubscribedSubjects = classData.subjects.filter(subject => !subject.isSubscribed);
  const subscribedSubjects = classData.subjects.filter(subject => subject.isSubscribed);
  
  // Set default tab based on subscription status
  const [subscriptionType, setSubscriptionType] = useState<'class' | 'subjects'>(
    hasClassSubscription || unsubscribedSubjects.length < classData.subjects.length ? 'subjects' : 'class'
  );
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Auto-close dialog after successful payment
  useEffect(() => {
    if (paymentSuccess.show) {
      const timer = setTimeout(() => {
        setPaymentSuccess({ show: false, type: 'class' });
        // Only auto-close if not handled by parent (dashboard will handle its own closing)
        if (disableAutoRedirect) {
          // Let parent handle closing timing
        } else {
          onClose();
        }
      }, 3000); // Close after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess.show, onClose, disableAutoRedirect]);

  // Handle login redirect
  const handleLoginRequired = () => {
    // Store subscription intent for after login
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingSubscription', JSON.stringify({
        timestamp: Date.now(),
        classId: classData.id,
        returnUrl: window.location.href
      }));
    }
    
    // Close the dialog and redirect to login
    onClose();
    signIn('google', { 
      callbackUrl: window.location.href // Return to current page after login
    });
  };

  const classPrice = classData.price / 100; // Convert from paisa to rupees
  
  // Calculate total price for selected subjects using their individual prices
  const selectedSubjectsPrice = Array.from(selectedSubjects).reduce((total, subjectId) => {
    const subject = classData.subjects.find(s => s.id === subjectId);
    const subjectPriceInRupees = (subject?.price || 7500) / 100; // Default to ₹75 if not set
    return total + subjectPriceInRupees;
  }, 0);

  const handleSubjectToggle = (subjectId: string) => {
    // Only allow toggling unsubscribed subjects
    const subject = classData.subjects.find(s => s.id === subjectId);
    if (subject?.isSubscribed) return;
    
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedSubjects(newSelected);
  };

  // Helper function to handle payment errors gracefully
  const handlePaymentError = (error: PaymentError | Error | unknown, context: string) => {
    console.log(`Payment ${context}:`, error);
    setIsProcessingPayment(false);
    setIsProcessing(false);
    
    let message = 'Payment failed. Please try again.';
    
    // Handle error message extraction with proper type checking
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('user dropped') || errorMsg.includes('user closed') || errorMsg.includes('cancelled') || errorMsg.includes('aborted')) {
          message = 'Payment was cancelled. You can try again whenever you\'re ready.';
        } else if (errorMsg.includes('failed') || errorMsg.includes('declined') || errorMsg.includes('insufficient')) {
          message = 'Payment was declined. Please check your payment details and try again.';
        } else if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
          message = 'Payment timed out due to network issues. Please check your connection and try again.';
        } else if (errorMsg.includes('flagged')) {
          message = 'Payment was flagged for security review. Please contact support if this persists.';
        }
      }
      
      // Handle Razorpay error states
      if ('code' in error && typeof error.code === 'string') {
        switch (error.code) {
          case 'PAYMENT_CANCELLED':
            message = 'Payment was cancelled. You can try again whenever you\'re ready.';
            break;
          case 'PAYMENT_FAILED':
            message = 'Payment failed. Please try a different payment method.';
            break;
          case 'NETWORK_ERROR':
            message = 'Network error occurred. Please check your connection and try again.';
            break;
          default:
            if ('description' in error && typeof error.description === 'string') {
              message = error.description;
            }
        }
      }
    }
    
    // Show error message in console for debugging
    console.error(`Payment Error (${context}): ${message}`);
    
    // Could add toast notification here instead of state management
    // For now, the error is logged and UI state is reset
  };

  const handleClassSubscribe = async () => {
    // Check if user is logged in first
    if (!user) {
      handleLoginRequired();
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call the existing class payment API
      const response = await fetch('/api/payment/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classData.id,
          userId: user.id
        })
      });
      
      const orderData = await response.json();
      if (!response.ok) {
        // Handle already-subscribed case gracefully (avoid throwing and console error)
        if (orderData && typeof orderData.error === 'string' && orderData.error.toLowerCase().includes('already subscribed')) {
          const message = `You already have an active subscription to this class! 
          
If you're still seeing limited access, please:
1. Refresh the page to update your access status
2. Log out and log back in
3. Contact support if the issue persists

Would you like to refresh the page now?`;

          if (confirm(message)) {
            window.location.reload();
          }
          onClose();
          return; // Return early instead of throwing
        }

        throw new Error(orderData.error);
      }
      
      // Handle different payment gateways
      if (orderData.gateway === 'CASHFREE') {
        // Handle Cashfree payment using JS SDK
        if (!window.Cashfree) {
          // Initialize Cashfree SDK if not loaded
          const { load } = await import('@cashfreepayments/cashfree-js');
          window.Cashfree = await load({
            mode: orderData.environment === 'production' ? 'production' : 'sandbox'
          });
        }
        
        console.log('[info] Cashfree class payment checkout with:', {
          environment: orderData.environment,
          hasPaymentSessionId: !!orderData.payment_session_id,
          paymentSessionIdLength: orderData.payment_session_id?.length
        });
        
        const checkoutOptions = {
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "_modal",
        };
        
        const result = await window.Cashfree.checkout(checkoutOptions);
        
        if (result.error) {
          handlePaymentError(result.error, 'Cashfree checkout error or user cancelled');
          return; // Exit gracefully instead of throwing
        }
        
        if (result.paymentDetails) {
          setIsProcessingPayment(true);
          
          // Verify Cashfree payment using unified verification
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderData.orderId,
              orderId: orderData.orderId,
              gateway: 'CASHFREE',
              paymentDetails: result.paymentDetails,
              metadata: {
                type: 'class_subscription',
                classId: classData.id,
                userId: user.id
              }
            })
          });
          
          if (verifyResponse.ok) {
            // Clear processing state first
            setIsProcessingPayment(false);
            
            // Show success message instead of immediate redirect
            setPaymentSuccess({
              show: true,
              type: 'class',
              details: {
                classId: classData.id.toString(),
                amount: classData.price,
                subscriptionName: `${classData.name} - Full Access`
              }
            });
            
            // Call onSubscribe immediately to update parent state
            onSubscribe('class', { classId: classData.id, amount: classData.price });
            
            // Handle redirect after success message is shown (if not disabled)
            if (!disableAutoRedirect) {
              setTimeout(() => {
                router.push(`/dashboard/class/${classData.id}`);
              }, 3500); // Wait for dialog to close first
            }
          } else {
            setIsProcessingPayment(false);
            throw new Error('Payment verification failed');
          }
        }
        
      } else {
        // Handle Razorpay payment (default)
        if (!window.Razorpay) {
          throw new Error('Payment system not available. Please refresh the page and try again.');
        }
        
        // Initialize Razorpay payment
        const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Scio Labs',
        description: `${classData.name} - Full Access`,
        order_id: orderData.orderId,
        handler: async (paymentResponse: RazorpayResponse) => {
          setIsProcessingPayment(true);
          
          // Verify payment using unified verification
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderData.orderId,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              metadata: {
                type: 'class_subscription',
                classId: classData.id,
                userId: user.id
              }
            })
          });
          
          if (verifyResponse.ok) {
            // Clear processing state first
            setIsProcessingPayment(false);
            
            // Show success message instead of immediate redirect
            setPaymentSuccess({
              show: true,
              type: 'class',
              details: {
                classId: classData.id.toString(),
                amount: classData.price,
                subscriptionName: `${classData.name} - Full Access`
              }
            });
            
            onSubscribe('class', { classId: classData.id, amount: classData.price });
            
            // Delayed redirect with success message
            if (!disableAutoRedirect) {
              setTimeout(() => {
                router.push(`/dashboard/class/${classData.id}`);
              }, 3000); // Increased to 3 seconds to show success message
            }
          } else {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user.name || user.email?.split('@')[0] || '',
          email: user.email || ''
        },
        theme: { color: '#3B82F6' }
      });
      
      razorpay.open();
      } // Close else block for Razorpay payment
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Already subscribed')) {
          // Show a more helpful message to the user
          const message = `You already have an active subscription to this class! 
          
If you're still seeing limited access, please:
1. Refresh the page to update your access status
2. Log out and log back in
3. Contact support if the issue persists

Would you like to refresh the page now?`;
          
          if (confirm(message)) {
            window.location.reload();
          }
          onClose();
        } else {
          // Provide more helpful error messages based on error type
          let context = 'class subscription';
          
          if (error.message.includes('Network error') || error.message.includes('fetch failed')) {
            context = 'Network connection issue. Please check your internet connection and try again.';
          } else if (error.message.includes('timeout')) {
            context = 'Request timed out. Please check your connection and try again.';
          } else if (error.message.includes('credentials not configured')) {
            context = 'Payment gateway configuration issue. Please contact support.';
          } else if (error.message.includes('DNS resolution')) {
            context = 'Unable to connect to payment service. Please check your internet connection.';
          } else if (error.message.includes('Invalid Cashfree')) {
            context = 'Payment gateway configuration error. Please contact support.';
          }
          
          handlePaymentError(error, context);
        }
      } else {
        handlePaymentError(error, 'class subscription - unknown error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubjectSubscribe = async () => {
    // Check if user is logged in first
    if (!user) {
      handleLoginRequired();
      return;
    }
    if (selectedSubjects.size === 0) return;
    setIsProcessing(true);

    // Gather all selected subjects and sum their prices
    const selectedSubjectIds = Array.from(selectedSubjects);
    const selectedSubjectObjs = classData.subjects.filter(s => selectedSubjectIds.includes(s.id));
    const totalAmount = selectedSubjectObjs.reduce((sum, s) => sum + (s.price || 7500), 0); // in paisa
    const subjectNames = selectedSubjectObjs.map(s => s.name).join(', ');

    console.log('[Debug] Subject subscription details:', {
      selectedSubjectIds,
      selectedSubjectObjs: selectedSubjectObjs.map(s => ({ id: s.id, name: s.name, price: s.price })),
      totalAmount,
      subjectNames
    });

    try {
      // Call the payment API for multiple subjects (update backend if needed)
      const response = await fetch('/api/payment/subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectIds: selectedSubjectIds,
          userId: user.id,
          amount: totalAmount // total in paisa
        })
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error);

      // Handle different payment gateways
      if (orderData.gateway === 'CASHFREE') {
        // Handle Cashfree payment using JS SDK
        if (!window.Cashfree) {
          // Initialize Cashfree SDK if not loaded
          const { load } = await import('@cashfreepayments/cashfree-js');
          window.Cashfree = await load({
            mode: orderData.environment === 'production' ? 'production' : 'sandbox'
          });
        }

        const checkoutOptions = {
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "_modal",
        };

        const result = await window.Cashfree.checkout(checkoutOptions);

        if (result.error) {
          handlePaymentError(result.error, 'Cashfree subject subscription error or user cancelled');
          return; // Exit gracefully instead of throwing
        }

        if (result.paymentDetails) {
          setIsProcessingPayment(true);

          // Payment successful, verify on backend
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderData.orderId,
              orderId: orderData.orderId,
              gateway: 'CASHFREE',
              paymentDetails: result.paymentDetails,
              metadata: {
                type: 'subject_subscription',
                subjectIds: selectedSubjectIds,
                userId: user.id
              }
            })
          });

          if (verifyResponse.ok) {
            setIsProcessingPayment(false);
            setPaymentSuccess({
              show: true,
              type: 'subject',
              details: {
                classId: classData.id.toString(),
                subjectId: selectedSubjectIds.join(','),
                amount: totalAmount,
                subscriptionName: `${subjectNames} - Subject Access`
              }
            });
            // Call onSubscribe immediately to update parent state
            onSubscribe('subject', { classId: classData.id, subjectId: selectedSubjectIds.join(','), amount: totalAmount });
            // Handle redirect after success message is shown (if not disabled)
            if (!disableAutoRedirect) {
              setTimeout(() => {
                router.push(`/dashboard/class/${classData.id}`);
              }, 3500);
            }
          } else {
            setIsProcessingPayment(false);
            throw new Error('Payment verification failed');
          }
        } else {
          // Handle unexpected Cashfree result (no paymentDetails or error)
          handlePaymentError(new Error('Payment completed but no payment details received'), 'Cashfree unexpected result');
        }
      } else {
        // Handle Razorpay payment (default)
        if (!window.Razorpay) {
          throw new Error('Payment system not available. Please refresh the page and try again.');
        }

        // Initialize Razorpay payment
        const razorpay = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Scio Labs',
          description: `${subjectNames} - Subject Access`,
          order_id: orderData.orderId,
          handler: async (paymentResponse: RazorpayResponse) => {
            setIsProcessingPayment(true);
            // Verify payment using unified verification
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: orderData.orderId,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                metadata: {
                  type: 'subject_subscription',
                  subjectIds: selectedSubjectIds,
                  userId: user.id
                }
              })
            });
            if (verifyResponse.ok) {
              setIsProcessingPayment(false);
              setPaymentSuccess({
                show: true,
                type: 'subject',
                details: {
                  classId: classData.id.toString(),
                  subjectId: selectedSubjectIds.join(','),
                  amount: totalAmount,
                  subscriptionName: `${subjectNames} - Subject Access`
                }
              });
              onSubscribe('subject', { classId: classData.id, subjectId: selectedSubjectIds.join(','), amount: totalAmount });
              if (!disableAutoRedirect) {
                setTimeout(() => {
                  router.push(`/dashboard/class/${classData.id}`);
                }, 3500);
              }
            } else {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: user.name || user.email?.split('@')[0] || '',
            email: user.email || ''
          },
          theme: { color: '#8B5CF6' }
        });
        razorpay.open();
      }
    } catch (error) {
      console.error('Subject payment error:', error);
      let context = 'subject subscription';
      if (error instanceof Error) {
        if (error.message.includes('Network error') || error.message.includes('fetch failed')) {
          context = 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          context = 'Request timed out. Please check your connection and try again.';
        } else if (error.message.includes('credentials not configured')) {
          context = 'Payment gateway configuration issue. Please contact support.';
        } else if (error.message.includes('DNS resolution')) {
          context = 'Unable to connect to payment service. Please check your internet connection.';
        } else if (error.message.includes('Invalid Cashfree')) {
          context = 'Payment gateway configuration error. Please contact support.';
        }
      }
      handlePaymentError(error, context);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalTopics = classData.subjects.reduce((acc, subject) => 
    acc + subject.chapters.reduce((chAcc, chapter) => chAcc + chapter.topics.length, 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Subscribe to {classData.name}
          </DialogTitle>
        </DialogHeader>

        {/* Payment Success Message */}
        {paymentSuccess.show && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">Payment Successful!</h3>
                <p className="text-sm text-green-700">
                  Your subscription has been activated successfully.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentSuccess({ show: false, type: 'class' });
                  onClose();
                }}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                ✕
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h4 className="font-medium text-gray-900 mb-2">Subscription Details:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Service:</span> {paymentSuccess.details?.subscriptionName}</p>
                <p><span className="font-medium">Amount:</span> ₹{((paymentSuccess.details?.amount || 0) / 100).toFixed(2)}</p>
                <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Active</span></p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
              <span>Closing this dialog in a few seconds...</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Login Notice for Guest Users */}
        {!user && !paymentSuccess.show && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Login Required</h4>
                <p className="text-sm text-blue-700">
                  Please login to subscribe and access premium content. We&apos;ll bring you back here after login.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main subscription content - hide when showing success message */}
        {!paymentSuccess.show && (
        <>
        <Tabs value={subscriptionType} onValueChange={(value) => setSubscriptionType(value as 'class' | 'subjects')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="class" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Full Class Access
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Individual Subjects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="class" className="space-y-4">
            {hasClassSubscription ? (
              // User already has class subscription
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Class Access Active
                    </span>
                    <Badge className="bg-green-600 text-white">Subscribed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">You have full access!</div>
                    <div className="text-sm text-green-600">Enjoy all subjects in this class</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Access to all {classData.subjects.length} subjects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{totalTopics} interactive topics and exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Unlimited access and progress tracking</span>
                    </div>
                  </div>

                  <Button 
                    onClick={onClose}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // User doesn't have class subscription - show subscription option
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-blue-600" />
                      {isUpgradeScenario ? 'Upgrade to Full Access' : 'Complete Class Access'}
                    </span>
                    <Badge className="bg-blue-600 text-white">
                      {isUpgradeScenario ? 'Upgrade' : 'Best Value'}
                    </Badge>
                  </CardTitle>
                  {isUpgradeScenario && (
                    <div className="text-sm text-blue-600 bg-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>
                          You have {subscribedSubjects.length} of {classData.subjects.length} subjects. 
                          Upgrade to get full access to all subjects!
                        </span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700">₹{classPrice}</div>
                    <div className="text-sm text-blue-600">One-time payment</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Access to all {classData.subjects.length} subjects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{totalTopics} interactive topics and exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Unlimited access and progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Future content updates included</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-2">What you get:</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{classData.subjects.length}</div>
                        <div className="text-xs text-gray-500">Subjects</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{classData.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}</div>
                        <div className="text-xs text-gray-500">Chapters</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{totalTopics}</div>
                        <div className="text-xs text-gray-500">Activities</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleClassSubscribe}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                  >
                    {!user ? (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login to Subscribe - ₹{classPrice}
                      </span>
                    ) : isProcessing ? (
                      'Processing...'
                    ) : isUpgradeScenario ? (
                      `Upgrade to Full Access - ₹${classPrice}`
                    ) : (
                      `Subscribe for ₹${classPrice}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Individual Subjects
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {unsubscribedSubjects.length > 0 
                    ? `Choose from ${unsubscribedSubjects.length} available subjects.`
                    : 'You have access to all subjects in this class!'
                  }
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show current subscriptions if any */}
                {subscribedSubjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Your Current Access ({subscribedSubjects.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subscribedSubjects.map((subject) => {
                        const topicCount = subject.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
                        
                        return (
                          <Card 
                            key={subject.id}
                            className="border-green-200 bg-green-50 opacity-90"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-lg">
                                    {subject.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-green-800">{subject.name}</h4>
                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      {subject.subscriptionType?.replace('_', ' ') || 'active'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-green-700">
                                <BookOpen className="h-4 w-4" />
                                <span>{topicCount} topics available</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show available subjects for subscription */}
                {unsubscribedSubjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Available for Subscription ({unsubscribedSubjects.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {unsubscribedSubjects.map((subject) => {
                        const isSelected = selectedSubjects.has(subject.id);
                        const topicCount = subject.chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
                        
                        return (
                          <Card 
                            key={subject.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected 
                                ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                            onClick={() => handleSubjectToggle(subject.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                                    isSelected ? 'bg-purple-200' : 'bg-gray-100'
                                  }`}>
                                    {subject.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{subject.name}</h4>
                                    <div className="text-xs text-gray-500">{topicCount} activities</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-purple-600">
                                    ₹{(subject.price || 7500) / 100}
                                  </div>
                                  {isSelected && (
                                    <div className="text-xs text-purple-600">Selected</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BookOpen className="h-4 w-4" />
                                <span>Interactive learning content</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Selection summary and subscribe button */}
                    {selectedSubjects.size > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-gray-600">
                              {selectedSubjects.size} subject{selectedSubjects.size > 1 ? 's' : ''} selected
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              ₹{selectedSubjectsPrice}
                            </div>
                          </div>
                          <Button 
                            onClick={handleSubjectSubscribe}
                            disabled={isProcessing || selectedSubjects.size === 0}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {!user ? (
                              <span className="flex items-center gap-2">
                                <LogIn className="h-4 w-4" />
                                Login to Subscribe
                              </span>
                            ) : isProcessing ? (
                              'Processing...'
                            ) : (
                              `Subscribe for ₹${selectedSubjectsPrice}`
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message when all subjects are subscribed */}
                {unsubscribedSubjects.length === 0 && subscribedSubjects.length > 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      You have access to all subjects!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Continue your learning journey with full access to this class.
                    </p>
                    <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                      Continue Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          
          {!user ? (
            <Button onClick={handleLoginRequired} className="bg-green-600 hover:bg-green-700">
              <LogIn className="h-4 w-4 mr-2" />
              Login to Subscribe
            </Button>
          ) : (
            <>
            </>
          )}
        </div>
        </>
        )} {/* Close main content wrapper */}
        
        {/* Processing overlay */}
        {isProcessingPayment && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-gray-600">Please wait while we process your payment and redirect you.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
