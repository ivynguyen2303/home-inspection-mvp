import { useRoute } from 'wouter';
import { Header } from '@/components/header';
import { InterestButton } from '@/components/InterestButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocalStore } from '@/store/localStore';
import { 
  Calendar, 
  MapPin, 
  Home, 
  DollarSign, 
  Clock, 
  Mail, 
  Phone, 
  User,
  MessageSquare,
  Lock
} from 'lucide-react';

function obfuscateEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email;
  return `${local[0]}***@${domain}`;
}

function isNew(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 48;
}

export default function RequestDetail() {
  const [match, params] = useRoute('/requests/:id');
  const { getRequestById } = useLocalStore();
  
  const request = match && params?.id ? getRequestById(params.id) : null;

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" data-testid="text-request-not-found">
            <h1 className="text-2xl font-bold text-secondary mb-2">Request Not Found</h1>
            <p className="text-muted">The requested inspection could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Header */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-secondary" data-testid="text-request-title">
                        {request.property.cityZip}
                      </h1>
                      {isNew(request.createdAt) && (
                        <Badge className="bg-green-100 text-green-800" data-testid="badge-new-request">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted" data-testid="text-request-posted">
                      Posted {new Date(request.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {request.budget && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent" data-testid="text-request-budget">
                        ${request.budget}
                      </div>
                      <p className="text-sm text-muted">Budget</p>
                    </div>
                  )}
                </div>

                <InterestButton 
                  requestId={request.id} 
                  interestCount={request.interestCount}
                  className="mb-6"
                />
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-secondary mb-6 flex items-center">
                  <Home className="mr-3 h-6 w-6" />
                  Property Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 mt-1 text-muted" />
                      <div>
                        <p className="font-medium text-secondary">Address</p>
                        <p className="text-muted" data-testid="text-property-address">
                          {request.property.address}
                        </p>
                        <p className="text-muted" data-testid="text-property-city-zip">
                          {request.property.cityZip}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-secondary mb-2">Property Specifications</p>
                      <div className="space-y-1 text-muted">
                        <p data-testid="text-property-type">Type: {request.property.type}</p>
                        <p data-testid="text-property-beds-baths">
                          {request.property.beds} bedrooms, {request.property.baths} bathrooms
                        </p>
                        {request.property.sqft && (
                          <p data-testid="text-property-sqft">{request.property.sqft} square feet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="bg-white rounded-xl shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-secondary mb-6 flex items-center">
                  <Calendar className="mr-3 h-6 w-6" />
                  Preferred Schedule
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-secondary mb-2">Preferred Date</p>
                      <p className="text-lg text-muted" data-testid="text-preferred-date">
                        {new Date(request.schedule.preferredDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {request.schedule.altDate && (
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-secondary mb-2">Alternative Date</p>
                        <p className="text-lg text-muted" data-testid="text-alt-date">
                          {new Date(request.schedule.altDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Special Notes */}
            {request.notes && (
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-secondary mb-4 flex items-center">
                    <MessageSquare className="mr-3 h-6 w-6" />
                    Special Notes
                  </h2>
                  <p className="text-muted whitespace-pre-wrap" data-testid="text-request-notes">
                    {request.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Interest Stats */}
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-4">Interest Level</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2" data-testid="text-interest-count">
                      {request.interestCount}
                    </div>
                    <p className="text-muted">
                      Inspector{request.interestCount !== 1 ? 's' : ''} interested
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-4">Client Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="w-5 h-5 mr-3 mt-1 text-muted" />
                      <div>
                        <p className="font-medium text-secondary">Contact</p>
                        <p className="text-muted" data-testid="text-client-name">{request.client.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 mr-3 mt-1 text-muted" />
                      <div>
                        <p className="font-medium text-secondary">Email</p>
                        <p className="text-muted" data-testid="text-client-email">{obfuscateEmail(request.client.email)}</p>
                      </div>
                    </div>
                    
                    {request.client.phone && (
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 mr-3 mt-1 text-muted" />
                        <div>
                          <p className="font-medium text-secondary">Phone</p>
                          <p className="text-muted" data-testid="text-client-phone">
                            {request.client.phone.substring(0, 6)}***
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button 
                    className="w-full bg-gray-400 text-white cursor-not-allowed" 
                    disabled
                    data-testid="button-contact-client"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Contact Client
                  </Button>
                  <p className="text-xs text-muted text-center mt-2">
                    Contact details are shared after client accepts an inspector
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}