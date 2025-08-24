import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocalStore, Role } from '@/store/localStore';
import { User, Search, Shield, Briefcase } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { setRole } = useLocalStore();

  const handleRoleSelect = (role: Role) => {
    setRole(role);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-secondary" data-testid="text-login-title">
            Welcome to InspectNow
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-muted mb-6" data-testid="text-login-subtitle">
            Choose your role to get started
          </p>
          
          <div className="grid gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => handleRoleSelect('client')}
              data-testid="card-client-role"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">I'm a Client</h3>
                <p className="text-sm text-muted">
                  Looking for a home inspector to evaluate my property
                </p>
                <div className="mt-4 space-y-1 text-xs text-muted">
                  <div className="flex items-center justify-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Find licensed inspectors
                  </div>
                  <div className="flex items-center justify-center">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Post inspection requests
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
              onClick={() => handleRoleSelect('inspector')}
              data-testid="card-inspector-role"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">I'm an Inspector</h3>
                <p className="text-sm text-muted">
                  Licensed home inspector looking for inspection jobs
                </p>
                <div className="mt-4 space-y-1 text-xs text-muted">
                  <div className="flex items-center justify-center">
                    <Search className="w-3 h-3 mr-1" />
                    Browse inspection requests
                  </div>
                  <div className="flex items-center justify-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Manage your profile
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-xs text-muted">
              Demo Mode: You can switch roles anytime for demonstration purposes
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}