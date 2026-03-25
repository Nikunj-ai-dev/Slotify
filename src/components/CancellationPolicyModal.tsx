import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Clock, CreditCard, Info } from 'lucide-react';

interface CancellationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CancellationPolicyModal: React.FC<CancellationPolicyModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-8 sm:p-12">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cancellation Policy</h2>
              <p className="text-slate-500 font-medium">Fair terms for you and our specialists.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-50 rounded-xl text-green-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Free Cancellation</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cancel or reschedule at least 24 hours before your appointment for a full refund.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Late Cancellation</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cancellations made within 24 hours of the appointment will incur a 50% fee.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-red-50 rounded-xl text-red-600 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">No-Show Policy</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Failing to show up without notice will result in a 100% charge of the service price.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">How to Manage</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Go to "My Bookings" to reschedule or cancel your appointment instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              * We understand that emergencies happen. If you have a special circumstance, 
              please contact our support team directly at support@slotify.com or call us at +1 (555) 000-0000.
            </p>
          </div>

          <div className="mt-10">
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
