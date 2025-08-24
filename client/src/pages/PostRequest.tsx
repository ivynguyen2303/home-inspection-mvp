import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/store/localStore';
import { useAuth } from '@/auth/AuthProvider';
import { FileText, MapPin, Calendar, Home } from 'lucide-react';

const requestSchema = z.object({
  clientName: z.string().min(1, 'Name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().optional(),
  propertyAddress: z.string().min(1, 'Property address is required'),
  cityZip: z.string().min(1, 'City and ZIP code are required'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  altDate: z.string().optional(),
  propertyType: z.enum(['House', 'Townhome', 'Condo'], {
    required_error: 'Property type is required'
  }),
  beds: z.number().min(0, 'Beds must be 0 or greater'),
  baths: z.number().min(0, 'Baths must be 0 or greater'),
  sqft: z.number().optional(),
  notes: z.string().optional(),
  budget: z.number().optional()
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function PostRequest() {
  const [, setLocation] = useLocation();
  const { addRequest } = useLocalStore();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      clientName: user?.name || '',
      clientEmail: user?.email || '',
      clientPhone: '',
      propertyAddress: '',
      cityZip: '',
      preferredDate: '',
      altDate: '',
      beds: 0,
      baths: 0,
      notes: ''
    }
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.setValue('clientName', user.name || '');
      form.setValue('clientEmail', user.email || '');
    }
  }, [user, form]);

  const onSubmit = (data: RequestFormData) => {
    console.log('📝 [POST REQUEST] Form submitted');
    console.log('📝 [POST REQUEST] Form data:', data);
    
    try {
      console.log('📝 [POST REQUEST] Calling addRequest with data');
      const requestId = addRequest({
        status: 'open',
        type: 'open_request', // This is an open request visible to all inspectors
        client: {
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone || ''
        },
        property: {
          address: data.propertyAddress,
          cityZip: data.cityZip,
          type: data.propertyType,
          beds: data.beds,
          baths: data.baths,
          sqft: data.sqft
        },
        schedule: {
          preferredDate: data.preferredDate,
          altDate: data.altDate
        },
        budget: data.budget,
        notes: data.notes || ''
      });

      console.log('📝 [POST REQUEST] Request created with ID:', requestId);
      console.log('📝 [POST REQUEST] Checking localStorage after creation...');
      
      // Debug localStorage state
      const sharedRequests = localStorage.getItem('inspect_now_shared_requests');
      console.log('📝 [POST REQUEST] SharedRequests in localStorage:', sharedRequests);
      if (sharedRequests) {
        const parsed = JSON.parse(sharedRequests);
        console.log('📝 [POST REQUEST] Parsed requests count:', parsed.length);
      }

      toast({
        title: "Request Posted!",
        description: "Your inspection request has been posted successfully.",
      });

      setLocation('/thanks');
    } catch (error) {
      console.error('📝 [POST REQUEST] Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to post request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2" data-testid="text-post-request-title">
            Request an Inspection
          </h1>
          <p className="text-muted" data-testid="text-post-request-subtitle">
            Fill out the form below and licensed inspectors in your area will be able to see your request.
          </p>
        </div>

        <Card className="bg-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Inspection Request Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} data-testid="input-client-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address * (from your account)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} data-testid="input-client-email" readOnly className="bg-gray-50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-client-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    Property Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} data-testid="input-property-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cityZip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City, ZIP Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="Irvine, 92617" {...field} data-testid="input-city-zip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="House">House</SelectItem>
                              <SelectItem value="Townhome">Townhome</SelectItem>
                              <SelectItem value="Condo">Condo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="beds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-beds"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="baths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.5"
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-baths"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="sqft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Footage (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="e.g., 1650"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-sqft"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Scheduling */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Preferred Dates
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-preferred-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="altDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternative Date (optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-alt-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary">Additional Details</h3>
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="e.g., 400"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-budget"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Notes or Requirements (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific concerns, requirements, or timeline details..."
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg"
                  data-testid="button-submit-request"
                >
                  Post Inspection Request
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}