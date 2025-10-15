'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Play, ChevronRight, Crown } from "lucide-react";
import { useRouter } from 'next/navigation';

// Helper to get a unique icon for each class
function getClassIcon(className: string) {
  // Support names like 'Class 4', 'CBSE : Class 4', etc.
  // Extract the class number from the string
  const match = className.match(/Class\s*(\d+)/);
  const classNum = match ? match[1] : null;
  switch (classNum) {
    case '4':
      return '🦉';
    case '5':
      return '🦁';
    case '6':
      return '🐯';
    case '7':
      return '🐬';
    case '8':
      return '🦅';
    default:
      return '📚';
  }
}

interface BaseClassData {
  id: number;
  name: string;
  description: string;
  price?: number;
}

interface DashboardClassData extends BaseClassData {
  schoolAccess?: boolean;
  subscriptionAccess?: boolean;
  hasPartialAccess?: boolean;
  subjects?: Array<{
    chapters?: Array<{ id: string; name: string; topics?: Array<{ id: string }> }>;
  }>;
}

interface DemoClassData extends BaseClassData {
  subjectCount: number;
  chapterCount: number;
  subjects: Array<{
    chapters: Array<{
      topics: Array<{
        completed: boolean;
      }>;
    }>;
  }>;
}

interface ClassCardProps {
  variant: 'dashboard' | 'demo';
  classData: DashboardClassData | DemoClassData;
  progress: number;
  onClick: () => void;
  onUpgrade?: (e: React.MouseEvent) => void;
  className?: string;
}

const AccessBadge: React.FC<{ classData: DashboardClassData }> = ({ classData }) => {
  if ('schoolAccess' in classData && classData.schoolAccess) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        School Access
      </div>
    );
  }
  
  if ('subscriptionAccess' in classData && classData.subscriptionAccess) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Full Access
      </div>
    );
  }
  
  if ('hasPartialAccess' in classData && classData.hasPartialAccess) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Partial Access
      </div>
    );
  }
  
  if (classData.price && classData.price > 0) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
        ₹{Math.round(classData.price / 100)}
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
      Free
    </div>
  );
};

const DashboardActionButton: React.FC<{ classData: DashboardClassData }> = ({ classData }) => {
  const getButtonStyles = () => {
    if (('schoolAccess' in classData && classData.schoolAccess) || 
        ('subscriptionAccess' in classData && classData.subscriptionAccess)) {
      return {
        container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 group-hover:from-green-100 group-hover:to-emerald-100',
        icon: 'bg-green-100 group-hover:bg-green-200',
        iconColor: 'text-green-600',
        text: 'text-green-700 group-hover:text-green-800',
        chevron: 'text-green-400 group-hover:text-green-600'
      };
    }
    
    if ('hasPartialAccess' in classData && classData.hasPartialAccess) {
      return {
        container: 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 group-hover:from-purple-100 group-hover:to-violet-100',
        icon: 'bg-purple-100 group-hover:bg-purple-200',
        iconColor: 'text-purple-600',
        text: 'text-purple-700 group-hover:text-purple-800',
        chevron: 'text-purple-400 group-hover:text-purple-600'
      };
    }
    
    return {
      container: 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200',
      icon: 'bg-blue-100 group-hover:bg-blue-200',
      iconColor: 'text-blue-600',
      text: 'text-gray-700 group-hover:text-blue-700',
      chevron: 'text-gray-400 group-hover:text-blue-600'
    };
  };

  const getButtonText = () => {
    if ('schoolAccess' in classData && classData.schoolAccess) return 'Access via School';
    if ('subscriptionAccess' in classData && classData.subscriptionAccess) return 'Full Access';
    if ('hasPartialAccess' in classData && classData.hasPartialAccess) return 'View Subjects';
    if (classData.price && classData.price > 0) return `Subscribe for ₹${Math.round(classData.price / 100)}`;
    return 'Start Learning';
  };

  const styles = getButtonStyles();

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${styles.container}`}>
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg transition-colors ${styles.icon}`}>
          <Play className={`h-3.5 w-3.5 ${styles.iconColor}`} />
        </div>
        <span className={`text-sm font-semibold transition-colors ${styles.text}`}>
          {getButtonText()}
        </span>
      </div>
      <ChevronRight className={`h-4 w-4 transition-all group-hover:translate-x-1 ${styles.chevron}`} />
    </div>
  );
};

const DemoActionButtons: React.FC<{ 
  onDemo: () => void; 
  onUpgrade: (e: React.MouseEvent) => void;
  classData: DashboardClassData | DemoClassData;
}> = ({ onDemo, onUpgrade, classData }) => {
  const router = useRouter();

  const hasAccess = (('schoolAccess' in classData && classData.schoolAccess) || ('subscriptionAccess' in classData && classData.subscriptionAccess));

  // If the demo class is already accessible via school/subscription, show Full Access action
  if (hasAccess) {
    const id = (classData as BaseClassData).id;
    return (
      <div className="pt-2 space-y-2">
        <div
          className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (id !== undefined) router.push(`/dashboard/class/${id}`);
          }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
              <Play className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
              Full Access
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-green-400 hover:text-green-600 transition-all hover:translate-x-1" />
        </div>

        {/* Secondary Try Demo action for consistent UI */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200 transition-all cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onDemo(); }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
              <Play className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
              Try Demo
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-2">
      {/* Try Demo Button */}
      <div 
        className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-blue-50 border-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 group-hover:border-blue-200 transition-all cursor-pointer"
        onClick={onDemo}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
            <Play className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
            Try Demo
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
      </div>
      
      {/* Upgrade Button */}
      <div 
        className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100 hover:from-orange-100 hover:to-yellow-100 hover:border-orange-200 transition-all cursor-pointer"
        onClick={onUpgrade}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors">
            <Crown className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hover:text-orange-700 transition-colors">
            Upgrade
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 hover:text-orange-600 transition-all hover:translate-x-1" />
      </div>
    </div>
  );
};

export const ClassCard: React.FC<ClassCardProps> = ({
  variant,
  classData,
  progress,
  onClick,
  onUpgrade,
  className = ''
}) => {
  const isDashboard = variant === 'dashboard';
  const isDemo = variant === 'demo';

  // Calculate stats based on variant
  const getStats = () => {
    if (isDemo && 'subjectCount' in classData) {
      return {
        subjectCount: classData.subjectCount,
        chapterCount: classData.chapterCount
      };
    }
    
    if (isDashboard && 'subjects' in classData && classData.subjects) {
      return {
        subjectCount: classData.subjects.length,
        chapterCount: classData.subjects.reduce((acc, s) => acc + (s.chapters?.length || 0), 0)
      };
    }
    
    return { subjectCount: 0, chapterCount: 0 };
  };

  const { subjectCount, chapterCount } = getStats();

  const cardClasses = `
    group relative overflow-hidden border-0 shadow-md hover:shadow-2xl 
    transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer
    ${isDashboard ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}
    ${className}
  `;

  const iconSectionClasses = isDashboard 
    ? "w-full h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl"
    : "w-full h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl";

  const iconClasses = isDashboard 
    ? "text-5xl z-10" 
    : "text-5xl z-10";

  const headerPadding = isDashboard ? "relative z-1 pb-4" : "relative z-1 pb-4";
  
  const contentPadding = isDashboard 
    ? "relative z-10 space-y-4" 
    : "relative z-10 space-y-4";

  const titleClasses = isDashboard 
    ? "text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1"
    : "text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1";

  const descriptionClasses = isDashboard
    ? "text-sm text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors"
    : "text-sm text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors";

  const statCardClasses = isDashboard
    ? "flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-gray-100 group-hover:bg-white/80 transition-colors"
    : "flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-gray-100 transition-colors";

  const statIconClasses = isDashboard
    ? "p-1.5 bg-blue-100 rounded-lg"
    : "p-1.5 bg-blue-100 rounded-lg";

  const iconSize = isDashboard ? "h-3.5 w-3.5" : "h-3.5 w-3.5";

  const progressLabel = isDemo ? "Demo Progress" : "Learning Progress";
  const progressBarHeight = isDashboard ? "h-2.5" : "h-2.5";

  return (
    <Card className={cardClasses} onClick={onClick}>
      {/* Access Type Badge - Dashboard only */}
      {isDashboard && (
        <div className="absolute top-4 right-4 z-10">
          <AccessBadge classData={classData as DashboardClassData} />
        </div>
      )}

      <CardHeader className={headerPadding}>
        {/* Icon Section */}
        <div className={`relative ${isDashboard ? 'mb-6' : 'mb-6'}`}>
          <div className={`${iconSectionClasses} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-lg`}>
            <span className={iconClasses}>{getClassIcon(classData.name)}</span>
            
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <div className={`absolute ${isDashboard ? 'top-2 right-2 w-3 h-3' : 'top-2 right-2 w-3 h-3'} bg-white/20 rounded-full animate-pulse`} />
            <div className={`absolute ${isDashboard ? 'bottom-3 left-3 w-2 h-2' : 'bottom-3 left-3 w-2 h-2'} bg-white/30 rounded-full animate-pulse delay-300`} />
            {(isDashboard || isDemo) && (
              <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-700" />
            )}

            {/* Progress indicator */}
            <div className={`absolute ${isDashboard ? 'bottom-2 left-2 right-2' : 'bottom-2 left-2 right-2'}`}>
              <div className={`w-full ${isDashboard ? 'h-1' : 'h-1'} bg-white/20 rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-white/60 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className={`space-y-${isDashboard ? '2' : '2'}`}>
          <CardTitle className={titleClasses}>
            {classData.name}
          </CardTitle>
          <p className={descriptionClasses}>
            {classData.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className={contentPadding}>
        {/* Stats Grid */}
        <div className={`grid grid-cols-2 gap-${isDashboard ? '3' : '3'}`}>
          <div className={statCardClasses}>
            <div className={statIconClasses}>
              <Users className={`${iconSize} text-blue-600`} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Subjects</div>
              <div className="text-sm font-bold text-gray-900">{subjectCount}</div>
            </div>
          </div>
          <div className={statCardClasses}>
            <div className={`${statIconClasses.replace('bg-blue-100', 'bg-purple-100')}`}>
              <Clock className={`${iconSize} text-purple-600`} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Chapters</div>
              <div className="text-sm font-bold text-gray-900">{chapterCount}</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className={`space-y-${isDashboard ? '3' : '3'}`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">{progressLabel}</span>
            <span className="text-xs font-bold text-gray-900">{progress}%</span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full ${progressBarHeight} overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isDashboard && (
          <div className="pt-2">
            <DashboardActionButton classData={classData as DashboardClassData} />
          </div>
        )}

        {isDemo && onUpgrade && (
          <DemoActionButtons 
            onDemo={onClick}
            onUpgrade={onUpgrade}
            classData={classData as DashboardClassData}
          />
        )}
      </CardContent>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
    </Card>
  );
};

export default ClassCard;