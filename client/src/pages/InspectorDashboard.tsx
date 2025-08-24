import { useState } from 'react';
import { Link } from 'wouter';
import { Header } from '@/components/header';
import { ProfileEditor } from '@/components/ProfileEditor';
import { AvailabilityManager } from '@/components/AvailabilityManager';
import { RequestCard } from '@/components/RequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLocalStore } from '@/store/localStore';
import { useAuth } from '@/auth/AuthProvider';
import { LayoutDashboard, Heart, Settings, Plus, Briefcase, Calendar } from 'lucide-react';

export default function InspectorDashboard() {
  const { requests, getMyInterests, inspectorProfile } = useLocalStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  
  
  
  // Filter requests for this inspector only
  const openRequests = requests.filter(req => 
    req.status === 'open' && req.type === 'open_request'
  );
  
  // IMPORTANT: Client requests should ONLY show for the targeted inspector
  const clientRequests = requests.filter(req => {
    // Triple-check the filtering to ensure bulletproof targeting
    const isOpen = req.status === 'open';
    const isClientRequest = req.type === 'client_request';
    const isTargetedToMe = req.targetInspectorEmail && 
                          inspectorProfile.email && 
                          String(req.targetInspectorEmail) === String(inspectorProfile.email);
    
    
    return isOpen && isClientRequest && isTargetedToMe;
  });
  const myInterests = getMyInterests();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center" data-testid="text-dashboard-title">
            <LayoutDashboard className="mr-3 h-8 w-8" />
            Inspector Dashboard
          </h1>
          <p className="text-muted" data-testid="text-dashboard-subtitle">
            Welcome back, {inspectorProfile.displayName}! Manage your inspection requests and profile.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-secondary mb-2">Open Requests</h3>
              <p className="text-2xl font-bold text-primary" data-testid="text-open-requests-count">
                {openRequests.length}
              </p>
              <Link href="/requests">
                <Button size="sm" className="mt-2" data-testid="button-view-all-requests">
                  View All
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="mx-auto h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-semibold text-secondary mb-2">Client Requests</h3>
              <p className="text-2xl font-bold text-blue-500" data-testid="text-client-requests-count">
                {clientRequests.length}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => setActiveTab('client-requests')}
                data-testid="button-view-client-requests"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Heart className="mx-auto h-8 w-8 text-red-500 mb-3" />
              <h3 className="font-semibold text-secondary mb-2">My Interests</h3>
              <p className="text-2xl font-bold text-red-500" data-testid="text-my-interests-count">
                {myInterests.length}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => setActiveTab('interests')}
                data-testid="button-view-my-interests"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="mx-auto h-8 w-8 text-muted mb-3" />
              <h3 className="font-semibold text-secondary mb-2">Base Price</h3>
              <p className="text-2xl font-bold text-accent" data-testid="text-base-price">
                ${inspectorProfile.basePrice}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => setActiveTab('profile')}
                data-testid="button-edit-profile"
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="requests" data-testid="tab-open-requests">
              <Briefcase className="mr-2 h-4 w-4" />
              Open Requests
            </TabsTrigger>
            <TabsTrigger value="client-requests" data-testid="tab-client-requests">
              <Calendar className="mr-2 h-4 w-4" />
              Client Requests
            </TabsTrigger>
            <TabsTrigger value="interests" data-testid="tab-my-interests">
              <Heart className="mr-2 h-4 w-4" />
              My Interests
            </TabsTrigger>
            <TabsTrigger value="availability" data-testid="tab-availability">
              <Calendar className="mr-2 h-4 w-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <Settings className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-secondary">Recent Open Requests</h2>
              <Link href="/my-requests">
                <Button data-testid="button-view-all-open-requests">
                  <Plus className="mr-2 h-4 w-4" />
                  View All My Request
                </Button>
              </Link>
            </div>
            
            {openRequests.length === 0 ? (
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted mb-4" />
                  <h3 className="text-lg font-semibold text-secondary mb-2" data-testid="text-no-open-requests">
                    No open requests
                  </h3>
                  <p className="text-muted mb-4">
                    There are currently no inspection requests available.
                  </p>
                  <Link href="/requests">
                    <Button data-testid="button-browse-requests">Browse Requests</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openRequests.slice(0, 6).map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="client-requests" className="space-y-6">
            <h2 className="text-2xl font-semibold text-secondary">Client Requests for Me</h2>
            
            {clientRequests.length === 0 ? (
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted mb-4" />
                  <h3 className="text-lg font-semibold text-secondary mb-2" data-testid="text-no-client-requests">
                    No client requests yet
                  </h3>
                  <p className="text-muted mb-4">
                    Clients can book your available time slots directly. Make sure your availability is up to date.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('availability')}
                    data-testid="button-manage-availability"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Availability
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="interests" className="space-y-6">
            <h2 className="text-2xl font-semibold text-secondary">Requests I'm Interested In</h2>
            
            {myInterests.length === 0 ? (
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-12 text-center">
                  <Heart className="mx-auto h-12 w-12 text-muted mb-4" />
                  <h3 className="text-lg font-semibold text-secondary mb-2" data-testid="text-no-interests">
                    No interests yet
                  </h3>
                  <p className="text-muted mb-4">
                    Browse open requests and mark the ones you're interested in.
                  </p>
                  <Link href="/requests">
                    <Button data-testid="button-browse-for-interests">
                      <Heart className="mr-2 h-4 w-4" />
                      Browse Requests
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myInterests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <h2 className="text-2xl font-semibold text-secondary">Manage Your Availability</h2>
            <div className="max-w-4xl">
              <AvailabilityManager />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold text-secondary">Inspector Profile Settings</h2>
            <div className="max-w-2xl">
              <ProfileEditor />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}