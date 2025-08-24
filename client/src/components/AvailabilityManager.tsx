import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/store/localStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, Plus, Trash2, Edit } from 'lucide-react';

const timeSlotSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required')
});

type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

export function AvailabilityManager() {
  const { inspectorProfile, updateInspectorProfile } = useLocalStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  const form = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      date: '',
      startTime: '',
      endTime: ''
    }
  });

  const timeSlots = inspectorProfile.availability?.timeSlots || [];

  const addTimeSlot = (data: TimeSlotFormData) => {
    const newSlot = {
      id: `slot_${Date.now()}`,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      available: true
    };

    const updatedTimeSlots = [...timeSlots, newSlot];
    
    updateInspectorProfile({
      availability: {
        ...inspectorProfile.availability,
        nextAvailable: inspectorProfile.availability?.nextAvailable || 'This week',
        responseTime: inspectorProfile.availability?.responseTime || 'Within 4 hours',
        timeSlots: updatedTimeSlots
      }
    });

    toast({
      title: "Time Slot Added",
      description: `Added ${data.date} ${data.startTime}-${data.endTime}`,
    });

    form.reset();
    setDialogOpen(false);
  };

  const removeTimeSlot = (slotId: string) => {
    const updatedTimeSlots = timeSlots.filter(slot => slot.id !== slotId);
    
    updateInspectorProfile({
      availability: {
        ...inspectorProfile.availability,
        nextAvailable: inspectorProfile.availability?.nextAvailable || 'This week',
        responseTime: inspectorProfile.availability?.responseTime || 'Within 4 hours',
        timeSlots: updatedTimeSlots
      }
    });

    toast({
      title: "Time Slot Removed",
      description: "Time slot has been deleted from your availability",
    });
  };

  const toggleSlotAvailability = (slotId: string) => {
    const updatedTimeSlots = timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, available: !slot.available } : slot
    );
    
    updateInspectorProfile({
      availability: {
        ...inspectorProfile.availability,
        nextAvailable: inspectorProfile.availability?.nextAvailable || 'This week',
        responseTime: inspectorProfile.availability?.responseTime || 'Within 4 hours',
        timeSlots: updatedTimeSlots
      }
    });

    const slot = timeSlots.find(s => s.id === slotId);
    toast({
      title: slot?.available ? "Slot Made Unavailable" : "Slot Made Available",
      description: `${slot?.date} ${slot?.startTime}-${slot?.endTime} is now ${slot?.available ? 'unavailable' : 'available'}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Availability Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nextAvailable">Next Available</Label>
              <Input
                id="nextAvailable"
                value={inspectorProfile.availability?.nextAvailable || 'This week'}
                onChange={(e) => updateInspectorProfile({
                  availability: {
                    ...inspectorProfile.availability,
                    nextAvailable: e.target.value,
                    responseTime: inspectorProfile.availability?.responseTime || 'Within 4 hours',
                    timeSlots: timeSlots
                  }
                })}
                placeholder="e.g., This week, Tomorrow"
                data-testid="input-next-available"
              />
            </div>
            <div>
              <Label htmlFor="responseTime">Response Time</Label>
              <Input
                id="responseTime"
                value={inspectorProfile.availability?.responseTime || 'Within 4 hours'}
                onChange={(e) => updateInspectorProfile({
                  availability: {
                    ...inspectorProfile.availability,
                    nextAvailable: inspectorProfile.availability?.nextAvailable || 'This week',
                    responseTime: e.target.value,
                    timeSlots: timeSlots
                  }
                })}
                placeholder="e.g., Within 4 hours, Same day"
                data-testid="input-response-time"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Available Time Slots
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-time-slot">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Time Slot</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(addTimeSlot)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Mon Dec 30, Tue Jan 7" data-testid="input-slot-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 9:00 AM" data-testid="input-slot-start-time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 11:00 AM" data-testid="input-slot-end-time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-slot">
                        Cancel
                      </Button>
                      <Button type="submit" data-testid="button-save-slot">Add Time Slot</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted mb-4" />
              <h3 className="text-lg font-medium text-secondary mb-2">No time slots available</h3>
              <p className="text-muted mb-4">Add your available time slots so clients can book directly with you.</p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-slot">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Time Slot
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    slot.available 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted mr-3" />
                    <div>
                      <div className="font-medium text-secondary">{slot.date}</div>
                      <div className="text-sm text-muted">{slot.startTime} - {slot.endTime}</div>
                    </div>
                    <Badge 
                      variant={slot.available ? "default" : "secondary"}
                      className={`ml-3 ${slot.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {slot.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSlotAvailability(slot.id)}
                      data-testid={`button-toggle-${slot.id}`}
                    >
                      {slot.available ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`button-remove-${slot.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}