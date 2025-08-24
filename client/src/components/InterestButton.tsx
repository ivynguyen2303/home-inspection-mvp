import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useLocalStore } from '@/store/localStore';

interface InterestButtonProps {
  requestId: string;
  interestCount: number;
  className?: string;
}

export function InterestButton({ requestId, interestCount, className }: InterestButtonProps) {
  const { inspectorProfile, toggleInterest, requests } = useLocalStore();
  
  const request = requests.find(r => r.id === requestId);
  const isInterested = request?.interestedInspectorIds.includes(inspectorProfile.id) || false;

  const handleToggle = () => {
    toggleInterest(requestId, inspectorProfile.id);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        onClick={handleToggle}
        variant={isInterested ? "default" : "outline"}
        size="sm"
        className={`flex items-center space-x-1 ${
          isInterested 
            ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
            : 'border-red-200 text-red-600 hover:bg-red-50'
        }`}
        data-testid={`button-interest-${requestId}`}
      >
        <Heart className={`w-4 h-4 ${isInterested ? 'fill-current' : ''}`} />
        <span>{isInterested ? 'Interested' : 'I\'m Interested'}</span>
      </Button>
      {interestCount > 0 && (
        <Badge variant="secondary" className="bg-red-100 text-red-800" data-testid={`badge-interest-count-${requestId}`}>
          {interestCount} interested
        </Badge>
      )}
    </div>
  );
}