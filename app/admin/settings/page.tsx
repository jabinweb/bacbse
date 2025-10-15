'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Globe,
  CreditCard,
  Server,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AppSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  subscriptionPrice: string; // Changed to string to handle form inputs better
  emailNotifications: boolean;
  maintenanceMode: boolean;
  
  // Payment Gateway Selection
  payment_default_gateway: 'RAZORPAY' | 'CASHFREE';
  
  // Razorpay Settings
  payment_razorpay_enabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayTestKeyId: string;
  razorpayTestKeySecret: string;
  razorpayWebhookSecret: string;
  paymentMode: 'test' | 'live';
  
  // Cashfree Settings
  payment_cashfree_enabled: boolean;
  payment_cashfree_app_id: string;
  payment_cashfree_secret_key: string;
  payment_cashfree_test_app_id: string;
  payment_cashfree_test_secret_key: string;
  payment_cashfree_environment: 'SANDBOX' | 'PRODUCTION';
  
  // SMTP Settings
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpFromName: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const authLoading = status === 'loading';
  
  const [settings, setSettings] = useState<AppSettings>({
    siteName: 'ScioLabs',
    siteDescription: 'Interactive Learning Platform',
    siteUrl: '',
    contactEmail: 'contact@sciolabs.in',
    supportEmail: 'support@sciolabs.in',
    subscriptionPrice: '299',
    emailNotifications: true,
    maintenanceMode: false,
    
    // Payment Gateway Selection
    payment_default_gateway: 'RAZORPAY',
    
    // Razorpay Settings
    payment_razorpay_enabled: true,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayTestKeyId: '',
    razorpayTestKeySecret: '',
    razorpayWebhookSecret: '',
    paymentMode: 'test',
    
    // Cashfree Settings
    payment_cashfree_enabled: false,
    payment_cashfree_app_id: '',
    payment_cashfree_secret_key: '',
    payment_cashfree_test_app_id: '',
    payment_cashfree_test_secret_key: '',
    payment_cashfree_environment: 'SANDBOX',
    
    // SMTP Settings
    smtpHost: 'smtp.hostinger.com',
    smtpPort: '587',
    smtpUser: 'info@sciolabs.in',
    smtpPass: '',
    smtpFrom: 'info@sciolabs.in',
    smtpFromName: 'ScioLabs Team',
  });
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    razorpayKeySecret: false,
    razorpayTestKeySecret: false,
    razorpayWebhookSecret: false,
    payment_cashfree_secret_key: false,
    payment_cashfree_test_secret_key: false,
    smtpPass: false,
  });

  // Enhanced admin check
  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin && !dataLoaded) {
      const fetchSettings = async () => {
        try {
          const response = await fetch('/api/admin/settings');
          const data = await response.json();
          
          // Ensure all values are defined and properly typed
          const safeSettings: AppSettings = {
            siteName: data.siteName || 'ScioLabs',
            siteDescription: data.siteDescription || 'Interactive Learning Platform',
            siteUrl: data.siteUrl || '',
            contactEmail: data.contactEmail || 'contact@sciolabs.in',
            supportEmail: data.supportEmail || 'support@sciolabs.in',
            subscriptionPrice: String(data.subscriptionPrice || '299'),
            emailNotifications: Boolean(data.emailNotifications ?? true),
            maintenanceMode: Boolean(data.maintenanceMode ?? false),
            
            // Payment Gateway Selection
            payment_default_gateway: (data.payment_default_gateway as 'RAZORPAY' | 'CASHFREE') || 'RAZORPAY',
            
            // Razorpay Settings
            payment_razorpay_enabled: Boolean(data.payment_razorpay_enabled ?? true),
            razorpayKeyId: data.razorpayKeyId || '',
            razorpayKeySecret: data.razorpayKeySecret || '',
            razorpayTestKeyId: data.razorpayTestKeyId || '',
            razorpayTestKeySecret: data.razorpayTestKeySecret || '',
            razorpayWebhookSecret: data.razorpayWebhookSecret || '',
            paymentMode: (data.paymentMode === 'live' ? 'live' : 'test') as 'test' | 'live',
            
            // Cashfree Settings
            payment_cashfree_enabled: Boolean(data.payment_cashfree_enabled ?? false),
            payment_cashfree_app_id: data.payment_cashfree_app_id || '',
            payment_cashfree_secret_key: data.payment_cashfree_secret_key || '',
            payment_cashfree_test_app_id: data.payment_cashfree_test_app_id || '',
            payment_cashfree_test_secret_key: data.payment_cashfree_test_secret_key || '',
            payment_cashfree_environment: (data.payment_cashfree_environment as 'SANDBOX' | 'PRODUCTION') || 'SANDBOX',
            
            // SMTP Settings
            smtpHost: data.smtpHost || 'smtp.hostinger.com',
            smtpPort: data.smtpPort || '587',
            smtpUser: data.smtpUser || 'info@sciolabs.in',
            smtpPass: data.smtpPass || '',
            smtpFrom: data.smtpFrom || 'info@sciolabs.in',
            smtpFromName: data.smtpFromName || 'ScioLabs Team',
          };
          
          setSettings(safeSettings);
          setDataLoaded(true);
        } catch (error) {
          console.error('Error loading settings:', error);
          setDataLoaded(true);
        }
      };

      fetchSettings();
    }
  }, [isAdmin, isLoadingAuth, dataLoaded, user, userRole]);

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('');
    
    try {
      // Convert subscriptionPrice back to number for API
      const apiSettings = {
        ...settings,
        subscriptionPrice: parseInt(settings.subscriptionPrice) || 299
      };

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiSettings),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveStatus(`Settings saved successfully! (${result.updated || 'All'} settings updated${result.duration ? ' in ' + result.duration : ''})`);
      } else {
        // Handle specific error types
        if (response.status === 408) {
          setSaveStatus('Request timed out. Try saving fewer settings at once or check your connection.');
        } else if (response.status === 400) {
          setSaveStatus(result.error || 'Invalid input values. Please check your settings.');
        } else {
          setSaveStatus(result.error || 'Error saving settings. Please try again.');
        }
      }
      
      setTimeout(() => setSaveStatus(''), 5000); // Increased timeout for longer messages
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // Check for specific error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSaveStatus('Network error. Please check your connection and try again.');
      } else if (error instanceof Error && error.name === 'AbortError') {
        setSaveStatus('Request was cancelled. Please try again.');
      } else {
        setSaveStatus('Unexpected error saving settings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                System Settings
              </h1>
              <p className="text-gray-600 text-lg">Configure your application settings and preferences</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Save Status */}
          {saveStatus && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              saveStatus.includes('success') 
                ? 'bg-green-100 border border-green-200 text-green-800' 
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}>
              {saveStatus.includes('success') ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              {saveStatus}
            </div>
          )}
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm border shadow-lg">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Globe className="h-6 w-6" />
                  General Configuration
                  <Badge className="bg-white/20 text-white border-white/20">Core</Badge>
                </CardTitle>
                <p className="text-green-100 mt-2">Basic site information and branding settings</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-gray-700 font-medium">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionPrice" className="text-gray-700 font-medium">Subscription Price (₹)</Label>
                    <Input
                      id="subscriptionPrice"
                      type="number"
                      value={settings.subscriptionPrice}
                      onChange={(e) => handleInputChange('subscriptionPrice', e.target.value)}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl" className="text-gray-700 font-medium">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                    placeholder="https://your-domain.com"
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                  />
                  <p className="text-sm text-gray-500">
                    This URL is used for payment callbacks and email links. Must include protocol (http/https).
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-gray-700 font-medium">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-gray-700 font-medium">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail" className="text-gray-700 font-medium">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            {/* Payment Gateway Selection */}
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CreditCard className="h-6 w-6" />
                  Payment Gateway Configuration
                </CardTitle>
                <p className="text-purple-100 mt-2">Choose and configure your payment gateway</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Default Gateway Selection */}
                {/* <div className="border-l-4 border-purple-500 pl-6">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Payment Gateway</h3>
                    <RadioGroup 
                      value={settings.payment_default_gateway} 
                      onValueChange={(value: 'RAZORPAY' | 'CASHFREE') => handleInputChange('payment_default_gateway', value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="RAZORPAY" id="razorpay-default" />
                        <Label htmlFor="razorpay-default" className="text-gray-700">Razorpay</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CASHFREE" id="cashfree-default" />
                        <Label htmlFor="cashfree-default" className="text-gray-700">Cashfree</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div> */}

                {/* Important Notice */}
                {/* <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">Single Gateway Policy</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Only one payment gateway can be active at a time. This ensures compatibility with existing frontend components and provides a consistent payment experience.
                      </p>
                    </div>
                  </div>
                </div> */}

                {/* Gateway Selection */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Active Payment Gateway</h4>
                    <p className="text-sm text-gray-600 mb-4">Select which payment gateway to use (only one can be active at a time)</p>
                    <RadioGroup 
                      value={settings.payment_default_gateway} 
                      onValueChange={(value: 'RAZORPAY' | 'CASHFREE') => {
                        // When changing gateway, update the default and enable/disable accordingly
                        handleInputChange('payment_default_gateway', value);
                        if (value === 'RAZORPAY') {
                          handleInputChange('payment_razorpay_enabled', true);
                          handleInputChange('payment_cashfree_enabled', false);
                        } else {
                          handleInputChange('payment_razorpay_enabled', false);
                          handleInputChange('payment_cashfree_enabled', true);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <RadioGroupItem value="RAZORPAY" id="razorpay-active" />
                        <Label htmlFor="razorpay-active" className="flex-1">
                          <div>
                            <h5 className="font-medium text-gray-900">Razorpay</h5>
                            <p className="text-sm text-gray-600">Popular payment gateway with extensive India coverage</p>
                          </div>
                        </Label>
                        {settings.payment_default_gateway === 'RAZORPAY' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <RadioGroupItem value="CASHFREE" id="cashfree-active" />
                        <Label htmlFor="cashfree-active" className="flex-1">
                          <div>
                            <h5 className="font-medium text-gray-900">Cashfree</h5>
                            <p className="text-sm text-gray-600">Modern payment gateway with competitive rates</p>
                          </div>
                        </Label>
                        {settings.payment_default_gateway === 'CASHFREE' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Razorpay Configuration */}
            {settings.payment_default_gateway === 'RAZORPAY' && (
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <CreditCard className="h-6 w-6" />
                    Razorpay Configuration
                    <Badge className="bg-white/20 text-white border-white/20">Razorpay</Badge>
                  </CardTitle>
                  <p className="text-orange-100 mt-2">Configure Razorpay payment gateway settings</p>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Payment Mode Selection */}
                  <div className="border-l-4 border-orange-500 pl-6">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Mode</h3>
                      <RadioGroup 
                        value={settings.paymentMode} 
                        onValueChange={(value: 'test' | 'live') => handleInputChange('paymentMode', value)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="test" id="test" />
                          <Label htmlFor="test" className="text-gray-700">Test Mode</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="live" id="live" />
                          <Label htmlFor="live" className="text-gray-700">Live Mode</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                    {/* Test Keys */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-4">
                      Test Environment Keys
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="razorpayTestKeyId" className="text-gray-700 font-medium">Test Key ID</Label>
                        <Input
                          id="razorpayTestKeyId"
                          value={settings.razorpayTestKeyId}
                          onChange={(e) => handleInputChange('razorpayTestKeyId', e.target.value)}
                          className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm"
                          placeholder="rzp_test_..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="razorpayTestKeySecret" className="text-gray-700 font-medium">Test Key Secret</Label>
                        <div className="relative">
                          <Input
                            id="razorpayTestKeySecret"
                            type={showPasswords.razorpayTestKeySecret ? "text" : "password"}
                            value={settings.razorpayTestKeySecret}
                            onChange={(e) => handleInputChange('razorpayTestKeySecret', e.target.value)}
                            className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm pr-10"
                            placeholder="Enter test key secret"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('razorpayTestKeySecret')}
                          >
                            {showPasswords.razorpayTestKeySecret ? 
                              <EyeOff className="h-4 w-4 text-gray-500" /> : 
                              <Eye className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Keys */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
                      Live Environment Keys
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="razorpayKeyId" className="text-gray-700 font-medium">Live Key ID</Label>
                        <Input
                          id="razorpayKeyId"
                          value={settings.razorpayKeyId}
                          onChange={(e) => handleInputChange('razorpayKeyId', e.target.value)}
                          className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm"
                          placeholder="rzp_live_..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="razorpayKeySecret" className="text-gray-700 font-medium">Live Key Secret</Label>
                        <div className="relative">
                          <Input
                            id="razorpayKeySecret"
                            type={showPasswords.razorpayKeySecret ? "text" : "password"}
                            value={settings.razorpayKeySecret}
                            onChange={(e) => handleInputChange('razorpayKeySecret', e.target.value)}
                            className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm pr-10"
                            placeholder="Enter live key secret"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('razorpayKeySecret')}
                          >
                            {showPasswords.razorpayKeySecret ? 
                              <EyeOff className="h-4 w-4 text-gray-500" /> : 
                              <Eye className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Webhook Configuration */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-purple-500 pl-4">
                      Webhook Configuration
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="razorpayWebhookSecret" className="text-gray-700 font-medium">Webhook Secret</Label>
                        <div className="relative">
                          <Input
                            id="razorpayWebhookSecret"
                            type={showPasswords.razorpayWebhookSecret ? "text" : "password"}
                            value={settings.razorpayWebhookSecret}
                            onChange={(e) => handleInputChange('razorpayWebhookSecret', e.target.value)}
                            className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm pr-10"
                            placeholder="Enter webhook secret key"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('razorpayWebhookSecret')}
                          >
                            {showPasswords.razorpayWebhookSecret ? 
                              <EyeOff className="h-4 w-4 text-gray-500" /> : 
                              <Eye className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Used to verify webhook signatures from Razorpay. Get this from your Razorpay Dashboard → Settings → Webhooks.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Configuration Tips */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2">Configuration Guide</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Always use test mode during development</li>
                          <li>• Keep your API keys secure and never share them</li>
                          <li>• Switch to live mode only when ready for production</li>
                          <li>• Configure webhook URL: <code className="bg-blue-100 px-1 rounded text-xs">{window?.location?.origin || 'https://your-domain.com'}/api/payment/webhook/razorpay</code></li>
                          <li>• Enable webhook events: <strong>payment.captured</strong> and <strong>payment.failed</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cashfree Configuration */}
            {settings.payment_default_gateway === 'CASHFREE' && (
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <CreditCard className="h-6 w-6" />
                    Cashfree Configuration
                    <Badge className="bg-white/20 text-white border-white/20">Cashfree</Badge>
                  </CardTitle>
                  <p className="text-blue-100 mt-2">Configure Cashfree payment gateway settings</p>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Environment Selection */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment</h3>
                      <RadioGroup 
                        value={settings.payment_cashfree_environment} 
                        onValueChange={(value: 'SANDBOX' | 'PRODUCTION') => handleInputChange('payment_cashfree_environment', value)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SANDBOX" id="sandbox" />
                          <Label htmlFor="sandbox" className="text-gray-700">Sandbox</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PRODUCTION" id="production" />
                          <Label htmlFor="production" className="text-gray-700">Production</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Test Keys */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-green-500 pl-4">
                      Sandbox Environment Keys
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="payment_cashfree_test_app_id" className="text-gray-700 font-medium">Sandbox App ID</Label>
                        <Input
                          id="payment_cashfree_test_app_id"
                          value={settings.payment_cashfree_test_app_id}
                          onChange={(e) => handleInputChange('payment_cashfree_test_app_id', e.target.value)}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
                          placeholder="Enter sandbox app ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment_cashfree_test_secret_key" className="text-gray-700 font-medium">Sandbox Secret Key</Label>
                        <div className="relative">
                          <Input
                            id="payment_cashfree_test_secret_key"
                            type={showPasswords.payment_cashfree_test_secret_key ? "text" : "password"}
                            value={settings.payment_cashfree_test_secret_key}
                            onChange={(e) => handleInputChange('payment_cashfree_test_secret_key', e.target.value)}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm pr-10"
                            placeholder="Enter sandbox secret key"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('payment_cashfree_test_secret_key')}
                          >
                            {showPasswords.payment_cashfree_test_secret_key ? 
                              <EyeOff className="h-4 w-4 text-gray-500" /> : 
                              <Eye className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Production Keys */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
                      Production Environment Keys
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="payment_cashfree_app_id" className="text-gray-700 font-medium">Production App ID</Label>
                        <Input
                          id="payment_cashfree_app_id"
                          value={settings.payment_cashfree_app_id}
                          onChange={(e) => handleInputChange('payment_cashfree_app_id', e.target.value)}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
                          placeholder="Enter production app ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment_cashfree_secret_key" className="text-gray-700 font-medium">Production Secret Key</Label>
                        <div className="relative">
                          <Input
                            id="payment_cashfree_secret_key"
                            type={showPasswords.payment_cashfree_secret_key ? "text" : "password"}
                            value={settings.payment_cashfree_secret_key}
                            onChange={(e) => handleInputChange('payment_cashfree_secret_key', e.target.value)}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm pr-10"
                            placeholder="Enter production secret key"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('payment_cashfree_secret_key')}
                          >
                            {showPasswords.payment_cashfree_secret_key ? 
                              <EyeOff className="h-4 w-4 text-gray-500" /> : 
                              <Eye className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cashfree Configuration Tips */}
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-cyan-800 mb-2">Cashfree Setup Tips</h4>
                        <ul className="text-sm text-cyan-700 space-y-1">
                          <li>• Use Sandbox environment for testing</li>
                          <li>• Get your credentials from Cashfree Merchant Dashboard</li>
                          <li>• Switch to Production only after thorough testing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Mail className="h-6 w-6" />
                  Email Configuration
                  <Badge className="bg-white/20 text-white border-white/20">SMTP</Badge>
                </CardTitle>
                <p className="text-purple-100 mt-2">Configure email notifications and SMTP settings</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Email Toggle */}
                <div className="border-l-4 border-purple-500 pl-6">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Send automated emails for subscriptions, payments, and updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                </div>

                {/* SMTP Configuration */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-indigo-500 pl-4">
                    SMTP Server Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost" className="text-gray-700 font-medium">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        placeholder="smtp.hostinger.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort" className="text-gray-700 font-medium">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        value={settings.smtpPort}
                        onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser" className="text-gray-700 font-medium">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={settings.smtpUser}
                        onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        placeholder="info@sciolabs.in"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPass" className="text-gray-700 font-medium">SMTP Password</Label>
                      <div className="relative">
                        <Input
                          id="smtpPass"
                          type={showPasswords.smtpPass ? "text" : "password"}
                          value={settings.smtpPass}
                          onChange={(e) => handleInputChange('smtpPass', e.target.value)}
                          className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm pr-10"
                          placeholder="Your SMTP password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('smtpPass')}
                        >
                          {showPasswords.smtpPass ? 
                            <EyeOff className="h-4 w-4 text-gray-500" /> : 
                            <Eye className="h-4 w-4 text-gray-500" />
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpFrom" className="text-gray-700 font-medium">From Email Address</Label>
                      <Input
                        id="smtpFrom"
                        type="email"
                        value={settings.smtpFrom}
                        onChange={(e) => handleInputChange('smtpFrom', e.target.value)}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        placeholder="noreply@yourdomain.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpFromName" className="text-gray-700 font-medium">From Name</Label>
                      <Input
                        id="smtpFromName"
                        value={settings.smtpFromName}
                        onChange={(e) => handleInputChange('smtpFromName', e.target.value)}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white shadow-sm"
                        placeholder="Your Company Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Configuration Tips */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Email Setup Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Hostinger: Use smtp.hostinger.com with port 587</li>
                        <li>• Gmail: Use smtp.gmail.com with port 587 and app password</li>
                        <li>• Outlook: Use smtp-mail.outlook.com with port 587</li>
                        <li>• Make sure to use the same email in both username and from fields</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Server className="h-6 w-6" />
                  System Settings
                  <Badge className="bg-white/20 text-white border-white/20">Advanced</Badge>
                </CardTitle>
                <p className="text-gray-200 mt-2">System-wide configuration and maintenance options</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Maintenance Mode */}
                <div className="border-l-4 border-gray-500 pl-6">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Temporarily disable public access to show maintenance page
                        </p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                        className="data-[state=checked]:bg-gray-600"
                      />
                    </div>
                    {settings.maintenanceMode && (
                      <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Warning: Maintenance mode is active</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Users will see a maintenance page and cannot access the application
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}