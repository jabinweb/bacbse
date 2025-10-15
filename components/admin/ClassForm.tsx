'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface ClassFormData {
  id?: string;
  classId?: string; // New field for editable class ID
  name: string;
  description: string;
  isActive: boolean;
  price?: string; // Keep as string for form input
}

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassFormData) => Promise<void>;
  initialData?: ClassFormData;
  mode: 'create' | 'edit';
}

export function ClassForm({ isOpen, onClose, onSubmit, initialData, mode }: ClassFormProps) {
  const [formData, setFormData] = useState<ClassFormData>({
    classId: '',
    name: '',
    description: '',
    isActive: true,
    price: '299', // Default price in rupees
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setFormData({
          id: initialData.id,
          classId: initialData.classId || '',
          name: initialData.name || '',
          description: initialData.description || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          price: initialData.price || '299',
        });
      } else {
        setFormData({
          classId: '',
          name: '',
          description: '',
          isActive: true,
          price: '299',
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
      console.error('Error submitting class:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ClassFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Class' : 'Create New Class'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="classId">Class ID</Label>
            <Input
              id="classId"
              type="number"
              value={formData.classId}
              onChange={(e) => updateFormData('classId', e.target.value)}
              placeholder="e.g., 4 for Class 4, 5 for Class 5"
              required
            />
          </div>

          <div>
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., CBSE : Class 5"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Brief description of the class"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => updateFormData('price', e.target.value)}
              placeholder="299"
              min="0"
              step="1"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Price for accessing this class. Set to 0 for free access.
            </p>
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
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
              