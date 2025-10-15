'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useClassPageData } from '@/hooks/useClassPageData';
import type { DbTopic } from '@/hooks/useClassData';
import { ContentPlayer } from '@/components/learning/ContentPlayer';
import { ClassSubscriptionManager } from '@/components/dashboard/ClassSubscriptionManager';

import { ClassPageSkeleton } from '@/components/dashboard/dashboard-class-skeleton';
import { SubjectContent } from '@/components/learning/SubjectContent';
import { 
  getNextTopic, 
  isSubjectCompleted,
  type SubjectProgression 
} from '@/lib/topic-progression';

interface SubjectData {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  chapters: ChapterData[];
}

interface ChapterData {
  id: string;
  name: string;
  orderIndex: number;
  topics: DbTopic[];
}

export default function ClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  // No authentication required
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<DbTopic & { completed: boolean } | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [topicRatings, setTopicRatings] = useState<Record<string, { userRating: number; hasRated: boolean }>>({});
  
  // Use unified hook that handles both class data and access verification
  const { 
    currentClass, 
    userProgress, 
    markTopicComplete, 
    subjectAccess, 
    accessType, 
    accessMessage, 
    loading, 
    error 
  } = useClassPageData(classId);

  // Fetch topic difficulty ratings for the class
  useEffect(() => {
    const fetchTopicRatings = async () => {
      if (!classId) return;

      try {
        const response = await fetch(`/api/user/topic-ratings?classId=${classId}`);
        if (response.ok) {
          const data = await response.json();
          // Convert array to object with topicId as key
          const ratingsMap = data.ratings.reduce((acc: Record<string, { userRating: number; hasRated: boolean }>, rating: { topicId: string; userRating: number; hasRated: boolean }) => {
            acc[rating.topicId] = {
              userRating: rating.userRating,
              hasRated: rating.hasRated
            };
            return acc;
          }, {});
          setTopicRatings(ratingsMap);
        }
      } catch (error) {
        console.error('Error fetching topic ratings:', error);
      }
    };

    fetchTopicRatings();
  }, [classId]);

  useEffect(() => {
    // Auto-select first unlocked subject
    const firstUnlockedSubject = currentClass?.subjects.find(s => !s.isLocked);
    if (firstUnlockedSubject) {
      setSelectedSubject(firstUnlockedSubject.id);
    }
  }, [currentClass]);

  if (loading) {
    return <ClassPageSkeleton />;
  }

  if (error || !currentClass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Class Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleTopicClick = (topic: DbTopic) => {
    // Check if user has access to this subject
    const hasSubjectAccess = subjectAccess[selectedSubject] !== false;
    
    if (!hasSubjectAccess) {
      // Show subscription manager instead of playing content
      setShowSubscriptionManager(true);
      return;
    }

    // Game-based learning: Allow playing any topic/game without sequential restrictions
    // Convert DbTopic to the expected format with proper content structure
    const topicWithCompleted: DbTopic & { completed: boolean } = {
      ...topic,
      completed: userProgress.get(topic.id) || false,
      content: topic.content ? {
        contentType: topic.content.contentType, // Use contentType for the content type
        url: topic.content.url,
        videoUrl: topic.content.videoUrl,
        pdfUrl: topic.content.pdfUrl,
        textContent: topic.content.textContent,
        widgetConfig: topic.content.widgetConfig
      } : undefined
    };
    setSelectedTopic(topicWithCompleted);
    setIsPlayerOpen(true);
  };

  const handleTopicComplete = async () => {
    if (selectedTopic) {
      console.log('Marking topic as complete:', selectedTopic.id, selectedTopic.name);
      await markTopicComplete(selectedTopic.id, true);
      
      // Check if subject is completed using shared utility
      if (selectedSubjectData) {
        const subjectProgress: SubjectProgression = {
          id: selectedSubjectData.id,
          name: selectedSubjectData.name,
          chapters: selectedSubjectData.chapters.map(ch => ({
            id: ch.id,
            name: ch.name,
            topics: ch.topics.map(t => ({
              id: t.id,
              name: t.name,
              completed: userProgress.get(t.id) || false
            }))
          }))
        };

        // Create a Set from userProgress for compatibility with shared functions
        const completedTopicsSet = new Set<string>();
        userProgress.forEach((isCompleted, topicId) => {
          if (isCompleted) completedTopicsSet.add(topicId);
        });
        completedTopicsSet.add(selectedTopic.id); // Add the just completed topic

        if (isSubjectCompleted(subjectProgress, completedTopicsSet)) {
          // Subject completed logic can be added here
          console.log(`Subject ${selectedSubjectData.name} completed!`);
        }
      }
      
      // Don't close the player dialog here for consistency with demo
      // setIsPlayerOpen(false);
      // setSelectedTopic(null);
    }
  };

  const handleTopicIncomplete = async () => {
    if (selectedTopic) {
      console.log('Marking topic as incomplete:', selectedTopic.id, selectedTopic.name);
      await markTopicComplete(selectedTopic.id, false);
    }
  };

  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setSelectedTopic(null);
  };

  const handleNextTopic = () => {
    if (!selectedSubjectData || !selectedTopic) return;
    
    // Create subject progression data for shared utility
    const subjectProgress: SubjectProgression = {
      id: selectedSubjectData.id,
      name: selectedSubjectData.name,
      chapters: selectedSubjectData.chapters.map(ch => ({
        id: ch.id,
        name: ch.name,
        topics: ch.topics.map(t => ({
          id: t.id,
          name: t.name,
          completed: userProgress.get(t.id) || false
        }))
      }))
    };

    const currentTopicForProgression = {
      id: selectedTopic.id,
      name: selectedTopic.name,
      completed: selectedTopic.completed
    };

    // Create a Set from userProgress for compatibility with shared functions
    const completedTopicsSet = new Set<string>();
    userProgress.forEach((completed, topicId) => {
      if (completed) completedTopicsSet.add(topicId);
    });

    // Game-based learning: Always allow moving to next topic without restrictions
    const nextTopic = getNextTopic(currentTopicForProgression, subjectProgress);
    
    if (nextTopic) {
      // Find the full DbTopic object
      const allTopics = selectedSubjectData.chapters.flatMap((ch: ChapterData) => ch.topics);
      const fullNextTopic = allTopics.find((topic: DbTopic) => topic.id === nextTopic.id);
      
      if (fullNextTopic) {
        // Convert to the expected format with completed status
        const nextTopicWithCompleted: DbTopic & { completed: boolean } = {
          ...fullNextTopic,
          completed: userProgress.get(fullNextTopic.id) || false,
          content: fullNextTopic.content ? {
            contentType: fullNextTopic.content.contentType,
            url: fullNextTopic.content.url,
            videoUrl: fullNextTopic.content.videoUrl,
            pdfUrl: fullNextTopic.content.pdfUrl,
            textContent: fullNextTopic.content.textContent,
            widgetConfig: fullNextTopic.content.widgetConfig
          } : undefined
        };
        setSelectedTopic(nextTopicWithCompleted);
      }
    } else {
      // If no next topic, close the player
      handlePlayerClose();
    }
  };

  const getSubjectProgress = (subject: SubjectData) => {
    const allTopics = subject.chapters.flatMap((ch: ChapterData) => ch.topics);
    const completedCount = allTopics.filter((topic: DbTopic) => userProgress.get(topic.id)).length;
    return allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;
  };

  const handleDifficultyRate = async (topicId: string, rating: number) => {
    // No user authentication available - ratings disabled
    return;
    
    /* try {
      // Save the difficulty rating to the backend
      const response = await fetch('/api/user/topic-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          topicId,
          rating,
          classId: parseInt(classId)
        }),
      });

      if (response.ok) {
        console.log(`Difficulty rating saved: Topic ${topicId} rated ${rating} stars`);
        
        // Refresh topic ratings to show updated rating
        const ratingsResponse = await fetch(`/api/user/topic-ratings?classId=${classId}`);
        if (ratingsResponse.ok) {
          const data = await ratingsResponse.json();
          const ratingsMap = data.ratings.reduce((acc: Record<string, { userRating: number; hasRated: boolean }>, ratingData: { topicId: string; userRating: number; hasRated: boolean }) => {
            acc[ratingData.topicId] = {
              userRating: ratingData.userRating,
              hasRated: ratingData.hasRated
            };
            return acc;
          }, {});
          setTopicRatings(ratingsMap);
        }
      } else {
        console.error('Failed to save difficulty rating');
      }
    } catch (error) {
      console.error('Error saving difficulty rating:', error);
    } */
  };

  const selectedSubjectData = currentClass.subjects.find(s => s.id === selectedSubject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{currentClass.name}</h1>
                {accessType === 'school' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    School Access
                  </span>
                )}
                {accessType === 'subscription' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Subscribed
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{currentClass.description}</p>
              {accessMessage && (
                <p className="text-sm text-green-600 mt-1">{accessMessage}</p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentClass.subjects.filter(s => !s.isLocked).length}
                </div>
                <div className="text-xs text-muted-foreground">Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentClass.subjects.reduce((acc, s) => acc + s.chapters.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Chapters</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubscriptionManager(!showSubscriptionManager)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Manage Access
              </Button>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Content</h2>
          <p className="text-gray-600">
            Explore the interactive learning materials and track your progress
          </p>
        </div>

        {/* Subscription Management Panel */}
        {showSubscriptionManager && (
          <div className="mb-6">
            <ClassSubscriptionManager 
              classId={parseInt(classId)}
              onSubscribe={async (type, options) => {
                console.log('Subscription request:', type, options);
                
                try {
                  // Handle different subscription types
                  if (type === 'class' || type === 'upgrade') {
                    // Redirect to class payment page for both full class and upgrade
                    router.push(`/payment/class/${classId}`);
                  } else if (type === 'subject' && options?.subjectId) {
                    // Redirect to subject payment page
                    router.push(`/payment/subject/${options.subjectId}`);
                  } else {
                    // General subscription - could be a modal or redirect
                    router.push('/dashboard/subscriptions');
                  }
                } catch (error) {
                  console.error('Subscription handling error:', error);
                }
              }}
            />
          </div>
        )}

        <SubjectContent
          subjects={currentClass.subjects.map((subject) => {
            const hasSubjectAccess = subjectAccess[subject.id] !== false;
            return {
              id: subject.id,
              name: subject.name,
              icon: subject.icon,
              color: subject.color,
              chapters: subject.chapters.map(chapter => ({
                id: chapter.id,
                name: chapter.name,
                topics: chapter.topics.map(topic => ({
                  ...topic,
                  completed: userProgress.get(topic.id) || false
                })),
                isLocked: !hasSubjectAccess
              })),
              isLocked: subject.isLocked || !hasSubjectAccess
            };
          })}
          selectedSubject={selectedSubject}
          selectedSubjectData={selectedSubjectData ? {
            id: selectedSubjectData.id,
            name: selectedSubjectData.name,
            icon: selectedSubjectData.icon,
            color: selectedSubjectData.color,
            chapters: selectedSubjectData.chapters.map(chapter => ({
              id: chapter.id,
              name: chapter.name,
              topics: chapter.topics.map(topic => ({
                ...topic,
                completed: userProgress.get(topic.id) || false
              })),
              isLocked: !subjectAccess[selectedSubjectData.id]
            })),
            isLocked: selectedSubjectData.isLocked || !subjectAccess[selectedSubjectData.id]
          } : null}
          completedTopics={new Set(
            Array.from(userProgress.entries())
              .filter(([, completed]) => completed)
              .map(([topicId]) => topicId)
          )}
          topicRatings={topicRatings}
          useAccordion={true}
          showUpgradeButton={false}
          onSubjectSelect={(subjectId) => {
            const subject = currentClass.subjects.find(s => s.id === subjectId);
            const hasSubjectAccess = subjectAccess[subjectId] !== false;
            const isAccessible = !subject?.isLocked && hasSubjectAccess;
            if (isAccessible) {
              setSelectedSubject(subjectId);
            }
          }}
          onTopicClick={(topic) => {
            const hasSubjectAccess = selectedSubjectData && (subjectAccess[selectedSubjectData.id] || false);
            if (hasSubjectAccess) {
              // Find the actual DbTopic from the selected subject data
              const dbTopic = selectedSubjectData.chapters
                .flatMap(ch => ch.topics)
                .find(t => t.id === topic.id);
              if (dbTopic) {
                handleTopicClick(dbTopic);
              }
            }
          }}
          onLockedClick={() => {
            console.log(`Topic is locked - subject access required`);
            setShowSubscriptionManager(true);
          }}
          getSubjectProgress={(subjectId) => {
            const subject = currentClass.subjects.find(s => s.id === subjectId);
            return subject ? getSubjectProgress(subject) : 0;
          }}
        />
      </div>

      <ContentPlayer
        topic={selectedTopic}
        isOpen={isPlayerOpen}
        onClose={handlePlayerClose}
        onComplete={handleTopicComplete}
        onIncomplete={handleTopicIncomplete}
        onNext={handleNextTopic}
        onDifficultyRate={handleDifficultyRate}
        isCompleted={selectedTopic ? (userProgress.get(selectedTopic.id) || false) : false}
      />
    </div>
  );
}
