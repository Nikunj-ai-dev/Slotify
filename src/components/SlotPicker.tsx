import React from 'react';
import { format, addMinutes, parse, isBefore, startOfToday, isSameDay } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Booking, Service, Staff, BlockedSlot } from '../types';
import { WORKING_HOURS } from '../constants';

interface SlotPickerProps {
  selectedDate: Date;
  selectedService: Service;
  selectedStaff: Staff;
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
  onSelect: (startTime: string, endTime: string) => void;
  selectedStartTime: string | null;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  selectedDate,
  selectedService,
  selectedStaff,
  bookings,
  blockedSlots,
  onSelect,
  selectedStartTime,
}) => {
  const slots = React.useMemo(() => {
    const generatedSlots: { start: string; end: string; status: 'available' | 'booked' | 'blocked' | 'past' }[] = [];
    let currentTime = parse(WORKING_HOURS.start, 'HH:mm', selectedDate);
    const endTime = parse(WORKING_HOURS.end, 'HH:mm', selectedDate);
    const now = new Date();

    while (isBefore(currentTime, endTime)) {
      const slotStartStr = format(currentTime, 'HH:mm');
      const slotEnd = addMinutes(currentTime, selectedService.duration);
      const slotEndStr = format(slotEnd, 'HH:mm');

      if (isBefore(endTime, slotEnd)) break;

      let status: 'available' | 'booked' | 'blocked' | 'past' = 'available';

      // Check if past
      if (isSameDay(selectedDate, now) && isBefore(currentTime, now)) {
        status = 'past';
      }

      // Check if booked
      const isBooked = bookings.some(b => 
        b.date === format(selectedDate, 'yyyy-MM-dd') && 
        b.staffId === selectedStaff.id &&
        b.status !== 'Cancelled' &&
        ((slotStartStr >= b.startTime && slotStartStr < b.endTime) ||
         (slotEndStr > b.startTime && slotEndStr <= b.endTime) ||
         (b.startTime >= slotStartStr && b.startTime < slotEndStr))
      );
      if (isBooked) status = 'booked';

      // Check if blocked by admin
      const isBlocked = blockedSlots.some(bs => 
        bs.date === format(selectedDate, 'yyyy-MM-dd') && 
        bs.staffId === selectedStaff.id &&
        ((slotStartStr >= bs.startTime && slotStartStr < bs.endTime) ||
         (slotEndStr > bs.startTime && slotEndStr <= bs.endTime) ||
         (bs.startTime >= slotStartStr && bs.startTime < slotEndStr))
      );
      if (isBlocked) status = 'blocked';

      generatedSlots.push({ start: slotStartStr, end: slotEndStr, status });
      
      // Move to next slot with buffer
      currentTime = addMinutes(slotEnd, WORKING_HOURS.buffer);
    }

    return generatedSlots;
  }, [selectedDate, selectedService, selectedStaff, bookings, blockedSlots]);

  const availableCount = slots.filter(s => s.status === 'available').length;

  // Auto-select first available slot
  React.useEffect(() => {
    if (!selectedStartTime && availableCount > 0) {
      const firstAvailable = slots.find(s => s.status === 'available');
      if (firstAvailable) {
        onSelect(firstAvailable.start, firstAvailable.end);
      }
    }
  }, [availableCount, selectedStartTime, onSelect, slots]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
          <Clock className="w-3 h-3 mr-1" /> Available Slots
        </h3>
        {availableCount <= 3 && availableCount > 0 ? (
          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
            Only {availableCount} left!
          </span>
        ) : availableCount > 0 ? (
          <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
            Plenty of slots
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot, idx) => (
          <button
            key={idx}
            disabled={slot.status !== 'available'}
            onClick={() => onSelect(slot.start, slot.end)}
            className={cn(
              "py-3 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center",
              slot.status === 'past' && "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-50",
              slot.status === 'booked' && "bg-red-50 text-red-300 border-red-100 cursor-not-allowed",
              slot.status === 'blocked' && "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed",
              slot.status === 'available' && selectedStartTime === slot.start ? 
                "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105" :
                slot.status === 'available' ? "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50" : ""
            )}
          >
            <span>{slot.start}</span>
            {slot.status === 'booked' && <span className="text-[8px] mt-0.5 uppercase tracking-tighter">Booked</span>}
            {slot.status === 'blocked' && <span className="text-[8px] mt-0.5 uppercase tracking-tighter">Blocked</span>}
          </button>
        ))}
      </div>

      {availableCount === 0 && (
        <div className="bg-red-50 p-4 rounded-2xl flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs font-medium">No slots available for this staff on this day. Try another staff or date.</p>
        </div>
      )}
    </div>
  );
};
