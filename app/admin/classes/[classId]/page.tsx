'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft, Layers } from 'lucide-react';
import { SubjectForm } from '@/components/admin/SubjectForm';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  classId: number;
  price?: number; // Price in paisa
  currency?: string;
  created_at: string;
  updated_at: string;
}

interface SubjectFormData {
  id?: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  classId: number;
  price?: number; // Price in paisa
  currency?: string;
}

interface ClassItem {
    id: number;
    name: string;
    // add other properties if needed
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = parseInt(params.classId as string);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [className, setClassName] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchClassName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchClassName = async () => {
    try {
      const response = await fetch('/api/admin/classes');
      const classes = await response.json();
      const currentClass = (classes as ClassItem[]).find((c) => c.id === classId);
      setClassName(currentClass?.name || 'Unknown Class');
    } catch {
      setClassName('Unknown Class');
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/subjects?classId=${classId}`);
      const data = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (formData: SubjectFormData) => {
    const response = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, classId }),
    });
    if (response.ok) fetchSubjects();
    else throw new Error('Failed to create subject');
  };

  const handleUpdateSubject = async (formData: SubjectFormData) => {
    const response = await fetch('/api/admin/subjects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) fetchSubjects();
    else throw new Error('Failed to update subject');
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Delete this subject and all its chapters and topics?')) return;
    const response = await fetch(`/api/admin/subjects?id=${subjectId}`, { method: 'DELETE' });
    if (response.ok) fetchSubjects();
  };

  const goToChapters = (subjectId: string) => {
    router.push(`/admin/classes/${classId}/subjects/${subjectId}/chapters`);
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/admin/classes')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">{className} - Subjects</h1>
              <p className="text-muted-foreground">Manage subjects for this class</p>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{subject.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Order: {subject.orderIndex}</p>
                      </div>
                    </div>
                    <Badge variant={subject.isLocked ? 'destructive' : 'default'}>
                      {subject.isLocked ? 'Locked' : 'Unlocked'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => goToChapters(subject.id)}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Manage Chapters
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingSubject(subject); setFormOpen(true); }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
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

        <SubjectForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditingSubject(null); }}
          onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject}
          initialData={editingSubject || undefined}
          mode={editingSubject ? 'edit' : 'create'}
          classId={classId}
        />
      </div>
    </div>
  );
}
