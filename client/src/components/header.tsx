import { Link, useLocation } from "wouter";
import { MapPin, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/auth/AuthProvider";

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="link-home">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <MapPin className="mr-2 h-6 w-6" />
                  Lumina
                </h1>
              </Link>
            </div>
          </div>
          <nav className="flex items-center space-x-6">
            {!user ? (
              <div className="flex space-x-3">
                <Link href="/login">
                  <Button variant="outline" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-blue-700" data-testid="button-signup">
                    Create Account
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Role-specific navigation */}
                <div className="flex space-x-3">
                  {user.role === "client" ? (
                    <>
                      <Link 
                        href="/inspectors" 
                        className="bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                        data-testid="link-find-inspectors"
                      >
                        Find Inspectors
                      </Link>
                      <Link 
                        href="/my-requests" 
                        className="bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                        data-testid="link-my-requests"
                      >
                        My Requests
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/requests" 
                        className="bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                        data-testid="link-view-requests"
                      >
                        View Requests
                      </Link>
                      <Link 
                        href="/inspector" 
                        className="bg-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                        data-testid="link-inspector-dashboard"
                      >
                        Dashboard
                      </Link>
                    </>
                  )}
                </div>
                
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Hi, {user.name || user.email.split('@')[0]}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs capitalize ${
                          user.role === 'client' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center w-full" data-testid="link-account">
                        <User className="mr-2 h-4 w-4" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
