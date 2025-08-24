import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthProvider';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="bg-white shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-secondary mb-4" data-testid="text-forbidden-title">
              Access Forbidden
            </h1>
            
            <p className="text-muted mb-6" data-testid="text-forbidden-message">
              You don't have permission to access this page. This area is restricted to {user?.role === 'client' ? 'inspectors' : 'clients'} only.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full sm:w-auto"
                data-testid="button-go-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Link href="/">
                <Button className="w-full sm:w-auto" data-testid="button-home">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>

            {user && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-muted" data-testid="text-user-info">
                  Signed in as: {user.email} ({user.role})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}