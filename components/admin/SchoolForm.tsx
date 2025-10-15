'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

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

interface SchoolFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolFormData) => Promise<void>;
  initialData?: SchoolFormData;
  mode: 'create' | 'edit';
}

export function SchoolForm({ isOpen, onClose, onSubmit, initialData, mode }: SchoolFormProps) {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    principalName: '',
    contactPerson: '',
    studentCount: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setFormData({
          id: initialData.id,
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          website: initialData.website || '',
          principalName: initialData.principalName || '',
          contactPerson: initialData.contactPerson || '',
          studentCount: initialData.studentCount || 0,
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          website: '',
          principalName: '',
          contactPerson: '',
          studentCount: 0,
          isActive: true,
        });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting school:', error);
      // Show error to user
      alert(error instanceof Error ? error.message : 'Failed to save school');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof SchoolFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit School' : 'Create New School'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., ABC Public School"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="school@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+91 94952 12484"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://school.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              placeholder="School address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="principalName">Principal Name</Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={(e) => updateFormData('principalName', e.target.value)}
                placeholder="Principal's full name"
              />
            </div>

            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => updateFormData('contactPerson', e.target.value)}
                placeholder="Primary contact person"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="studentCount">Student Count</Label>
            <Input
              id="studentCount"
              type="number"
              value={formData.studentCount}
              onChange={(e) => updateFormData('studentCount', parseInt(e.target.value) || 0)}
              min="0"
              placeholder="Number of students"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateFormData('isActive', checked)}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update School' : 'Create School'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
