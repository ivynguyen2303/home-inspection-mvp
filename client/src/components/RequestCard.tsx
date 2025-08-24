import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InterestButton } from '@/components/InterestButton';
import { Request } from '@/store/localStore';
import { Calendar, MapPin, Home, DollarSign, Clock } from 'lucide-react';

interface RequestCardProps {
  request: Request;
}

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

export function RequestCard({ request }: RequestCardProps) {
  const truncateNotes = (notes: string, maxLength: number = 100) => {
    return notes.length > maxLength ? `${notes.substring(0, maxLength)}...` : notes;
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow" data-testid={`card-request-${request.id}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-secondary" data-testid={`text-request-location-${request.id}`}>
                {request.property.cityZip}
              </h3>
              {isNew(request.createdAt) && (
                <Badge className="bg-green-100 text-green-800 text-xs" data-testid={`badge-new-${request.id}`}>
                  New
                </Badge>
              )}
              <Badge 
                className={`text-xs ${
                  request.type === 'client_request' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}
                data-testid={`badge-request-type-${request.id}`}
              >
                {request.type === 'client_request' ? 'Client Request' : 'Open Request'}
              </Badge>
            </div>
            <p className="text-sm text-muted mb-1" data-testid={`text-request-client-${request.id}`}>
              {request.client.name} • {obfuscateEmail(request.client.email)}
            </p>
          </div>
          {request.budget && (
            <div className="text-right">
              <div className="flex items-center text-sm text-accent font-medium">
                <DollarSign className="w-4 h-4 mr-1" />
                <span data-testid={`text-request-budget-${request.id}`}>${request.budget}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted">
            <Calendar className="w-4 h-4 mr-2" />
            <span data-testid={`text-request-date-${request.id}`}>
              Preferred: {new Date(request.schedule.preferredDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted">
            <Home className="w-4 h-4 mr-2" />
            <span data-testid={`text-request-property-${request.id}`}>
              {request.property.type} • {request.property.beds}bd/{request.property.baths}ba
              {request.property.sqft && ` • ${request.property.sqft} sqft`}
            </span>
          </div>

          {request.notes && (
            <div className="text-sm text-muted">
              <span className="font-medium">Notes: </span>
              <span data-testid={`text-request-notes-${request.id}`}>
                {truncateNotes(request.notes)}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link href={`/requests/${request.id}`}>
              <Button variant="outline" size="sm" data-testid={`button-view-details-${request.id}`}>
                View Details
              </Button>
            </Link>
          </div>
          
          <InterestButton 
            key={`interest-${request.id}-${request.interestCount}`}
            requestId={request.id} 
            interestCount={request.interestCount}
          />
        </div>
      </CardContent>
    </Card>
  );
}