'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
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

interface ClassData {
  id: number;
  name: string;
  // ...other fields if needed
}

export default function SubjectsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const authLoading = status === 'loading';
  const classId = parseInt(params.classId as string);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [className, setClassName] = useState('');

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  const fetchClassName = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/classes');
      const classes: ClassData[] = await response.json();
      const currentClass = classes.find((c: ClassData) => c.id === classId);
      setClassName(currentClass?.name || 'Unknown Class');
    } catch (error) {
      console.error('Error fetching class name:', error);
    }
  }, [classId]);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/subjects?classId=${classId}`);
      const data: Subject[] = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin && classId) {
      fetchSubjects();
      fetchClassName();
    }
  }, [isAdmin, isLoadingAuth, classId, user, userRole, fetchSubjects, fetchClassName]);



  const handleCreateSubject = async (formData: SubjectFormData) => {
    const response = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, classId }),
    });

    if (response.ok) {
      fetchSubjects();
    } else {
      throw new Error('Failed to create subject');
    }
  };

  const handleUpdateSubject = async (formData: SubjectFormData) => {
    const response = await fetch('/api/admin/subjects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      fetchSubjects();
    } else {
      throw new Error('Failed to update subject');
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all chapters and topics.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subjects?id=${subjectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  // ...existing loading and auth checks...

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/admin/classes')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">{className} - Subjects</h1>
              <p className="text-muted-foreground">Manage subjects for this class</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSubjects} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>

        {/* Subject Cards Grid */}
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
                        <p className="text-sm font-medium text-green-600">
                          Price: ₹{subject.price ? (subject.price / 100).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={subject.isLocked ? 'destructive' : 'default'}>
                      {subject.isLocked ? 'Locked' : 'Unlocked'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className={`h-4 rounded bg-gradient-to-r ${subject.color}`} />
                    
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
