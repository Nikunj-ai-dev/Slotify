import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Smartphone,
  ArrowRight,
  Home,
  History as HistoryIcon,
  X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Service, Staff } from '../types';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToHistory: () => void;
  onGoHome: () => void;
  bookingDetails: {
    service: Service;
    staff: Staff;
    date: Date;
    slot: { start: string; end: string };
    email: string;
    phone: string;
  };
}

export function BookingConfirmationModal({ 
  isOpen, 
  onClose, 
  onGoToHistory, 
  onGoHome,
  bookingDetails 
}: BookingConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-8 sm:p-10">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed!</h2>
            <p className="text-slate-500 mt-2 font-medium">Your appointment is all set and confirmed.</p>
          </div>

          {/* Details Summary */}
          <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialist</p>
                <p className="font-bold text-slate-900">{bookingDetails.staff.name}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                <p className="font-bold text-slate-900">{format(bookingDetails.date, 'EEEE, MMMM do, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                <p className="font-bold text-slate-900">{bookingDetails.slot.start} - {bookingDetails.slot.end}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</p>
                <p className="font-bold text-slate-900">{bookingDetails.service.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid</p>
                <p className="text-xl font-black text-blue-600">${bookingDetails.service.price}</p>
              </div>
            </div>
          </div>

          {/* Notification Badges */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            <div className="flex items-center space-x-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Email Sent</span>
            </div>
            <div className="flex items-center space-x-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">SMS Sent</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onGoToHistory}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center group"
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              View My Bookings
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
            <button 
              onClick={onGoHome}
              className="flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
