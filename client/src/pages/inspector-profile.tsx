import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Briefcase, 
  Tag, 
  Shield, 
  CheckCircle, 
  Mail, 
  Phone, 
  Clock,
  Lock
} from "lucide-react";
import { mockInspectors, type Inspector } from "@/data/mockInspectors";


export default function InspectorProfile() {
  const [match, params] = useRoute("/inspectors/:id");
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!match || !params?.id) return;

    // Load mock inspector data
    const foundInspector = mockInspectors.inspectors.find((insp: Inspector) => insp.id === params.id);
    setInspector(foundInspector || null);
    setLoading(false);
  }, [match, params?.id]);

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
                    src={inspector.image} 
                    alt={`${inspector.name} Profile Photo`} 
                    className="w-24 h-24 rounded-full object-cover"
                    data-testid="img-inspector-profile"
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-secondary mb-2" data-testid="text-inspector-name">
                      {inspector.name}
                    </h1>
                    <p className="text-muted mb-2" data-testid="text-inspector-location">
                      {inspector.location}
                    </p>
                    <div className="flex items-center mb-3">
                      <div className="flex mr-2">
                        {renderStars(inspector.rating)}
                      </div>
                      <span className="text-secondary font-medium" data-testid="text-inspector-rating">
                        {inspector.rating}
                      </span>
                      <span className="text-muted ml-1" data-testid="text-inspector-reviews">
                        ({inspector.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-muted">
                        <Briefcase className="mr-1 h-4 w-4" />
                        <span data-testid="text-inspector-experience">{inspector.yearsExperience} years</span>
                      </div>
                      <div className="flex items-center text-muted">
                        <Tag className="mr-1 h-4 w-4" />
                        <span data-testid="text-inspector-certification">{inspector.certifications[0]}</span>
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
                  {inspector.bio}
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 mb-2">{inspector.availability.nextAvailable}</div>
                    <div className="text-green-600">Next Available</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 mb-2">{inspector.availability.responseTime}</div>
                    <div className="text-blue-600">Response Time</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted text-center">
                    <Clock className="inline mr-1 h-4 w-4" />
                    Schedule an inspection by contacting {inspector.name} directly
                  </p>
                </div>
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
                    className="w-full bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg cursor-not-allowed mb-3"
                    disabled
                    data-testid="button-request-booking"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Request Booking (Demo)
                  </Button>
                  <p className="text-xs text-muted text-center">
                    This is a demo. Booking functionality would be implemented here.
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
                          {inspector.contact.email}
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
                          {inspector.contact.phone}
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    <div className="text-xs text-muted">
                      <p className="mb-2">
                        <Clock className="inline mr-1 h-3 w-3" />
                        Response time: {inspector.availability.responseTime}
                      </p>
                      <p>
                        <Shield className="inline mr-1 h-3 w-3" />
                        {inspector.insurance}
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
