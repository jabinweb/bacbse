'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChapterFormData {
  id?: string;
  name: string;
  orderIndex: number;
  subjectId: string;
}

interface ChapterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  initialData?: ChapterFormData;
  mode: 'create' | 'edit';
  subjectId: string;
}

export function ChapterForm({ isOpen, onClose, onSubmit, initialData, mode, subjectId }: ChapterFormProps) {
  const [formData, setFormData] = useState<ChapterFormData>({
    name: '',
    orderIndex: 0,
    subjectId,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        console.log('Setting chapter form data from initialData:', initialData);
        setFormData({
          id: initialData.id,
          name: initialData.name || '',
          orderIndex: initialData.orderIndex || 0,
          subjectId: initialData.subjectId || subjectId,
        });
      } else {
        // Reset to default values for create mode
        setFormData({
          name: '',
          orderIndex: 0,
          subjectId,
        });
      }
    }
  }, [isOpen, initialData, mode, subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting chapter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof ChapterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Chapter' : 'Edit Chapter'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Chapter Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Introduction to Algebra"
              required
            />
          </div>
          
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
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Chapter' : 'Create Chapter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
