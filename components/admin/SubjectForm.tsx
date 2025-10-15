'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  initialData?: SubjectFormData;
  mode: 'create' | 'edit';
  classId: number;
}

const colorOptions = [
  { value: 'from-blue-400 to-blue-600', label: 'Blue' },
  { value: 'from-green-400 to-green-600', label: 'Green' },
  { value: 'from-purple-400 to-purple-600', label: 'Purple' },
  { value: 'from-orange-400 to-orange-600', label: 'Orange' },
  { value: 'from-red-400 to-red-600', label: 'Red' },
  { value: 'from-yellow-400 to-yellow-600', label: 'Yellow' },
  { value: 'from-pink-400 to-pink-600', label: 'Pink' },
  { value: 'from-indigo-400 to-indigo-600', label: 'Indigo' },
];

export function SubjectForm({ isOpen, onClose, onSubmit, initialData, mode, classId }: SubjectFormProps) {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    icon: '📚',
    color: 'from-blue-400 to-blue-600',
    isLocked: false,
    orderIndex: 0,
    classId,
    price: 29900, // Default ₹299
    currency: 'INR',
  });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        console.log('Setting form data from initialData:', initialData);
        setFormData({
          id: initialData.id,
          name: initialData.name || '',
          icon: initialData.icon || '📚',
          color: initialData.color || 'from-blue-400 to-blue-600',
          isLocked: initialData.isLocked || false,
          orderIndex: initialData.orderIndex || 0,
          classId: initialData.classId || classId,
          price: initialData.price || 29900,
          currency: initialData.currency || 'INR',
        });
      } else {
        // Reset to default values for create mode
        setFormData({
          name: '',
          icon: '📚',
          color: 'from-blue-400 to-blue-600',
          isLocked: false,
          orderIndex: 0,
          classId,
          price: 29900, // Default ₹299
          currency: 'INR',
        });
      }
    }
  }, [isOpen, initialData, mode, classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof SubjectFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Subject' : 'Create New Subject'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Mathematics"
              required
            />
          </div>

          <div>
            <Label htmlFor="icon">Icon (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => updateFormData('icon', e.target.value)}
              placeholder="📚"
              required
            />
          </div>

          <div>
            <Label htmlFor="color">Color Theme</Label>
            <Select value={formData.color} onValueChange={(value) => updateFormData('color', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded bg-gradient-to-r ${option.value}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price ? (formData.price / 100).toFixed(2) : ''}
                onChange={(e) => {
                  const rupees = parseFloat(e.target.value) || 0;
                  const paisa = Math.round(rupees * 100);
                  updateFormData('price', paisa);
                }}
                placeholder="299.00"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Enter price in rupees (e.g., 299 for ₹299)
              </div>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency || 'INR'} onValueChange={(value) => updateFormData('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="locked"
              checked={formData.isLocked}
              onCheckedChange={(checked) => updateFormData('isLocked', checked)}
            />
            <Label htmlFor="locked">Locked</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
