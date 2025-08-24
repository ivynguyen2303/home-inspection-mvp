import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/header';
import { RequestCard } from '@/components/RequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStore } from '@/store/localStore';
import { Search, Filter, Briefcase } from 'lucide-react';

export default function RequestsList() {
  const { requests, inspectorProfile } = useLocalStore();
  const [cityFilter, setCityFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [earliestDateFilter, setEarliestDateFilter] = useState('');

  // No mock data loading - only real requests

  const filteredRequests = useMemo(() => {
    return requests
      .filter(req => req.status === 'open')
      .filter(req => {
        // Show open requests to all inspectors, and client requests only to target inspector
        if (req.type === 'open_request') {
          return true; // All inspectors can see open requests
        } else if (req.type === 'client_request') {
          return req.targetInspectorId === inspectorProfile.id; // Only target inspector can see
        }
        return true;
      })
      .filter(req => {
        if (cityFilter) {
          return req.property.cityZip.toLowerCase().includes(cityFilter.toLowerCase());
        }
        return true;
      })
      .filter(req => {
        if (propertyTypeFilter && propertyTypeFilter !== 'all') {
          return req.property.type === propertyTypeFilter;
        }
        return true;
      })
      .filter(req => {
        if (earliestDateFilter) {
          return new Date(req.schedule.preferredDate) >= new Date(earliestDateFilter);
        }
        return true;
      })
      .sort((a, b) => new Date(a.schedule.preferredDate).getTime() - new Date(b.schedule.preferredDate).getTime());
  }, [requests, cityFilter, propertyTypeFilter, earliestDateFilter, inspectorProfile.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Directory Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center" data-testid="text-requests-title">
            <Briefcase className="mr-3 h-8 w-8" />
            Open Inspection Requests
          </h1>
          <p className="text-muted" data-testid="text-requests-subtitle">
            Browse and express interest in inspection requests from clients in your area
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-white rounded-xl shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Filter className="mr-2 h-5 w-5 text-muted" />
              <h3 className="text-lg font-semibold text-secondary">Filter Requests</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cityFilter">City/ZIP Code</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                  <Input
                    id="cityFilter"
                    placeholder="Search by city or ZIP"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="pl-10"
                    data-testid="input-city-filter"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="propertyTypeFilter">Property Type</Label>
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger className="mt-1" data-testid="select-property-type-filter">
                    <SelectValue placeholder="All property types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All property types</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Townhome">Townhome</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="earliestDateFilter">Earliest Date</Label>
                <Input
                  id="earliestDateFilter"
                  type="date"
                  value={earliestDateFilter}
                  onChange={(e) => setEarliestDateFilter(e.target.value)}
                  className="mt-1"
                  data-testid="input-earliest-date-filter"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted" data-testid="text-results-count">
            {filteredRequests.length} requests found
            {(cityFilter || propertyTypeFilter || earliestDateFilter) && ' (filtered)'}
          </p>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <Card className="bg-white rounded-xl shadow-lg">
            <CardContent className="p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted mb-4" />
              <h3 className="text-lg font-semibold text-secondary mb-2" data-testid="text-no-requests">
                No requests found
              </h3>
              <p className="text-muted">
                {cityFilter || propertyTypeFilter || earliestDateFilter 
                  ? 'Try adjusting your filters to see more requests.'
                  : 'No inspection requests are currently available.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}