// Local storage utility for user progress without authentication
interface TopicProgress {
  completed: boolean;
  completedAt?: string;
  timeSpent?: number;
}

interface LocalProgress {
  [topicId: string]: TopicProgress;
}

const PROGRESS_STORAGE_KEY = 'sciosprints_progress';

export class LocalProgressManager {
  static getProgress(): LocalProgress {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load progress from localStorage:', error);
      return {};
    }
  }

  static setTopicProgress(topicId: string, completed: boolean, timeSpent?: number): void {
    if (typeof window === 'undefined') return;

    try {
      const currentProgress = this.getProgress();
      currentProgress[topicId] = {
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
        timeSpent: timeSpent || currentProgress[topicId]?.timeSpent || 0
      };
      
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(currentProgress));
      console.log('Local progress updated:', topicId, 'completed:', completed);
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('progressUpdated', { 
        detail: { topicId, completed } 
      }));
    } catch (error) {
      console.error('Failed to save progress to localStorage:', error);
    }
  }

  static getTopicProgress(topicId: string): TopicProgress | null {
    const progress = this.getProgress();
    return progress[topicId] || null;
  }

  static isTopicCompleted(topicId: string): boolean {
    const progress = this.getTopicProgress(topicId);
    return progress?.completed || false;
  }

  static getProgressMap(): Map<string, boolean> {
    const progress = this.getProgress();
    const progressMap = new Map<string, boolean>();
    
    Object.entries(progress).forEach(([topicId, data]) => {
      progressMap.set(topicId, data.completed);
    });
    
    return progressMap;
  }

  static clearProgress(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('progressCleared'));
    } catch (error) {
      console.error('Failed to clear progress from localStorage:', error);
    }
  }

  static getCompletedTopicsCount(): number {
    const progress = this.getProgress();
    return Object.values(progress).filter(p => p.completed).length;
  }

  static getTotalTimeSpent(): number {
    const progress = this.getProgress();
    return Object.values(progress).reduce((total, p) => total + (p.timeSpent || 0), 0);
  }
}