import React from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isBefore,
  startOfToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Booking } from '../types';

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  bookings: Booking[];
  staffCount: number;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelect, bookings, staffCount }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'Cancelled');
    const totalSlots = staffCount * 15; // Approx 15 slots per day per staff
    const ratio = dayBookings.length / totalSlots;

    if (ratio >= 0.9) return 'full';
    if (ratio >= 0.6) return 'busy';
    return 'available';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex space-x-1">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isPast = isBefore(day, startOfToday());
          const isCurrentMonth = isSameMonth(day, monthStart);
          const status = getDayStatus(day);
          const isFull = status === 'full';
          const isBusy = status === 'busy';

          return (
            <button
              key={idx}
              disabled={isPast || !isCurrentMonth || isFull}
              onClick={() => onSelect(day)}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all relative",
                !isCurrentMonth && "text-slate-200 cursor-default",
                isPast && isCurrentMonth && "text-slate-300 cursor-not-allowed",
                isFull && isCurrentMonth && "bg-red-50 text-red-300 cursor-not-allowed",
                isBusy && isCurrentMonth && !isSelected && "bg-amber-50 text-amber-600",
                isCurrentMonth && !isPast && !isFull && !isBusy && "hover:bg-blue-50 hover:text-blue-600",
                isSelected && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md shadow-blue-100 scale-105 z-10",
                isToday && !isSelected && "text-blue-600 font-bold"
              )}
            >
              {format(day, 'd')}
              {isToday && !isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-blue-600 rounded-full" />
              )}
              {isFull && isCurrentMonth && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full border border-white" />
              )}
              {isBusy && isCurrentMonth && !isFull && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full border border-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
