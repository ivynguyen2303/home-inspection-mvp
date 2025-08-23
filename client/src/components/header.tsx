import { Link, useLocation } from "wouter";
import { MapPin } from "lucide-react";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="link-home">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <MapPin className="mr-2 h-6 w-6" />
                  InspectNow
                </h1>
              </Link>
            </div>
          </div>
          <nav className="flex space-x-8">
            {location === "/" ? (
              <Link 
                href="/inspectors" 
                className="text-secondary hover:text-primary font-medium transition-colors"
                data-testid="link-find-inspectors"
              >
                Find Inspectors
              </Link>
            ) : location.startsWith("/inspectors") ? (
              <>
                <Link 
                  href="/inspectors" 
                  className="text-secondary hover:text-primary font-medium transition-colors"
                  data-testid="link-back-to-inspectors"
                >
                  Back to Inspectors
                </Link>
                <Link 
                  href="/" 
                  className="text-secondary hover:text-primary font-medium transition-colors"
                  data-testid="link-home-nav"
                >
                  Home
                </Link>
              </>
            ) : (
              <Link 
                href="/" 
                className="text-secondary hover:text-primary font-medium transition-colors"
                data-testid="link-home-nav"
              >
                Home
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
