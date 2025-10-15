'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { 
  Calendar,
  Mail,
  Phone,
  User,
  School,
  Hash,
  GraduationCap
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  displayName: string | null;
  grade: string | null;
  section: string | null;
  rollNumber: string | null;
  phone: string | null;
  parentName: string | null;
  parentEmail: string | null;
  joinDate: string;
  school: {
    id: string;
    name: string;
  } | null;
  city?: string; // Add optional city to user profile shape
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === 'loading';
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    classId: '',
    phone: '',
    schoolName: '',
    city: ''
  });

  const [classOptions, setClassOptions] = useState<Array<{ id: string | number; name: string }>>([]);

  // Fetch user profile data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/admin/classes');
        if (!res.ok) return;
        const data = await res.json();
        type ClassData = { id: string | number; name: string };
        setClassOptions(Array.isArray(data) ? data.map((d: ClassData) => ({ id: d.id, name: d.name })) : []);
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };

    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            classId: profile.grade || '',
            phone: profile.phone || '',
            schoolName: profile.school?.name || '',
            city: profile.city || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchClasses();
    fetchUserProfile();
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const displayName = userProfile?.displayName || userProfile?.name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString() : 'Not available';

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        classId: userProfile.grade || '',
        phone: userProfile.phone || '',
        schoolName: userProfile.school?.name || '',
        city: userProfile.city || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage src={user.image || ''} alt={displayName} />
                  <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-200">{displayName}</h2>
                  <p className="text-gray-300">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-gray-300" />
                    <span className="text-sm text-gray-300">Joined {joinDate}</span>
                  </div>
                </div>

                <div className="text-right space-x-2">
                  {/* Display user role from NextAuth session */}
                  {user?.role && (
                    <Badge variant="secondary" className="mb-2">
                      {user.role}
                    </Badge>
                  )}
                  <Button 
                    variant={isEditing ? "secondary" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isLoading}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="classId" className="text-gray-700 font-medium">Class</Label>
                      <Select
                        value={formData.classId}
                        onValueChange={(val) => setFormData({ ...formData, classId: val })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classOptions.map((opt) => (
                            <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schoolName" className="text-gray-700 font-medium">School Name</Label>
                      <Input
                        id="schoolName"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700 font-medium">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{userProfile?.name || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{userProfile?.email || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Class</p>
                        <p className="font-medium">{userProfile?.grade || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{userProfile?.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <School className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">School</p>
                        <p className="font-medium">{userProfile?.school?.name || userProfile?.school?.name || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Hash className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium">{userProfile?.city || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}