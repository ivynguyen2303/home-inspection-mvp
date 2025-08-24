import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/store/localStore';
import { X, Plus } from 'lucide-react';

export function ProfileEditor() {
  const { inspectorProfile, updateInspectorProfile } = useLocalStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    displayName: inspectorProfile.displayName,
    basePrice: inspectorProfile.basePrice.toString(),
    serviceAreas: inspectorProfile.serviceAreas,
    specialties: inspectorProfile.specialties
  });

  const [newServiceArea, setNewServiceArea] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    setFormData({
      displayName: inspectorProfile.displayName,
      basePrice: inspectorProfile.basePrice.toString(),
      serviceAreas: inspectorProfile.serviceAreas,
      specialties: inspectorProfile.specialties
    });
  }, [inspectorProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      displayName: formData.displayName,
      basePrice: parseInt(formData.basePrice) || 0,
      serviceAreas: formData.serviceAreas,
      specialties: formData.specialties
    };

    updateInspectorProfile(updates);
    
    toast({
      title: "Profile Updated",
      description: "Your inspector profile has been saved successfully.",
    });
  };

  const addServiceArea = () => {
    if (newServiceArea.trim() && !formData.serviceAreas.includes(newServiceArea.trim())) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, newServiceArea.trim()]
      }));
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(a => a !== area)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-secondary" data-testid="text-profile-title">
          Inspector Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="mt-1"
              data-testid="input-display-name"
            />
          </div>

          <div>
            <Label htmlFor="basePrice">Base Price ($)</Label>
            <Input
              id="basePrice"
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
              className="mt-1"
              min="0"
              data-testid="input-base-price"
            />
          </div>

          <div>
            <Label>Service Areas</Label>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.serviceAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1" data-testid={`badge-service-area-${index}`}>
                    {area}
                    <button
                      type="button"
                      onClick={() => removeServiceArea(area)}
                      className="ml-1 hover:text-red-500"
                      data-testid={`button-remove-area-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add service area"
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
                  data-testid="input-new-service-area"
                />
                <Button type="button" onClick={addServiceArea} size="sm" data-testid="button-add-service-area">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Specialties</Label>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1" data-testid={`badge-specialty-${index}`}>
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(specialty)}
                      className="ml-1 hover:text-red-500"
                      data-testid={`button-remove-specialty-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add specialty"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  data-testid="input-new-specialty"
                />
                <Button type="button" onClick={addSpecialty} size="sm" data-testid="button-add-specialty">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" data-testid="button-save-profile">
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}