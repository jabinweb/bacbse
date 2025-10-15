'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TopicContentData {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: Record<string, unknown>;
}

interface TopicFormData {
  id?: string;
  name: string;
  type: string;
  duration: string;
  description?: string;
  difficulty: string;
  orderIndex: number;
  chapterId: string;
  content?: TopicContentData;
}

interface TopicFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TopicFormData) => Promise<void>;
  initialData?: TopicFormData;
  mode: 'create' | 'edit';
  chapterId: string;
}

export function TopicForm({ isOpen, onClose, onSubmit, initialData, mode, chapterId }: TopicFormProps) {
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    type: 'video',
    duration: '',
    description: '',
    difficulty: 'BEGINNER',
    orderIndex: 0,
    chapterId,
    content: {
      contentType: 'external_link',
      url: '',
      videoUrl: '',
      pdfUrl: '',
      textContent: '',
      iframeHtml: '',
    }
  });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    console.log('TopicForm useEffect triggered:', { isOpen, initialData });
    
    if (isOpen && initialData) {
      console.log('Initializing form with data:', initialData);
      
      // Parse content if it's a string
      let parsedContent = initialData.content;
      if (typeof initialData.content === 'string') {
        try {
          parsedContent = JSON.parse(initialData.content);
          console.log('Parsed content from string:', parsedContent);
        } catch (error) {
          console.error('Failed to parse content:', error);
          parsedContent = {
            contentType: 'external_link',
            url: '',
            videoUrl: '',
            pdfUrl: '',
            textContent: '',
          };
        }
      }

      // Ensure all content fields are properly set
      const contentData = {
        contentType: parsedContent?.contentType || 'external_link',
        url: parsedContent?.url || '',
        videoUrl: parsedContent?.videoUrl || '',
        pdfUrl: parsedContent?.pdfUrl || '',
        textContent: parsedContent?.textContent || '',
        iframeHtml: parsedContent?.iframeHtml || '',
        widgetConfig: parsedContent?.widgetConfig || undefined,
      };

      console.log('Setting form data:', {
        ...initialData,
        content: contentData
      });

      setFormData({
        ...initialData,
        content: contentData
      });
    } else if (isOpen && !initialData) {
      console.log('Resetting form for new topic');
      setFormData({
        name: '',
        type: 'video',
        duration: '',
        description: '',
        difficulty: 'BEGINNER',
        orderIndex: 0,
        chapterId,
        content: {
          contentType: 'external_link',
          url: '',
          videoUrl: '',
          pdfUrl: '',
          textContent: '',
          iframeHtml: '',
        }
      });
    }
  }, [isOpen, initialData, chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for iframe content
    if (formData.content?.contentType === 'iframe') {
      const iframeContent = formData.content?.iframeHtml || '';
      if (iframeContent && !iframeContent.includes('<iframe')) {
        alert('Please enter valid iframe HTML code starting with <iframe');
        return;
      }
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof TopicFormData, value: string | number | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateContentData = (field: keyof TopicContentData, value: string | number | object) => {
    setFormData(prev => ({
      ...prev,
      content: { 
        ...prev.content,
        contentType: prev.content?.contentType || 'external_link', // Ensure contentType is always defined
        [field]: value 
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Topic' : 'Create New Topic'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Topic Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty} onValueChange={(value) => updateFormData('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (Optional)</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => updateFormData('duration', e.target.value)}
                placeholder="e.g., 15 min"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Short Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Brief description of what this topic covers..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="orderIndex">Order Index</Label>
              <Input
                id="orderIndex"
                type="number"
                value={formData.orderIndex}
                onChange={(e) => updateFormData('orderIndex', parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select 
              value={formData.content?.contentType || 'external_link'} 
              onValueChange={(value) => updateContentData('contentType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external_link">External Link</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="interactive_widget">Interactive Widget</SelectItem>
                <SelectItem value="iframe">IFrame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Content Fields */}
          {formData.content?.contentType === 'external_link' && (
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.content?.url || ''}
                onChange={(e) => {
                  console.log('URL changed to:', e.target.value);
                  updateContentData('url', e.target.value);
                }}
                placeholder="https://example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Current value: &quot;{formData.content?.url}&quot;</p>
            </div>
          )}

          {formData.content?.contentType === 'video' && (
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.content?.videoUrl || ''}
                onChange={(e) => updateContentData('videoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {formData.content?.contentType === 'pdf' && (
            <div>
              <Label htmlFor="pdfUrl">PDF URL</Label>
              <Input
                id="pdfUrl"
                type="url"
                value={formData.content?.pdfUrl || ''}
                onChange={(e) => updateContentData('pdfUrl', e.target.value)}
                placeholder="https://example.com/document.pdf"
              />
            </div>
          )}

          {formData.content?.contentType === 'text' && (
            <div>
              <Label htmlFor="textContent">Text Content</Label>
              <Textarea
                id="textContent"
                value={formData.content?.textContent || ''}
                onChange={(e) => updateContentData('textContent', e.target.value)}
                rows={4}
                placeholder="Enter your text content here..."
              />
            </div>
          )}

          {formData.content?.contentType === 'iframe' && (
            <div>
              <Label htmlFor="iframeHtml">IFrame HTML</Label>
              <Textarea
                id="iframeHtml"
                value={formData.content?.iframeHtml || ''}
                onChange={(e) => updateContentData('iframeHtml', e.target.value)}
                rows={4}
                placeholder='<iframe allow="fullscreen; autoplay" allowfullscreen width="795" height="690" frameborder="0" src="https://example.com/embed"></iframe>'
              />
              <p className="text-xs text-gray-500 mt-1">Paste the complete iframe HTML code here</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Topic' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
