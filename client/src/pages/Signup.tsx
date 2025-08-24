import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/auth/AuthProvider';
import { SignupData, Role } from '@/auth/types';
import { UserPlus, User, Key, Mail, Phone, MapPin, Shield } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['client', 'inspector'], {
    required_error: 'Please select a role'
  }),
  name: z.string().optional(),
  phone: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: ''
    }
  });

  const watchedPassword = form.watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const signupData: SignupData = {
        email: data.email,
        password: data.password,
        role: data.role,
        name: data.name || undefined,
        phone: data.phone || undefined
      };
      await signup(signupData);
    } catch (error) {
      // Error is handled in AuthProvider with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return null;
    if (password.length < 8) return { text: 'Too short', color: 'text-red-500' };
    if (password.length < 12) return { text: 'Good', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-primary flex items-center justify-center mb-2">
              <MapPin className="mr-2 h-8 w-8" />
              InspectNow
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-secondary">Create your account</h2>
          <p className="text-muted">Join the InspectNow community</p>
        </div>

        {/* Signup Form */}
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Sign Up
            </CardTitle>
            <CardDescription>
              Create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            className="pl-10"
                            {...field} 
                            data-testid="input-signup-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                          <Input 
                            type="password" 
                            placeholder="At least 8 characters"
                            className="pl-10"
                            {...field} 
                            data-testid="input-signup-password"
                          />
                        </div>
                      </FormControl>
                      {passwordStrength && (
                        <p className={`text-xs ${passwordStrength.color}`}>
                          Password strength: {passwordStrength.text}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                          <Input 
                            type="password" 
                            placeholder="Re-enter your password"
                            className="pl-10"
                            {...field} 
                            data-testid="input-confirm-password"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value="client" id="client" data-testid="radio-client" />
                            <label htmlFor="client" className="flex-1 cursor-pointer">
                              <div className="font-medium">Client</div>
                              <div className="text-sm text-muted">Looking for home inspection services</div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value="inspector" id="inspector" data-testid="radio-inspector" />
                            <label htmlFor="inspector" className="flex-1 cursor-pointer">
                              <div className="font-medium">Inspector</div>
                              <div className="text-sm text-muted">Providing home inspection services</div>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name (optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                            <Input 
                              placeholder="Your full name" 
                              className="pl-10"
                              {...field} 
                              data-testid="input-signup-name"
                            />
                          </div>
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
                        <FormLabel>Phone Number (optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                            <Input 
                              placeholder="(555) 123-4567" 
                              className="pl-10"
                              {...field} 
                              data-testid="input-signup-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3"
                  disabled={isSubmitting}
                  data-testid="button-signup"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-blue-700" data-testid="link-login">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}