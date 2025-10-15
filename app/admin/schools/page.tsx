'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, AlertCircle, School, Users, Mail, Phone, Upload } from 'lucide-react';
import { SchoolForm } from '@/components/admin/SchoolForm';
import { BulkStudentUpload } from '@/components/admin/BulkStudentUpload';

interface SchoolData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  principal_name?: string;
  contact_person?: string;
  student_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SchoolFormData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  principalName?: string;
  contactPerson?: string;
  studentCount?: number;
  isActive: boolean;
}

export default function SchoolsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  // Get actual role from session
  const userRole = user?.role; // Get actual role from session
  const authLoading = status === 'loading';
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolFormData | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [selectedSchoolForUpload, setSelectedSchoolForUpload] = useState<SchoolData | null>(null);

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = authLoading || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchSchools();
    }
  }, [isAdmin, isLoadingAuth, user, userRole]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/schools');
      const data = await response.json();
      setSchools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (formData: SchoolFormData) => {
    try {
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Show the specific error message from the server
        throw new Error(responseData.error || `HTTP ${response.status}: Failed to create school`);
      }

      fetchSchools();
    } catch (error) {
      console.error('Error creating school:', error);
      // Re-throw with a user-friendly message
      throw new Error(error instanceof Error ? error.message : 'Failed to create school');
    }
  };

  const handleUpdateSchool = async (formData: SchoolFormData) => {
    if (!formData.id) {
      throw new Error('School ID is required for update');
    }

    const response = await fetch('/api/admin/schools', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      fetchSchools();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update school');
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Are you sure you want to delete this school? This will also affect all associated users.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/schools?id=${schoolId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSchools();
      }
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  };

  const openEditForm = (school: SchoolData) => {
    setEditingSchool({
      id: school.id,
      name: school.name,
      email: school.email,
      phone: school.phone,
      address: school.address,
      website: school.website,
      principalName: school.principal_name,
      contactPerson: school.contact_person,
      studentCount: school.student_count,
      isActive: school.is_active,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingSchool(null);
  };

  const handleBulkUpload = (school: SchoolData) => {
    setSelectedSchoolForUpload(school);
    setBulkUploadOpen(true);
  };

  const closeBulkUpload = () => {
    setBulkUploadOpen(false);
    setSelectedSchoolForUpload(null);
  };

  const handleUploadComplete = () => {
    fetchSchools(); // Refresh schools to update student counts
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
            <h1 className="text-3xl font-bold mb-2">School Management</h1>
            <p className="text-muted-foreground">Manage schools and their information</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSchools} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Card key={school.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <School className="h-5 w-5" />
                      {school.name}
                    </CardTitle>
                    <Badge variant={school.is_active ? 'default' : 'secondary'}>
                      {school.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{school.email}</span>
                      </div>
                      {school.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{school.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{school.student_count} students</span>
                      </div>
                      {school.principal_name && (
                        <div className="text-xs text-muted-foreground">
                          Principal: {school.principal_name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(school)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleBulkUpload(school)}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Students
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSchool(school.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {schools.length === 0 && !loading && (
          <div className="text-center py-8">
            <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Schools Found</h3>
            <p className="text-muted-foreground mb-4">Create your first school to get started.</p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </div>
        )}

        <SchoolForm
          isOpen={formOpen}
          onClose={closeForm}
          onSubmit={editingSchool ? handleUpdateSchool : handleCreateSchool}
          initialData={editingSchool || undefined}
          mode={editingSchool ? 'edit' : 'create'}
        />

        {selectedSchoolForUpload && (
          <BulkStudentUpload
            isOpen={bulkUploadOpen}
            onClose={closeBulkUpload}
            schoolId={selectedSchoolForUpload.id}
            schoolName={selectedSchoolForUpload.name}
            onComplete={handleUploadComplete}
          />
        )}
      </div>
    </div>
  );
}

