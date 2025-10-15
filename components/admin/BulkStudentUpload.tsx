'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  onComplete: () => void;
}

interface StudentData {
  name: string;
  email: string;
  grade: string;
  section: string;
  errors: Array<{ row: number; error: string; data: StudentData }>;
  phone: string;
  parent_name: string;
  parent_email: string;
}

interface UploadResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: Array<{ row: number; error: string; data: StudentData }>;
}

export function BulkStudentUpload({ isOpen, onClose, schoolId, schoolName, onComplete }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);

  const downloadTemplate = () => {
    const csvContent = `name,email,grade,section,roll_number,phone,parent_name,parent_email
John Doe,john.doe@example.com,5,A,001,9495212484,John Sr,john.sr@example.com
Jane Smith,jane.smith@example.com,5,A,002,9495212485,Jane Sr,jane.sr@example.com
Mike Johnson,mike.johnson@example.com,5,B,003,9495212486,Mike Sr,mike.sr@example.com`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_upload_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('schoolId', schoolId);

      const response = await fetch('/api/admin/students/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result: UploadResult = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(result);
      
      if (result.success) {
        onComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        total: 0,
        created: 0,
        updated: 0,
        errors: [{
          row: 0,
          error: 'Upload failed. Please try again.',
          data: {
            name: '',
            email: '',
            grade: '',
            section: '',
            phone: '',
            parent_name: '',
            parent_email: '',
            errors: []
          }
        }]
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Student Upload - {schoolName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Alert 
            description="Upload a CSV file with student information. Make sure to follow the template format for successful import." 
            variant="default" 
          />

          {/* Template Download */}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-medium text-blue-900">Download Template</h4>
              <p className="text-sm text-blue-700">Get the CSV template with required columns</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                File selected: {file.name}
              </div>
            )}
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing students...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className={`flex items-center gap-2 mb-2 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <h4 className="font-medium">
                    {result.success ? 'Upload Completed' : 'Upload Failed'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total:</span> {result.total}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {result.created}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {result.updated}
                  </div>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Errors ({result.errors.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {result.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <span className="font-medium">Row {error.row}:</span> {error.error}
                        {error.data.email && (
                          <div className="text-xs text-gray-600 mt-1">
                            Email: {error.data.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            {!result && (
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Students
                  </>
                )}
              </Button>
            )}
            {result && (
              <Button onClick={resetForm} variant="outline">
                Upload Another File
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
  