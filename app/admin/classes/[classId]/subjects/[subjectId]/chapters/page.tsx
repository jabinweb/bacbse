'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowLeft, FileText } from 'lucide-react';
import { ChapterForm } from '@/components/admin/ChapterForm';

interface Chapter {
  id: string;
  name: string;
  orderIndex: number;
  subjectId: string;
  created_at: string;
  updated_at: string;
}

interface ChapterFormData {
  id?: string;
  name: string;
  orderIndex: number;
  subjectId: string;
}

export default function ChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chapters?subjectId=${subjectId}`);
      const data = await response.json();
      setChapters(Array.isArray(data) ? data : []);
    } catch {
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (formData: ChapterFormData) => {
    const response = await fetch('/api/admin/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchChapters();
    else throw new Error('Failed to create chapter');
  };

  const handleUpdateChapter = async (formData: ChapterFormData) => {
    const response = await fetch('/api/admin/chapters', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchChapters();
    else throw new Error('Failed to update chapter');
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Delete this chapter and all its topics?')) return;
    const response = await fetch(`/api/admin/chapters?id=${chapterId}`, { method: 'DELETE' });
    if (response.ok) fetchChapters();
  };

  const goToTopics = (chapterId: string) => {
    router.push(`/admin/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics`);
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push(`/admin/classes/${classId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Chapters</h1>
              <p className="text-muted-foreground">Manage chapters for this subject</p>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{chapter.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Order: {chapter.orderIndex}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => goToTopics(chapter.id)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Topics
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingChapter(chapter); setFormOpen(true); }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteChapter(chapter.id)}
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

        <ChapterForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditingChapter(null); }}
          onSubmit={editingChapter ? handleUpdateChapter : handleCreateChapter}
          initialData={editingChapter || undefined}
          mode={editingChapter ? 'edit' : 'create'}
          subjectId={subjectId}
        />
      </div>
    </div>
  );
}
