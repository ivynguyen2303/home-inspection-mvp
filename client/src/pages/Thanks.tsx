import { Link } from 'wouter';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Users, Clock } from 'lucide-react';

export default function Thanks() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-white rounded-xl shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-secondary mb-4" data-testid="text-thanks-title">
              Request Posted Successfully!
            </h1>
            
            <p className="text-lg text-muted mb-8 max-w-2xl mx-auto" data-testid="text-thanks-message">
              Your inspection request has been posted and is now visible to licensed inspectors in your area. 
              You should start receiving responses from interested inspectors soon.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-secondary">What Happens Next</h3>
                </div>
                <ul className="text-sm text-muted space-y-2">
                  <li>• Licensed inspectors can view your request</li>
                  <li>• Interested inspectors will mark their interest</li>
                  <li>• You'll be contacted directly by inspectors</li>
                  <li>• Choose the inspector that fits your needs</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Clock className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="font-semibold text-secondary">Response Timeline</h3>
                </div>
                <ul className="text-sm text-muted space-y-2">
                  <li>• Inspectors typically respond within 2-4 hours</li>
                  <li>• Most requests receive 3-5 responses</li>
                  <li>• Peak response times: 9 AM - 6 PM</li>
                  <li>• You can contact inspectors directly</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
              
              <Link href="/requests">
                <Button className="w-full sm:w-auto bg-primary hover:bg-blue-700" data-testid="button-view-requests">
                  View All Requests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-muted" data-testid="text-demo-note">
                <strong>Demo Note:</strong> This is a demonstration of the InspectNow platform. 
                In a real application, inspectors would receive notifications and contact you directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}