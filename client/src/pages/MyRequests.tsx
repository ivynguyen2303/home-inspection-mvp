import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/store/localStore';
import { useAuth } from '@/auth/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Home, DollarSign, Clock, Edit2, Trash2, FileText, Heart } from 'lucide-react';

const updateRequestSchema = z.object({
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

type UpdateRequestData = z.infer<typeof updateRequestSchema>;

export default function MyRequests() {
  const { user } = useAuth();
  const { getClientRequests, updateRequest, deleteRequest } = useLocalStore();
  const { toast } = useToast();
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted">Please log in to view your requests.</p>
        </div>
      </div>
    );
  }

  const myRequests = getClientRequests(user.email);

  const form = useForm<UpdateRequestData>({
    resolver: zodResolver(updateRequestSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      propertyAddress: '',
      cityZip: '',
      preferredDate: '',
      altDate: '',
      propertyType: 'House' as const,
      beds: 0,
      baths: 0,
      sqft: 0,
      notes: '',
      budget: 0
    },
  });

  const handleEdit = (requestId: string) => {
    const request = myRequests.find(r => r.id === requestId);
    if (request) {
      // Convert dates to datetime-local format (YYYY-MM-DDTHH:MM)
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          // Format as YYYY-MM-DDTHH:MM
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
          return '';
        }
      };

      form.reset({
        clientName: request.client.name,
        clientEmail: request.client.email,
        clientPhone: request.client.phone || '',
        propertyAddress: request.property.address,
        cityZip: request.property.cityZip,
        preferredDate: formatDateForInput(request.schedule.preferredDate),
        altDate: request.schedule.altDate ? formatDateForInput(request.schedule.altDate) : '',
        propertyType: request.property.type as 'House' | 'Townhome' | 'Condo',
        beds: request.property.beds,
        baths: request.property.baths,
        sqft: request.property.sqft || 0,
        notes: request.notes || '',
        budget: request.budget || 0
      });
      setEditingRequest(requestId);
    }
  };

  const onSubmitUpdate = async (data: UpdateRequestData) => {
    if (!editingRequest) return;

    try {
      updateRequest(editingRequest, user.email, {
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
          sqft: data.sqft || undefined
        },
        schedule: {
          preferredDate: data.preferredDate,
          altDate: data.altDate || undefined,
        },
        budget: data.budget || undefined,
        notes: data.notes || '',
      });

      toast({
        title: "Request Updated",
        description: "Your inspection request has been updated successfully.",
      });

      setEditingRequest(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      deleteRequest(requestId, user.email);
      
      toast({
        title: "Request Deleted",
        description: "Your inspection request has been deleted successfully.",
      });

      setDeleteDialogOpen(null);
    } catch (error) {
      toast({
        title: "Delete Failed", 
        description: error instanceof Error ? error.message : "Failed to delete request",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center" data-testid="text-my-requests-title">
            <FileText className="mr-3 h-8 w-8" />
            My Requests
          </h1>
          <p className="text-muted" data-testid="text-my-requests-subtitle">
            View, edit, and manage your inspection requests
          </p>
        </div>

        {/* Requests List */}
        {myRequests.length === 0 ? (
          <Card className="bg-white rounded-xl shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted mb-4" />
              <h3 className="text-xl font-semibold text-secondary mb-2">No Requests Yet</h3>
              <p className="text-muted mb-6">You haven't posted any inspection requests yet.</p>
              <Button onClick={() => window.location.href = '/inspectors'} data-testid="button-find-inspectors">
                Find Inspectors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {myRequests.map((request) => (
              <Card key={request.id} className="bg-white rounded-xl shadow-lg" data-testid={`card-my-request-${request.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl">{request.property.cityZip}</CardTitle>
                        <Badge 
                          className={`text-xs ${
                            request.type === 'client_request' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {request.type === 'client_request' ? 'Client Request' : 'Open Request'}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            request.status === 'open' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">
                        Created {new Date(request.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={editingRequest === request.id} onOpenChange={(open) => !open && setEditingRequest(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(request.id)}
                            data-testid={`button-edit-${request.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Request</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
                              {/* Client Information */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="clientName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Your Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-edit-client-name" />
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
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" {...field} data-testid="input-edit-client-email" />
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
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                      <Input type="tel" {...field} data-testid="input-edit-client-phone" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Property Information */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-secondary">Property Details</h3>
                                
                                <FormField
                                  control={form.control}
                                  name="propertyAddress"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Property Address</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-edit-property-address" />
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
                                      <FormLabel>City, State ZIP</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-edit-city-zip" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="propertyType"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Property Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger data-testid="select-edit-property-type">
                                              <SelectValue placeholder="Select property type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="House">Single Family House</SelectItem>
                                            <SelectItem value="Townhome">Townhome</SelectItem>
                                            <SelectItem value="Condo">Condominium</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="sqft"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Square Feet (Optional)</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number" 
                                            {...field} 
                                            value={field.value || ''} 
                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            data-testid="input-edit-sqft" 
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="beds"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Bedrooms</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number" 
                                            min="0" 
                                            {...field} 
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            data-testid="input-edit-beds" 
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
                                        <FormLabel>Bathrooms</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number" 
                                            min="0" 
                                            step="0.5" 
                                            {...field} 
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            data-testid="input-edit-baths" 
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              {/* Scheduling */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-secondary">Inspection Schedule</h3>
                                
                                <FormField
                                  control={form.control}
                                  name="preferredDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Preferred Date & Time</FormLabel>
                                      <FormControl>
                                        <Input type="datetime-local" {...field} data-testid="input-edit-preferred-date" />
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
                                      <FormLabel>Alternative Date & Time (Optional)</FormLabel>
                                      <FormControl>
                                        <Input type="datetime-local" {...field} data-testid="input-edit-alt-date" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Additional Details */}
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="budget"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Budget (Optional)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          placeholder="500" 
                                          {...field} 
                                          value={field.value || ''} 
                                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                          data-testid="input-edit-budget" 
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
                                      <FormLabel>Additional Notes (Optional)</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Any specific concerns, areas of focus, or special requirements..."
                                          className="resize-none"
                                          rows={3}
                                          {...field}
                                          data-testid="textarea-edit-notes"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setEditingRequest(null)}>
                                  Cancel
                                </Button>
                                <Button type="submit" data-testid="button-save-changes">
                                  Save Changes
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog open={deleteDialogOpen === request.id} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() => setDeleteDialogOpen(request.id)}
                            data-testid={`button-delete-${request.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this inspection request? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(request.id)}
                              className="bg-red-600 hover:bg-red-700"
                              data-testid="button-confirm-delete"
                            >
                              Delete Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted">
                        <Home className="w-4 h-4 mr-2" />
                        <span>{request.property.type} • {request.property.beds}bd/{request.property.baths}ba</span>
                        {request.property.sqft && <span> • {request.property.sqft} sqft</span>}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Preferred: {new Date(request.schedule.preferredDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {request.schedule.altDate && (
                        <div className="flex items-center text-sm text-muted">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            Alt: {new Date(request.schedule.altDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {request.budget && (
                        <div className="flex items-center text-sm text-muted">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span>Budget: ${request.budget}</span>
                        </div>
                      )}

                      {request.interestCount > 0 && (
                        <div className="flex items-center text-sm text-muted">
                          <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
                          <span>{request.interestCount} inspector{request.interestCount !== 1 ? 's' : ''} interested</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.notes && (
                    <div className="border-t pt-3">
                      <p className="text-sm">
                        <span className="font-medium">Notes: </span>
                        {request.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}