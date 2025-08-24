import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/auth/AuthProvider';
import { User, Phone, Mail, Calendar, LogOut, Edit, Settings } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Account() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  if (!user) {
    return null; // Should not happen due to ProtectedRoute
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      // Error is handled in AuthProvider with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      name: user.name || '',
      phone: user.phone || ''
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'client' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2" data-testid="text-account-title">
            Account Settings
          </h1>
          <p className="text-muted" data-testid="text-account-subtitle">
            Manage your profile and account preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-xl shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      data-testid="button-edit-profile"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your full name" 
                                {...field} 
                                data-testid="input-edit-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(555) 123-4567" 
                                {...field} 
                                data-testid="input-edit-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-3">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          data-testid="button-save-profile"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancel}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-secondary">Email Address</label>
                        <div className="flex items-center mt-1">
                          <Mail className="mr-2 h-4 w-4 text-muted" />
                          <span className="text-muted" data-testid="text-user-email">{user.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-secondary">Role</label>
                        <div className="mt-1">
                          <Badge 
                            className={`${getRoleBadgeColor(user.role)} capitalize`}
                            data-testid="badge-user-role"
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-secondary">Full Name</label>
                        <div className="flex items-center mt-1">
                          <User className="mr-2 h-4 w-4 text-muted" />
                          <span className="text-muted" data-testid="text-user-name">
                            {user.name || 'Not provided'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-secondary">Phone Number</label>
                        <div className="flex items-center mt-1">
                          <Phone className="mr-2 h-4 w-4 text-muted" />
                          <span className="text-muted" data-testid="text-user-phone">
                            {user.phone || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-secondary">Member Since</label>
                      <div className="flex items-center mt-1">
                        <Calendar className="mr-2 h-4 w-4 text-muted" />
                        <span className="text-muted" data-testid="text-user-created">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.role === 'client' ? (
                  <Link href="/post" className="block">
                    <Button className="w-full justify-start" data-testid="button-post-request">
                      <Edit className="mr-2 h-4 w-4" />
                      Post a Request
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/inspector" className="block">
                      <Button className="w-full justify-start" data-testid="button-inspector-dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Inspector Dashboard
                      </Button>
                    </Link>
                    <Link href="/requests" className="block">
                      <Button variant="outline" className="w-full justify-start" data-testid="button-view-requests">
                        <User className="mr-2 h-4 w-4" />
                        View Requests
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Account</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={logout}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}