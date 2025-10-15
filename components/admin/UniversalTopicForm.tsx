'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading';

// Simple UUID generator using crypto API
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface UniversalTopicFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TopicFormData) => Promise<void>;
}

interface TopicFormData {
  name: string;
  type: string;
  duration: string;
  orderIndex: number;
  chapterId: string;
  content?: {
    contentType: string;
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
  };
}

export function UniversalTopicForm({ isOpen, onClose, onSubmit }: UniversalTopicFormProps) {
  interface ClassItem {
    id: string;
    name: string;
  }
  
    const [classes, setClasses] = useState<ClassItem[]>([]);
  interface SubjectItem {
    id: string;
    name: string;
  }
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  interface ChapterItem {
    id: string;
    name: string;
  }
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    type: 'VIDEO',
    duration: '',
    orderIndex: 0,
    chapterId: '',
    content: { contentType: 'EXTERNAL_LINK' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const newSubjectInputRef = useRef<HTMLInputElement>(null);
  const newChapterInputRef = useRef<HTMLInputElement>(null);

  // Fetch all classes on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchClasses = async () => {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    };
    fetchClasses();
    setSubjects([]);
    setChapters([]);
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedChapter('');
    setFormData({
      name: '',
      type: 'VIDEO',
      duration: '',
      orderIndex: 0,
      chapterId: '',
      content: { contentType: 'EXTERNAL_LINK' }
    });
  }, [isOpen]);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      const res = await fetch(`/api/admin/subjects?classId=${selectedClass}`);
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    };
    fetchSubjects();
    setChapters([]);
    setSelectedSubject('');
    setSelectedChapter('');
  }, [selectedClass]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchChapters = async () => {
      const res = await fetch(`/api/admin/chapters?subjectId=${selectedSubject}`);
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : []);
    };
    fetchChapters();
    setSelectedChapter('');
  }, [selectedSubject]);

  // Set chapterId in formData when selectedChapter changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, chapterId: selectedChapter }));
  }, [selectedChapter]);

  const handleChange = (field: keyof TopicFormData, value: string | number | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
        contentType: field === 'contentType' ? value as string : prev.content?.contentType ?? 'EXTERNAL_LINK'
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Optionally show error
    } finally {
      setIsLoading(false);
    }
  };

  // Add new subject
  const handleAddSubject = async () => {
    if (!selectedClass || !newSubjectName.trim()) return;
    setAddingSubject(true);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generateId(),
          name: newSubjectName,
          icon: '📚',
          color: 'from-blue-400 to-blue-600',
          isLocked: false,
          orderIndex: subjects.length,
          classId: selectedClass,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects((prev) => [...prev, data]);
        setSelectedSubject(data.id);
        setNewSubjectName('');
        setShowAddSubject(false);
      }
    } finally {
      setAddingSubject(false);
    }
  };

  // Add new chapter
  const handleAddChapter = async () => {
    if (!selectedSubject || !newChapterName.trim()) return;
    setAddingChapter(true);
    try {
      const res = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChapterName,
          orderIndex: chapters.length,
          subjectId: selectedSubject,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChapters((prev) => [...prev, data]);
        setSelectedChapter(data.id);
        setNewChapterName('');
        setShowAddChapter(false);
      }
    } finally {
      setAddingChapter(false);
    }
  };

  // Fix: Only disable the Add Topic button if required fields are missing
  const isAddTopicDisabled =
    !selectedClass ||
    !selectedSubject ||
    !selectedChapter ||
    !formData.name.trim() ||
    !formData.type ||
    !formData.duration.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Topic to Any Chapter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Dropdown */}
          <div>
            <Label>Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg z-50">
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Subject Dropdown with Add option */}
          <div>
            <Label>Subject</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg z-50">
                    {subjects.map((subj) => (
                      <SelectItem key={subj.id} value={subj.id}>
                        {subj.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddSubject(true);
                  setTimeout(() => newSubjectInputRef.current?.focus(), 100);
                }}
                disabled={!selectedClass}
              >
                + Add
              </Button>
            </div>
            {showAddSubject && (
              <div className="flex gap-2 mt-2">
                <Input
                  ref={newSubjectInputRef}
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="New subject name"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                  disabled={addingSubject}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSubject}
                  disabled={addingSubject || !newSubjectName.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowAddSubject(false); setNewSubjectName(''); }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          {/* Chapter Dropdown with Add option */}
          <div>
            <Label>Chapter</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Chapter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-lg z-50">
                    {chapters.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddChapter(true);
                  setTimeout(() => newChapterInputRef.current?.focus(), 100);
                }}
                disabled={!selectedSubject}
              >
                + Add
              </Button>
            </div>
            {showAddChapter && (
              <div className="flex gap-2 mt-2">
                <Input
                  ref={newChapterInputRef}
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="New chapter name"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChapter();
                    }
                  }}
                  disabled={addingChapter}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddChapter}
                  disabled={addingChapter || !newChapterName.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowAddChapter(false); setNewChapterName(''); }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          {/* Topic Fields */}
          <div>
            <Label htmlFor="name">Topic Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Introduction to Variables"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Topic Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="INTERACTIVE">Interactive</SelectItem>
                  <SelectItem value="EXERCISE">Exercise</SelectItem>
                  <SelectItem value="AUDIO">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 15 min"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="orderIndex">Order Index</Label>
            <Input
              id="orderIndex"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => handleChange('orderIndex', parseInt(e.target.value))}
              min="0"
              required
            />
          </div>
          {/* Content Section */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium">Content Details</h4>
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select 
                value={formData.content?.contentType || 'EXTERNAL_LINK'} 
                onValueChange={(value) => handleContentChange('contentType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXTERNAL_LINK">External Link</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="INTERACTIVE_WIDGET">Interactive Widget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.content?.contentType === 'EXTERNAL_LINK' || formData.content?.contentType === 'PDF') && (
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.content?.url || ''}
                  onChange={(e) => handleContentChange('url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            )}
            {formData.content?.contentType === 'VIDEO' && (
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.content?.videoUrl || ''}
                  onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}
            {formData.content?.contentType === 'TEXT' && (
              <div>
                <Label htmlFor="textContent">Text Content</Label>
                <Textarea
                  id="textContent"
                  value={formData.content?.textContent || ''}
                  onChange={(e) => handleContentChange('textContent', e.target.value)}
                  placeholder="Enter the text content..."
                  rows={4}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAddTopicDisabled || isLoading}>
              {isLoading && <LoadingSpinner className="mr-2" />}
              Add Topic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
