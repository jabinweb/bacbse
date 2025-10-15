'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, BookOpen, ChevronRight, Users } from 'lucide-react';
import { ClassForm } from '@/components/admin/ClassForm';
import { useRouter } from 'next/navigation';

interface Class {
  id: string;
  classId?: string;
  name: string;
  description: string;
  isActive: boolean;
  price: string; // Change from string to number
  currency: string;
  created_at: string;
  updated_at: string;
  subjects?: Array<{ id: string; name: string }>;
  subscriptions?: Array<{ id: string; status: string; user: { email: string; display_name: string } }>;

}

interface ClassFormData {
  id?: string;
  classId?: string;
  name: string;
  description: string;
  isActive: boolean;
  price?: string; // Keep as string for form handling
}

export default function ClassesPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role; // Get actual role from session
  const authLoading = status === 'loading';
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const router = useRouter();

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchClasses();
    }
  }, [isAdmin, isLoadingAuth, user, userRole]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/classes');
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (formData: ClassFormData) => {
    const response = await fetch('/api/admin/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: formData.classId,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        price: formData.price
      }),
    });

    if (response.ok) {
      fetchClasses();
    } else {
      throw new Error('Failed to create class');
    }
  };

  const handleUpdateClass = async (formData: ClassFormData) => {
    if (!formData.id) {
      throw new Error('Class ID is required for update');
    }

    const response = await fetch('/api/admin/classes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(formData.id, 10),
        classId: formData.classId,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        price: formData.price ? parseInt(formData.price) : undefined // Handle price conversion
      }),
    });

    if (response.ok) {
      fetchClasses();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update class');
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this class? This will also delete all subjects, chapters, and topics.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/classes?id=${classId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const openEditForm = (classItem: Class) => {
    setEditingClass({
      id: String(classItem.id),
      classId: String(classItem.id), // Map id to classId for the form
      name: classItem.name,
      description: classItem.description,
      isActive: classItem.isActive,
      price: String(Math.round((typeof classItem.price === 'string' ? parseInt(classItem.price) : classItem.price || 29900) / 100)),
      currency: classItem.currency,
      created_at: classItem.created_at,
      updated_at: classItem.updated_at,
      subjects: classItem.subjects,
      subscriptions: classItem.subscriptions,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingClass(null);
  };

  const handleManageClass = (classId: number) => {
    router.push(`/admin/classes/${classId}`);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Class Management</h1>
            <p className="text-muted-foreground">Manage classes and their content structure</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchClasses} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => {
              // Ensure price is a number for arithmetic
              const priceNum = typeof classItem.price === 'string' ? parseInt(classItem.price) : classItem.price;
              return (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{classItem.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          ₹{Math.round((priceNum || 0) / 100)}
                        </Badge>
                        <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
                          {classItem.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{classItem.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{classItem.subjects?.length || 0} Subjects</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{classItem.subscriptions?.length || 0} Students</span>
                        </div>
                        <div className="text-muted-foreground">
                          ID: {classItem.id}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(classItem)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClass(Number(classItem.id))}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleManageClass(Number(classItem.id))}
                          className="flex-1"
                        >
                          Manage
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {classes.length === 0 && !loading && (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Classes Found</h3>
            <p className="text-muted-foreground mb-4">Create your first class to get started.</p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        )}

        <ClassForm
          isOpen={formOpen}
          onClose={closeForm}
          onSubmit={editingClass ? handleUpdateClass : handleCreateClass}
          initialData={editingClass || undefined}
          mode={editingClass ? 'edit' : 'create'}
        />
      </div>
    </div>
  );
}
