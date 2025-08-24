import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";
import { useLocalStore } from "@/store/localStore";

export function Header() {
  const [location] = useLocation();
  const { role, setRole } = useLocalStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Start as logged in for demo

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginModal(true);
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    setIsLoggedIn(true);
  };

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
          <nav className="flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                <div className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded-full" data-testid="role-indicator">
                  {role === 'client' ? '👤 Client' : '🔍 Inspector'}
                </div>
                <div className="flex space-x-4">
                  {role === "client" ? (
                    <>
                      {location === "/" ? (
                        <>
                          <Link 
                            href="/inspectors" 
                            className="text-secondary hover:text-primary font-medium transition-colors"
                            data-testid="link-find-inspectors"
                          >
                            Find Inspectors
                          </Link>
                          <Link 
                            href="/post" 
                            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            data-testid="link-post-request"
                          >
                            Post Request
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link 
                            href="/" 
                            className="text-secondary hover:text-primary font-medium transition-colors"
                            data-testid="link-home-nav"
                          >
                            Home
                          </Link>
                          <Link 
                            href="/inspectors" 
                            className="text-secondary hover:text-primary font-medium transition-colors"
                            data-testid="link-find-inspectors"
                          >
                            Find Inspectors
                          </Link>
                          <Link 
                            href="/post" 
                            className="text-secondary hover:text-primary font-medium transition-colors"
                            data-testid="link-post-request"
                          >
                            Post Request
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/requests" 
                        className="text-secondary hover:text-primary font-medium transition-colors"
                        data-testid="link-view-requests"
                      >
                        View Requests
                      </Link>
                      <Link 
                        href="/inspector" 
                        className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        data-testid="link-inspector-dashboard"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-muted hover:text-secondary"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Switch Role
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-primary hover:bg-blue-700 text-white"
                data-testid="button-login"
              >
                Login
              </Button>
            )}
            
            <LoginModal open={showLoginModal} onClose={handleLoginClose} />
          </nav>
        </div>
      </div>
    </header>
  );
}
