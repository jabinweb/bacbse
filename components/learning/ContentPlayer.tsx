'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play, FileText, Monitor, Star } from 'lucide-react';
import { type DbTopic } from '@/hooks/useClassData';

interface TopicContent {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: object;
}

interface ContentPlayerProps {
  topic: DbTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onIncomplete?: () => void; // New prop for marking as incomplete
  onNext?: () => void;
  isCompleted?: boolean;
  onDifficultyRate?: (topicId: string, rating: number) => void;
  isDemo?: boolean; // Flag to indicate this is demo mode
  demoContent?: TopicContent; // Pre-loaded demo content
  isDemoLimitReached?: boolean; // Flag to indicate demo user has reached access limit
}

export function ContentPlayer({ 
  topic, 
  isOpen, 
  onClose, 
  onComplete, 
  onIncomplete, // New prop
  onNext, 
  isCompleted = false, 
  onDifficultyRate,
  isDemo = false,
  demoContent,
  isDemoLimitReached = false
}: ContentPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Fetch content from secure endpoint when topic opens
  useEffect(() => {
    if (topic?.id && isOpen) {
     
      // Otherwise fetch from API (for dashboard/authenticated users)
      setContentLoading(true);
      fetch(`/api/content/topic/${topic.id}`)
        .then(async response => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Failed to fetch content: ${response.status} - ${errorData.error || response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('ContentPlayer: Fetched content from API:', data.content);
          setTopicContent(data.content);
          setContentLoading(false);
        })
        .catch(error => {
          console.error('Error fetching topic content:', error);
          setContentLoading(false);
        });
    }
  }, [topic?.id, isOpen, isDemo, demoContent]);

  // Reset content when topic changes (but not in demo mode where content is passed directly)
  useEffect(() => {
    if (!isDemo) {
      setTopicContent(null);
    }
  }, [topic?.id, isDemo]);

  // Only reset state when topic actually changes (by ID), not when completion status changes
  useEffect(() => {
    setHasCompleted(isCompleted);
    setShowRating(false);
    setDifficultyRating(0);
    setHasRated(isCompleted); // If already completed, mark as rated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id]); // Intentionally only depend on topic ID to avoid resetting on completion changes

  // Handle fullscreen mode on mobile to hide browser address bar
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isOpen && isMobile) {
      // Request fullscreen on mobile devices
      const enterFullscreen = async () => {
        try {
          const docElement = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
          };
          
          if (docElement.requestFullscreen) {
            await docElement.requestFullscreen();
          } else if (docElement.webkitRequestFullscreen) {
            await docElement.webkitRequestFullscreen();
          } else if (docElement.msRequestFullscreen) {
            await docElement.msRequestFullscreen();
          }
        } catch (error) {
          console.log('Fullscreen request failed:', error);
        }
      };

      // Small delay to ensure dialog is rendered
      const timer = setTimeout(enterFullscreen, 300);
      
      return () => {
        clearTimeout(timer);
        // Exit fullscreen when dialog closes
        const doc = document as Document & {
          webkitFullscreenElement?: Element;
          msFullscreenElement?: Element;
          webkitExitFullscreen?: () => void;
          msExitFullscreen?: () => void;
        };
        
        if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement) {
          if (doc.exitFullscreen) {
            doc.exitFullscreen().catch(() => {});
          } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
          } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
          }
        }
      };
    }
  }, [isOpen]);

  if (!topic) return null;

  const handleComplete = () => {
    if (!hasCompleted && !isCompleted) {
      console.log('Completing topic:', topic?.name);
      setHasCompleted(true);
      onComplete();
      // Show rating dialog after completion, but only if not already rated
      if (!hasRated) {
        console.log('Showing rating dialog...');
        // Use setTimeout to ensure the completion state is set first
        setTimeout(() => {
          setShowRating(true);
          console.log('Rating dialog should be visible now');
        }, 100);
      }
    }
  };

  const handleIncomplete = () => {
    if ((hasCompleted || isCompleted) && onIncomplete) {
      console.log('Marking topic as incomplete:', topic?.name);
      setHasCompleted(false);
      onIncomplete();
    }
  };

  const handleDifficultyRate = (rating: number) => {
    console.log('Rating selected:', rating);
    setDifficultyRating(rating);
    setHasRated(true);
    setShowRating(false);
    
    // Call the optional callback to save rating
    if (onDifficultyRate && topic) {
      onDifficultyRate(topic.id, rating);
    }
  };

  const handleContentAction = () => {
    if (!topicContent) return;
    
    setIsLoading(true);
    
    switch (topicContent.contentType?.toLowerCase()) {
      case 'external_link':
        if (topicContent.url) {
          window.open(topicContent.url, '_blank');
        }
        break;
      case 'video':
        // For video content, we'll embed it in the player instead of opening in new tab
        console.log('Video will be embedded in player');
        break;
      case 'pdf':
        // Handle PDF viewing
        if (topicContent.pdfUrl) {
          window.open(topicContent.pdfUrl, '_blank');
        }
        break;
      case 'text':
        // Text content is displayed inline
        break;
      case 'interactive_widget':
        // Handle interactive widget
        console.log('Loading widget:', topicContent.widgetConfig);
        break;
      case 'iframe':
        // Iframe content is displayed inline
        console.log('Iframe content displayed inline');
        break;
      default:
        console.warn('Unknown content type:', topicContent.contentType);
        break;
    }
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getContentIcon = () => {
    if (!topicContent) return <Play className="h-5 w-5" />;
    
    const contentType = topicContent.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link': return <ExternalLink className="h-5 w-5" />;
      case 'video': return <Play className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'text': return <FileText className="h-5 w-5" />;
      case 'interactive_widget': return <Monitor className="h-5 w-5" />;
      case 'iframe': return <Monitor className="h-5 w-5" />;
      default: return <Play className="h-5 w-5" />;
    }
  };

  const getActionText = () => {
    if (!topicContent) return 'Start Learning';
    
    const contentType = topicContent.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link': return 'Open Link';
      case 'video': return 'Play Video';
      case 'pdf': return 'View PDF';
      case 'text': return 'Read Content';
      case 'interactive_widget': return 'Start Activity';
      case 'iframe': return 'Start Activity';
      default: return 'Start Learning';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 flex flex-col bg-gray-900 gap-0 text-white border-gray-800 [&>button]:hidden">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">{topic.name}</DialogTitle>
        
        {/* Header with better mobile visibility */}
        <div className="flex-shrink-0 px-3 sm:px-4 py-3 sm:py-2 border-b border-gray-800 bg-gray-900 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-white text-sm sm:text-sm min-w-0 flex-1">
            {getContentIcon()}
            <span className="truncate font-medium">{topic.name}</span>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {/* Complete/Incomplete Toggle Button */}
            {(hasCompleted || isCompleted) && onIncomplete ? (
              <Button 
                onClick={handleIncomplete} 
                size="sm" 
                className="gap-1 text-white text-xs sm:text-sm px-3 py-2 bg-orange-600 hover:bg-orange-700"
              >
                <span className="hidden sm:inline">Mark Incomplete</span>
                <span className="sm:hidden">↺</span>
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                size="sm" 
                disabled={hasCompleted || isCompleted}
                className={`gap-1 text-white text-xs sm:text-sm px-3 py-2 ${
                  hasCompleted || isCompleted 
                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <span className="hidden sm:inline">{hasCompleted || isCompleted ? 'Completed' : 'Complete'}</span>
                <span className="sm:hidden">✓</span>
              </Button>
            )}
            {onNext && (
              <Button 
                onClick={onNext} 
                size="sm" 
                disabled={false} // Always enabled for game-based learning
                className={`gap-1 text-white text-xs sm:text-sm px-3 py-2 ${
                  isDemo && isDemoLimitReached 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={isDemo && isDemoLimitReached ? "Upgrade to access more content" : "Play the next game/topic"}
              >
                <span className="hidden sm:inline">
                  {isDemo && isDemoLimitReached ? 'Upgrade to Continue' : 'Play Next'}
                </span>
                <span className="sm:hidden">
                  {isDemo && isDemoLimitReached ? '⬆' : '→'}
                </span>
              </Button>
            )}
            <Button variant="outline" onClick={onClose} size="sm" className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white text-xs sm:text-sm px-3 py-2">
              <span className="hidden sm:inline">Close</span>
              <span className="sm:hidden">×</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          {/* Content Display Area - Maximum space */}
          <div className="h-full bg-gray-900 overflow-hidden flex items-center justify-center">
            {(() => {
              console.log('ContentPlayer: Current state:', {
                isOpen,
                isDemo,
                hasTopicContent: !!topicContent,
                topicContentType: topicContent?.contentType,
                hasIframeHtml: !!topicContent?.iframeHtml,
                contentLoading,
                topicName: topic?.name
              });
              return null;
            })()}
            {contentLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4 p-4 bg-gray-800 rounded-full animate-pulse">
                  <Play className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">Loading Content...</h3>
                <p className="text-gray-400">Please wait while we fetch the content.</p>
              </div>
            ) : topicContent?.contentType?.toLowerCase() === 'text' && topicContent.textContent ? (
              <div className="prose prose-invert max-w-4xl h-full overflow-auto p-4">
                <p className="text-gray-200">{topicContent.textContent}</p>
              </div>
            ) : topicContent?.contentType?.toLowerCase() === 'video' && topicContent.videoUrl ? (
              <div className="w-full h-full max-w-full bg-black overflow-hidden flex items-center justify-center">
                {/* Handle different video URL formats */}
                {topicContent.videoUrl.includes('youtube.com') || topicContent.videoUrl.includes('youtu.be') ? (
                  <iframe 
                    src={topicContent.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={topic.name}
                  />
                ) : topicContent.videoUrl.includes('vimeo.com') ? (
                  <iframe 
                    src={topicContent.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={topic.name}
                  />
                ) : (
                  <video 
                    controls
                    className="w-full h-full object-contain"
                    title={topic.name}
                  >
                    <source src={topicContent.videoUrl} type="video/mp4" />
                    <source src={topicContent.videoUrl} type="video/webm" />
                    <source src={topicContent.videoUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : topicContent?.contentType?.toLowerCase() === 'pdf' && topicContent.pdfUrl ? (
              <div className="w-full h-full bg-white overflow-hidden">
                <iframe 
                  src={topicContent.pdfUrl}
                  className="w-full h-full"
                  title="PDF Viewer"
                />
              </div>
            ) : topicContent?.contentType?.toLowerCase() === 'interactive_widget' ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4 p-4 bg-gray-800 rounded-full">
                  <Monitor className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">Interactive Widget</h3>
                <p className="text-gray-400 mb-4">
                  This content will load an interactive learning experience.
                </p>
                {topicContent?.widgetConfig && (
                  <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded max-w-md overflow-auto">
                    {JSON.stringify(topicContent.widgetConfig, null, 2)}
                  </pre>
                )}
              </div>
            ) : (topicContent?.contentType?.toLowerCase() === 'iframe' || topicContent?.contentType === 'IFRAME') && topicContent.iframeHtml ? (
              <div className="w-full h-full bg-gray-900 overflow-hidden">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: topicContent.iframeHtml
                      // Responsive iframe dimension overrides that respect the available space
                      .replace(/width\s*=\s*["']\d+["']/gi, 'width="100%"')
                      .replace(/height\s*=\s*["']\d+["']/gi, 'height="100%"')
                      .replace(/frameborder\s*=\s*["']\d+["']/gi, 'frameborder="0"')
                      .replace(/style\s*=\s*["'][^"']*["']/gi, '')
                      .replace(/<iframe/gi, '<iframe style="width: 100%; height: 100%; border: none;"')
                  }}
                  className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <div className="mb-4 p-3 sm:p-4 bg-gray-800 rounded-full">
                  {getContentIcon()}
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2 text-white">{topic?.name}</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4">
                  Duration: {topic?.duration} • Type: {topicContent?.contentType || 'content'}
                </p>
                <Button 
                  onClick={handleContentAction}
                  disabled={isLoading || contentLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-sm sm:text-base px-4 py-2"
                >
                  {getContentIcon()}
                  {contentLoading ? 'Loading...' : getActionText()}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Rating Overlay */}
        {showRating && !hasRated && (
          <div 
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()} // Prevent accidental closing
          >
            <div 
              className="bg-white rounded-2xl p-4 sm:p-8 max-w-sm sm:max-w-md mx-4 w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent event bubbling
            >
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">How was this topic?</h3>
                <p className="text-sm sm:text-base text-gray-600">Rate the difficulty level for your personal tracking</p>
              </div>
              
              <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleDifficultyRate(rating)}
                    className="group transition-all duration-200 hover:scale-110 p-1"
                    title={`${rating} star${rating > 1 ? 's' : ''} - ${
                      rating === 1 ? 'Very Easy' :
                      rating === 2 ? 'Easy' :
                      rating === 3 ? 'Medium' :
                      rating === 4 ? 'Hard' : 'Very Hard'
                    }`}
                  >
                    <Star 
                      className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors duration-200 ${
                        difficultyRating >= rating 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              
              <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs">
                  <span>Very Easy</span>
                  <span>Very Hard</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowRating(false)}
                variant="outline"
                className="w-full sm:w-auto px-6 py-2 text-sm"
              >
                Skip
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
