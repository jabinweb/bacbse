'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { TopicForm } from '@/components/admin/TopicForm';

interface TopicContentData {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  iframeHtml?: string;
  widgetConfig?: Record<string, unknown>;
}

interface Topic {
  id: string;
  name: string;
  type: string;
  duration: string;
  difficulty?: string;
  orderIndex: number;
  chapterId: string;
  created_at: string;
  updated_at: string;
  content?: TopicContentData;
}

interface TopicFormData {
  id?: string;
  name: string;
  type: string;
  duration: string;
  difficulty: string;
  orderIndex: number;
  chapterId: string;
  content?: TopicContentData;
}

export default function TopicsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/topics?chapterId=${chapterId}`);
      const data = await response.json();
      setTopics(Array.isArray(data) ? data : []);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (formData: TopicFormData) => {
    const response = await fetch('/api/admin/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchTopics();
    else throw new Error('Failed to create topic');
  };

  const handleUpdateTopic = async (formData: TopicFormData) => {
    const response = await fetch('/api/admin/topics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchTopics();
    else throw new Error('Failed to update topic');
  };

  // When editing, ensure content is always an object or undefined, never a string
  const handleEditTopic = (topic: Topic) => {
    console.log('Editing topic:', topic);
    console.log('Topic content type:', typeof topic.content);
    console.log('Topic content value:', topic.content);
    
    // Parse content if it's a string (from database)
    let parsedContent;
    if (typeof topic.content === 'string') {
      try {
        parsedContent = JSON.parse(topic.content);
        console.log('Parsed content from string:', parsedContent);
      } catch (error) {
        console.error('Failed to parse content string:', error);
        parsedContent = {
          contentType: 'external_link',
          url: '',
          videoUrl: '',
          pdfUrl: '',
          textContent: '',
          iframeHtml: '',
        };
      }
    } else if (topic.content && typeof topic.content === 'object') {
      // Content is already an object, ensure all fields are present and convert contentType
      parsedContent = {
        contentType: topic.content.contentType?.toLowerCase() || 'external_link',
        url: topic.content.url || '',
        videoUrl: topic.content.videoUrl || '',
        pdfUrl: topic.content.pdfUrl || '',
        textContent: topic.content.textContent || '',
        iframeHtml: topic.content.iframeHtml || '',
        widgetConfig: topic.content.widgetConfig || undefined,
      };
      console.log('Content is object, normalized:', parsedContent);
    } else {
      // No content, create default
      parsedContent = {
        contentType: 'external_link',
        url: '',
        videoUrl: '',
        pdfUrl: '',
        textContent: '',
        iframeHtml: '',
      };
      console.log('No content, using default:', parsedContent);
    }

    const topicForEditing = {
      ...topic,
      content: parsedContent,
    };
    
    console.log('Final topic for editing:', topicForEditing);
    setEditingTopic(topicForEditing);
    setFormOpen(true);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Delete this topic?')) return;
    const response = await fetch(`/api/admin/topics?id=${topicId}`, { method: 'DELETE' });
    if (response.ok) fetchTopics();
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/admin/classes/${classId}/subjects/${subjectId}/chapters`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Topics</h1>
              <p className="text-muted-foreground">Manage topics for this chapter</p>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{topic.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Order: {topic.orderIndex}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTopic(topic)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <TopicForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditingTopic(null); }}
          onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic}
          initialData={editingTopic ? {
            ...editingTopic,
            difficulty: editingTopic.difficulty || 'BEGINNER'
          } : undefined}
          mode={editingTopic ? 'edit' : 'create'}
          chapterId={chapterId}
        />
      </div>
    </div>
  );
}
