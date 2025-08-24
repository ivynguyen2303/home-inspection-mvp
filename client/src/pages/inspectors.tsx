import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import { useLocalStore, type InspectorProfile } from "@/store/localStore";
import { mockInspectors } from "@/data/mockInspectors";


export default function Inspectors() {
  const [inspectors, setInspectors] = useState<InspectorProfile[]>([]);
  const { getAllInspectorProfiles } = useLocalStore();

  const loadInspectors = () => {
    // Load real inspector profiles from signup + some demo data
    const realProfiles = getAllInspectorProfiles();
    
    // Always include mock data for demo purposes, then add real profiles
    const mockProfiles = mockInspectors.inspectors.map(mock => ({
      id: mock.id,
      displayName: mock.name,
      serviceAreas: mock.serviceAreas,
      specialties: mock.specialties,
      basePrice: mock.basePrice,
      email: mock.contact.email,
      phone: mock.contact.phone,
      location: mock.location,
      bio: mock.bio,
      yearsExperience: mock.yearsExperience,
      certifications: mock.certifications,
      rating: mock.rating,
      reviewCount: mock.reviewCount,
      completedInspections: mock.completedInspections,
      image: mock.image,
      verified: mock.verified,
      availability: mock.availability,
      contact: mock.contact,
      insurance: mock.insurance
    }));
    
    // Combine mock profiles with real profiles, ensuring no duplicates
    const allProfiles = [...mockProfiles, ...realProfiles];
    
    setInspectors(allProfiles);
  };

  useEffect(() => {
    loadInspectors();
  }, []);

  // Refresh inspectors when storage changes (to catch new signups)
  useEffect(() => {
    const handleStorageChange = () => {
      loadInspectors();
    };
    
    // Listen for storage events (triggered when new inspectors are added)
    window.addEventListener('storage', handleStorageChange);
    
    // Also refresh when window regains focus
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Directory Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2" data-testid="text-inspectors-title">
            Licensed Home Inspectors
          </h1>
          <p className="text-muted" data-testid="text-inspectors-count">
            {inspectors.length} licensed inspectors available
          </p>
        </div>

        {/* Inspectors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspectors.map((inspector) => (
            <Card key={inspector.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow" data-testid={`card-inspector-${inspector.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img 
                    src={inspector.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'} 
                    alt={`${inspector.displayName} Profile Photo`} 
                    className="w-16 h-16 rounded-full object-cover"
                    data-testid={`img-inspector-${inspector.id}`}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary" data-testid={`text-inspector-name-${inspector.id}`}>
                      {inspector.displayName}
                    </h3>
                    <p className="text-sm text-muted" data-testid={`text-inspector-location-${inspector.id}`}>
                      {inspector.location || 'San Francisco, CA'}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {renderStars(inspector.rating || 5.0)}
                      </div>
                      <span className="ml-2 text-sm text-muted" data-testid={`text-inspector-rating-${inspector.id}`}>
                        {inspector.rating || 5.0} ({inspector.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-muted">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span data-testid={`text-inspector-experience-${inspector.id}`}>
                      {inspector.yearsExperience || 1} years experience
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate" data-testid={`text-inspector-areas-${inspector.id}`}>
                      {inspector.serviceAreas.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>Starting at </span>
                    <span className="font-semibold text-secondary ml-1" data-testid={`text-inspector-price-${inspector.id}`}>
                      ${inspector.basePrice}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-accent">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span data-testid={`text-inspector-availability-${inspector.id}`}>
                      {inspector.availability?.nextAvailable || 'This week'}
                    </span>
                  </div>
                </div>
                
                <Link href={`/inspectors/${inspector.id}`}>
                  <Button 
                    className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    data-testid={`button-view-profile-${inspector.id}`}
                  >
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
