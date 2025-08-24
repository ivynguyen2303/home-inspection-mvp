import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Briefcase, 
  Tag, 
  Shield, 
  CheckCircle, 
  Mail, 
  Phone, 
  Clock,
  ExternalLink,
  Calendar
} from "lucide-react";
import { useLocalStore, type InspectorProfile } from "@/store/localStore";


const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Property address is required'),
  cityZip: z.string().min(1, 'City and ZIP are required'),
  propertyType: z.enum(['House', 'Townhome', 'Condo']),
  beds: z.string().min(1, 'Number of bedrooms is required'),
  baths: z.string().min(1, 'Number of bathrooms is required'),
  sqft: z.string().optional(),
  notes: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function InspectorProfile() {
  const [match, params] = useRoute("/inspectors/:id");
  const [inspector, setInspector] = useState<InspectorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getInspectorProfileByEmail, createBookingFromTimeSlot } = useLocalStore();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      cityZip: '',
      propertyType: 'House',
      beds: '3',
      baths: '2',
      sqft: '',
      notes: ''
    }
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.setValue('name', user.name || '');
      form.setValue('email', user.email || '');
      form.setValue('phone', user.phone || '');
    }
  }, [user, form]);

  useEffect(() => {
    if (!match || !params?.id) return;

    // Find real inspector profile by email
    const foundInspector = getInspectorProfileByEmail(decodeURIComponent(params.id || ''));
    
    setInspector(foundInspector || null);
    setLoading(false);
  }, [match, params?.id, getInspectorProfileByEmail]);

  const handleTimeSlotSelect = (timeSlotId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book an inspection",
        variant: "destructive"
      });
      return;
    }
    
    if (user.role !== 'client') {
      toast({
        title: "Client Account Required",
        description: "Only client accounts can book inspections",
        variant: "destructive"
      });
      return;
    }

    setSelectedTimeSlot(timeSlotId);
    setDialogOpen(true);
  };

  const onSubmitBooking = async (data: BookingFormData) => {
    if (!selectedTimeSlot || !params?.id) return;

    try {
      const requestId = createBookingFromTimeSlot(selectedTimeSlot, decodeURIComponent(params.id || ''), {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        cityZip: data.cityZip,
        propertyType: data.propertyType,
        beds: parseInt(data.beds),
        baths: parseInt(data.baths),
        sqft: data.sqft ? parseInt(data.sqft) : undefined,
        notes: data.notes
      });

      toast({
        title: "Booking Requested!",
        description: "Your inspection request has been sent to the inspector.",
      });

      setDialogOpen(false);
      setSelectedTimeSlot(null);
      form.reset();
      
      // Refresh inspector data to show updated availability
      const updatedInspector = getInspectorProfileByEmail(decodeURIComponent(params.id || ''));
      setInspector(updatedInspector || null);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="text-loading">Loading inspector profile...</div>
        </div>
      </div>
    );
  }

  if (!inspector) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="text-not-found">Inspector not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <img 
                    src={inspector.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'} 
                    alt={`${inspector.displayName} Profile Photo`} 
                    className="w-24 h-24 rounded-full object-cover"
                    data-testid="img-inspector-profile"
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-secondary mb-2" data-testid="text-inspector-name">
                      {inspector.displayName}
                    </h1>
                    <p className="text-muted mb-2" data-testid="text-inspector-location">
                      {inspector.location || 'San Francisco, CA'}
                    </p>
                    <div className="flex items-center mb-3">
                      <div className="flex mr-2">
                        {renderStars(inspector.rating || 5.0)}
                      </div>
                      <span className="text-secondary font-medium" data-testid="text-inspector-rating">
                        {inspector.rating || 5.0}
                      </span>
                      <span className="text-muted ml-1" data-testid="text-inspector-reviews">
                        ({inspector.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-muted">
                        <Briefcase className="mr-1 h-4 w-4" />
                        <span data-testid="text-inspector-experience">{inspector.yearsExperience || 1} years</span>
                      </div>
                      <div className="flex items-center text-muted">
                        <Tag className="mr-1 h-4 w-4" />
                        <span data-testid="text-inspector-certification">{inspector.certifications?.[0] || 'State Licensed'}</span>
                      </div>
                      <div className="flex items-center text-accent">
                        <Shield className="mr-1 h-4 w-4" />
                        <span>Insured & Bonded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio and Specialties */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-secondary mb-4" data-testid="text-about-title">About</h2>
                <p className="text-muted mb-6" data-testid="text-inspector-bio">
                  {inspector.bio || 'Professional home inspector with expertise in residential property assessments.'}
                </p>
                
                <h3 className="text-lg font-semibold text-secondary mb-3" data-testid="text-service-areas-title">Service Areas</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {inspector.serviceAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-secondary" data-testid={`badge-service-area-${index}`}>
                      {area}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold text-secondary mb-3" data-testid="text-specialties-title">Specialties</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {inspector.specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center text-muted" data-testid={`specialty-${index}`}>
                      <CheckCircle className="text-accent mr-2 h-4 w-4" />
                      {specialty}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Availability Info */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-secondary mb-6" data-testid="text-availability-title">Availability</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 mb-2">{inspector.availability?.nextAvailable || 'This week'}</div>
                    <div className="text-green-600">Next Available</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 mb-2">{inspector.availability?.responseTime || 'Within 4 hours'}</div>
                    <div className="text-blue-600">Response Time</div>
                  </div>
                </div>

                {/* Time Slots */}
                {inspector.availability?.timeSlots && inspector.availability.timeSlots.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-secondary mb-4">Available Time Slots</h3>
                    <div className="grid gap-3">
                      {inspector.availability.timeSlots
                        .filter(slot => slot.available)
                        .slice(0, 6)
                        .map((timeSlot) => (
                        <div
                          key={timeSlot.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-muted mr-3" />
                            <div>
                              <div className="font-medium text-secondary">{timeSlot.date}</div>
                              <div className="text-sm text-muted">{timeSlot.startTime} - {timeSlot.endTime}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleTimeSlotSelect(timeSlot.id)}
                            className="bg-primary hover:bg-blue-700 text-white"
                            data-testid={`button-book-${timeSlot.id}`}
                          >
                            Request this time
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted text-center">
                      <Clock className="inline mr-1 h-4 w-4" />
                      Schedule an inspection by contacting {inspector.displayName} directly
                    </p>
                  </div>
                )}

                {/* Booking Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Request Inspection</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitBooking)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-booking-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (from your account)</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} data-testid="input-booking-email" readOnly className="bg-gray-50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-booking-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Address</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-booking-address" />
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
                              <FormLabel>City & ZIP Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., San Francisco, CA 94102" data-testid="input-booking-cityzip" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="propertyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Property Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-booking-property-type">
                                      <SelectValue />
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
                                <FormLabel>Bedrooms</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-booking-beds" />
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
                                  <Input {...field} data-testid="input-booking-baths" />
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
                              <FormLabel>Square Feet (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-booking-sqft" />
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
                              <FormLabel>Additional Notes (optional)</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} data-testid="textarea-booking-notes" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            data-testid="button-booking-cancel"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-primary hover:bg-blue-700"
                            data-testid="button-booking-submit"
                          >
                            Request Inspection
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Pricing Card */}
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-secondary mb-2" data-testid="text-base-price">
                      ${inspector.basePrice}
                    </div>
                    <p className="text-muted">Starting price for standard home inspection</p>
                  </div>
                  
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Standard Home (up to 2,500 sq ft)</span>
                      <span className="text-secondary font-medium" data-testid="text-standard-price">${inspector.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Large Home (2,500+ sq ft)</span>
                      <span className="text-secondary font-medium" data-testid="text-large-price">${inspector.basePrice + 125}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Condo/Townhouse</span>
                      <span className="text-secondary font-medium" data-testid="text-condo-price">${inspector.basePrice - 75}</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between">
                      <span className="text-muted">Additional services available</span>
                      <span className="text-accent text-xs">View details</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
                    data-testid="button-request-booking"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Contact Inspector
                  </Button>
                  <p className="text-xs text-muted text-center">
                    Contact directly via email or phone to schedule your inspection.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-4" data-testid="text-contact-title">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted">Email</div>
                        <div className="text-secondary font-medium" data-testid="text-inspector-email">
                          {inspector.contact?.email || inspector.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center mr-3">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted">Phone</div>
                        <div className="text-secondary font-medium" data-testid="text-inspector-phone">
                          {inspector.contact?.phone || inspector.phone || '(555) 123-4567'}
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    <div className="text-xs text-muted">
                      <p className="mb-2">
                        <Clock className="inline mr-1 h-3 w-3" />
                        Response time: {inspector.availability?.responseTime || 'Within 4 hours'}
                      </p>
                      <p>
                        <Shield className="inline mr-1 h-3 w-3" />
                        {inspector.insurance || '$1M Professional Liability'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
