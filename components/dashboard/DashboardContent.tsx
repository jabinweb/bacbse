
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Star, GraduationCap, BookOpen, Users } from "lucide-react";
import { useClassData } from '@/hooks/useClassData';
import { SubscriptionDialog } from '@/components/dashboard/SubscriptionDialog';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { ClassCard } from '@/components/dashboard/ClassCard';
import type { DbClass } from '@/hooks/useClassData';

interface ClassWithSubjects {
  id: number;
  name: string;
  description?: string;
  price?: number;
  accessType?: string;
  schoolAccess?: boolean;
  subscriptionAccess?: boolean;
  subjectAccess?: Record<string, {
    hasAccess: boolean;
    accessType: 'school' | 'class_subscription' | 'subject_subscription' | 'none';
  }>;
  hasPartialAccess?: boolean;
  subjects: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
    price?: number;
    chapters: Array<{
      id: string;
      name: string;
      topics: Array<{
        id: string;
        name: string;
      }>;
    }>;
  }>;
}



export function DashboardContent() {
  const router = useRouter();
  // No authentication required - removed session checks
  const { classes, userProgress, loading, error, accessMessage, accessType, userProfile } = useClassData();
  const [selectedClass, setSelectedClass] = useState<ClassWithSubjects | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // The userProfile is now fetched via useClassData hook from the dashboard API
  // No need for a separate effect here since the data comes from the same API call

  const handleClassClick = (classData: ClassWithSubjects) => {
    // Check if user has any access (school, full subscription, or partial subject access)
    if (classData.accessType === 'school' || classData.schoolAccess || classData.subscriptionAccess || classData.hasPartialAccess) {
      router.push(`/dashboard/class/${classData.id}`);
    } else {
      // Show payment dialog for classes without access
      setSelectedClass(classData);
      setShowPaymentDialog(true);
    }
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setSelectedClass(null);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Classes</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Classes Available</h2>
          <p className="text-muted-foreground">Classes will appear here once they&apos;re added.</p>
        </div>
      </div>
    );
  }

  const calculateClassProgress = (classData: ClassWithSubjects) => {
    if (!classData.subjects || !Array.isArray(classData.subjects)) return 0;
    
    const allTopics = classData.subjects.flatMap((s) => 
      s.chapters?.flatMap((ch) => ch.topics || []) || []
    );
    
    if (allTopics.length === 0) return 0;
    
    const completedCount = allTopics.filter((topic) => userProgress.get(topic.id)).length;
    return Math.round((completedCount / allTopics.length) * 100);
  };

  // Helper to convert DbClass to ClassWithSubjects
  const toClassWithSubjects = (cls: DbClass): ClassWithSubjects => ({
    ...cls,
    price: cls.price,
    accessType: cls.accessType,
    schoolAccess: cls.schoolAccess,
    subscriptionAccess: cls.subscriptionAccess,
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header with School Info */}
        <div className="relative overflow-hidden bg-white border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Welcome to ScioSprints!
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-gray-600">Continue your learning journey</p>
                    {userProfile?.grade && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          Grade {userProfile.grade}
                        </span>
                        {userProfile.school && (
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            userProfile.school.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {userProfile.school.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Access Message */}
            {accessMessage && (
              <div className={`mt-4 p-3 rounded-lg border ${
                accessType === 'school' 
                  ? 'bg-green-50 border-green-200' 
                  : accessType === 'subscription'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-sm font-medium ${
                  accessType === 'school' 
                    ? 'text-green-800' 
                    : accessType === 'subscription'
                    ? 'text-blue-800'
                    : 'text-yellow-800'
                }`}>
                  {accessMessage}
                </p>
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Available Classes</p>
                    <p className="text-3xl font-bold text-gray-100">{classes.length}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Subjects</p>
                    <p className="text-3xl font-bold text-gray-100">{classes.reduce((acc, cls) => acc + (cls.subjects?.length || 0), 0)}</p>
                  </div>
                  <Users className="w-10 h-10 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Avg Progress</p>
                    <p className="text-3xl font-bold text-gray-100">
                      {classes.length > 0 
                        ? Math.round(classes.reduce((acc, cls) => acc + calculateClassProgress(toClassWithSubjects(cls)), 0) / classes.length)
                        : 0}%
                    </p>
                  </div>
                  <Star className="w-10 h-10 text-purple-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Cards Section */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Classes {userProfile?.grade && `(Grade ${userProfile.grade})`}
            </h2>
            <p className="text-gray-600">
              {accessType === 'school' 
                ? 'Access content through your school enrollment and subscriptions'
                : 'Select a class to start or continue learning'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((cls) => {
              const safeCls = toClassWithSubjects(cls);
              const progress = calculateClassProgress(safeCls);

              return (
                <ClassCard
                  key={safeCls.id}
                  variant="dashboard"
                  classData={{
                    id: safeCls.id,
                    name: safeCls.name,
                    description: safeCls.description || '',
                    price: safeCls.price,
                    schoolAccess: cls.schoolAccess,
                    subscriptionAccess: cls.subscriptionAccess,
                    hasPartialAccess: safeCls.hasPartialAccess,
                    subjects: safeCls.subjects
                  }}
                  progress={progress}
                  onClick={() => handleClassClick(safeCls)}
                />
              );
            })}
          </div>

          {/* Empty State for No Access */}
          {classes.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {userProfile?.school ? 
                  (userProfile.school.isActive ? 
                    `No classes available for your grade level. Contact your school administrator.` :
                    'Your school account is currently inactive. Please contact your school.'
                  ) :
                  'You are not assigned to any school. Please contact an administrator.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Dialog - only show for classes without access */}
      {selectedClass && !selectedClass.schoolAccess && !selectedClass.subscriptionAccess && (
        <SubscriptionDialog
          open={showPaymentDialog}
          onClose={handlePaymentDialogClose}
          disableAutoRedirect={true}
          classData={{
            id: selectedClass.id,
            name: selectedClass.name,
            description: selectedClass.description || '',
            price: selectedClass.price || 29900,
            subjects: selectedClass.subjects?.map(subject => ({
              id: subject.id,
              name: subject.name,
              icon: subject.icon || '📚',
              color: subject.color || 'from-blue-500 to-blue-600',
              chapters: subject.chapters || [],
              price: subject.price || 9900,
            })) || []
          }}
          onSubscribe={(type, options) => {
            console.log('Subscription success:', type, options);
            // Close dialog after success message is shown
            setTimeout(() => {
              handlePaymentDialogClose();
            }, 3000);
            
            // Reload the page to refresh access information after dialog closes
            setTimeout(() => {
              window.location.reload();
            }, 3500);
          }}
        />
      )}
    </>
  );
}

