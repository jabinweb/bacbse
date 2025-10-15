'use client';

import { useState, useEffect } from 'react';
import { useClassData, type DbClass } from '@/hooks/useClassData';
import { LocalProgressManager } from '@/lib/local-progress';

interface UseClassPageDataResult {
  currentClass: DbClass | null;
  userProgress: Map<string, boolean>;
  markTopicComplete: (topicId: string, completed?: boolean) => Promise<void>;
  subjectAccess: Record<string, boolean>;
  accessType: string;
  accessMessage: string;
  loading: boolean;
  error: string | null;
}

export function useClassPageData(classId: string): UseClassPageDataResult {
  // Use the existing class data hook
  const { currentClass, loading: classDataLoading, error: classDataError } = useClassData(classId);
  
  // Local progress state
  const [userProgress, setUserProgress] = useState<Map<string, boolean>>(new Map());
  const [subjectAccess, setSubjectAccess] = useState<Record<string, boolean>>({});
  const [accessLoading, setAccessLoading] = useState(true);

  const loading = classDataLoading || accessLoading;
  const error = classDataError;

  // Load progress from local storage
  useEffect(() => {
    const loadLocalProgress = () => {
      const localProgress = LocalProgressManager.getProgressMap();
      setUserProgress(localProgress);
    };

    loadLocalProgress();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      const localProgress = LocalProgressManager.getProgressMap();
      setUserProgress(localProgress);
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    return () => window.removeEventListener('progressUpdated', handleProgressUpdate);
  }, []);

  // Grant full access without authentication
  useEffect(() => {
    if (currentClass) {
      const subjectAccessMap: Record<string, boolean> = {};
      currentClass.subjects.forEach((subject) => {
        subjectAccessMap[subject.id] = true; // Grant access to all subjects
      });
      setSubjectAccess(subjectAccessMap);
    }
    setAccessLoading(false);
  }, [currentClass]);

  // Local mark topic complete function
  const markTopicComplete = async (topicId: string, completed: boolean = true) => {
    LocalProgressManager.setTopicProgress(topicId, completed);
    // Update local state immediately
    setUserProgress(prev => {
      const newProgress = new Map(prev);
      newProgress.set(topicId, completed);
      return newProgress;
    });
  };

  return {
    currentClass,
    userProgress,
    markTopicComplete,
    subjectAccess,
    accessType: 'full',
    accessMessage: 'Full Access - No authentication required',
    loading,
    error,
  };
}