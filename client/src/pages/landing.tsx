import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLocalStore } from "@/store/localStore";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Tag, Clock, FileText } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const { clearAllData } = useLocalStore();

  // Clear all existing data on first load to ensure fresh start
  useEffect(() => {
    // Clear all possible data keys
    const keysToRemove = [
      'inspect_now_data',
      'inspect_now_auth', 
      'inspect_now_user',
      'inspect_now_users',
      'inspect_now_session',
      'inspect_now_inspector_profile',
      'inspect_now_all_inspector_profiles',
      'inspect_now_requests'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    clearAllData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/inspectors");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Find a home inspector in minutes
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
              Connect with licensed, experienced home inspectors in your area. Get detailed reports and peace of mind for your property purchase.
            </p>
            
            {/* Search Form */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl p-8">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="location" className="sr-only">Enter city or ZIP code</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted h-5 w-5" />
                      <Input 
                        type="text" 
                        id="location" 
                        name="location"
                        placeholder="Enter city or ZIP code" 
                        className="w-full pl-12 pr-4 py-4 text-secondary border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        data-testid="input-search-location"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg min-w-[160px]"
                    data-testid="button-search"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </form>
                
                {/* Alternative Action */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-secondary text-center mb-4">Or let inspectors come to you:</p>
                  <Button 
                    onClick={() => setLocation('/post')}
                    variant="outline"
                    className="w-full py-3 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    data-testid="button-post-request-cta"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Post Your Inspection Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4" data-testid="text-features-title">
              Why Choose InspectNow?
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto" data-testid="text-features-subtitle">
              Professional home inspection services you can trust
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6" data-testid="feature-licensed">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">Licensed Professionals</h3>
              <p className="text-muted">All inspectors are licensed and certified with years of experience</p>
            </div>
            
            <div className="text-center p-6" data-testid="feature-scheduling">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">Fast Scheduling</h3>
              <p className="text-muted">Book inspections quickly with real-time availability</p>
            </div>
            
            <div className="text-center p-6" data-testid="feature-reports">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">Detailed Reports</h3>
              <p className="text-muted">Comprehensive inspection reports with photos and recommendations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
