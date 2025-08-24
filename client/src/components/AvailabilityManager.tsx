import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/store/localStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

const timeSlotSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  startHour: z.string().min(1, 'Start hour is required'),
  startPeriod: z.enum(['AM', 'PM']),
  endHour: z.string().min(1, 'End hour is required'),
  endPeriod: z.enum(['AM', 'PM']),
  repeat: z.enum(['none', 'daily', 'weekly', 'biweekly', 'monthly']),
  endDate: z.date().optional()
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
      date: undefined,
      startHour: '',
      startPeriod: 'AM',
      endHour: '',
      endPeriod: 'AM',
      repeat: 'none',
      endDate: undefined
    }
  });

  const timeSlots = inspectorProfile.availability?.timeSlots || [];

  const convertTo24Hour = (hour: string, period: 'AM' | 'PM') => {
    const hourNum = parseInt(hour);
    if (period === 'AM') {
      return hourNum === 12 ? '00:00' : `${hourNum.toString().padStart(2, '0')}:00`;
    } else {
      return hourNum === 12 ? '12:00' : `${(hourNum + 12).toString().padStart(2, '0')}:00`;
    }
  };

  const convertTo12Hour = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    if (hourNum === 0) return { hour: '12', period: 'AM' };
    if (hourNum < 12) return { hour: hourNum.toString(), period: 'AM' };
    if (hourNum === 12) return { hour: '12', period: 'PM' };
    return { hour: (hourNum - 12).toString(), period: 'PM' };
  };

  const generateRecurringSlots = (data: TimeSlotFormData) => {
    const startTime = convertTo24Hour(data.startHour, data.startPeriod);
    const endTime = convertTo24Hour(data.endHour, data.endPeriod);
    const slots = [];
    
    let currentDate = new Date(data.date);
    const endDate = data.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // Default 3 months
    
    while (currentDate <= endDate) {
      slots.push({
        id: `slot_${Date.now()}_${currentDate.getTime()}`,
        date: format(currentDate, 'yyyy-MM-dd'),
        startTime,
        endTime,
        available: true
      });
      
      // Calculate next occurrence based on repeat type
      switch (data.repeat) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          // 'none' - only create one slot
          break;
      }
      
      // Prevent infinite loop for 'none' repeat
      if (data.repeat === 'none') break;
    }
    
    return slots;
  };

  const addTimeSlot = (data: TimeSlotFormData) => {
    const newSlots = generateRecurringSlots(data);
    const updatedTimeSlots = [...timeSlots, ...newSlots];
    
    updateInspectorProfile({
      availability: {
        ...inspectorProfile.availability,
        nextAvailable: inspectorProfile.availability?.nextAvailable || 'This week',
        responseTime: inspectorProfile.availability?.responseTime || 'Within 4 hours',
        timeSlots: updatedTimeSlots
      }
    });

    const slotCount = newSlots.length;
    toast({
      title: slotCount > 1 ? "Recurring Time Slots Added" : "Time Slot Added",
      description: slotCount > 1 
        ? `Added ${slotCount} ${data.repeat} slots starting ${format(data.date, 'MMM dd, yyyy')}`
        : `Added ${format(data.date, 'MMM dd, yyyy')} ${data.startHour}:00 ${data.startPeriod}-${data.endHour}:00 ${data.endPeriod}`,
    });

    form.reset({
      date: undefined,
      startHour: '',
      startPeriod: 'AM',
      endHour: '',
      endPeriod: 'AM',
      repeat: 'none',
      endDate: undefined
    });
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
              <CalendarIcon className="mr-2 h-5 w-5" />
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
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                  data-testid="button-slot-date"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="startHour"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Hour</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-start-hour">
                                    <SelectValue placeholder="Hour" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                    <SelectItem key={hour} value={hour.toString()}>
                                      {hour}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="startPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-start-period">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AM">AM</SelectItem>
                                  <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="endHour"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Hour</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-end-hour">
                                    <SelectValue placeholder="Hour" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                    <SelectItem key={hour} value={hour.toString()}>
                                      {hour}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-end-period">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AM">AM</SelectItem>
                                  <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="repeat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repeat</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-repeat">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">One time only</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch('repeat') !== 'none' && (
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Repeat Until (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                      data-testid="button-end-date"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Select end date (default: 3 months)</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
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
              <CalendarIcon className="mx-auto h-12 w-12 text-muted mb-4" />
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
                    <CalendarIcon className="h-4 w-4 text-muted mr-3" />
                    <div>
                      <div className="font-medium text-secondary">
                        {new Date(slot.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-muted">
                        {(() => {
                          const start = convertTo12Hour(slot.startTime);
                          const end = convertTo12Hour(slot.endTime);
                          return `${start.hour}:00 ${start.period} - ${end.hour}:00 ${end.period}`;
                        })()}
                      </div>
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