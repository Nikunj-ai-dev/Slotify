import React, { useState, useEffect, useMemo } from 'react';
import { format, isBefore, parseISO, isAfter, startOfToday, addMinutes } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  User, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Mail,
  ArrowLeft,
  LayoutDashboard,
  Settings,
  BarChart3,
  Search,
  Plus,
  Trash2,
  X,
  CreditCard,
  Smartphone,
  ShieldCheck,
  History,
  LogOut,
  ChevronRight,
  Star,
  Zap,
  Info,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Booking, Service, Staff, UserProfile, BlockedSlot, Review } from './types';
import { INITIAL_SERVICES, INITIAL_STAFF } from './constants';
import { Calendar } from './components/Calendar';
import { SlotPicker } from './components/SlotPicker';
import { Analytics } from './components/Analytics';
import { Home } from './components/Home';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { ReviewModal } from './components/ReviewModal';
import { CancellationPolicyModal } from './components/CancellationPolicyModal';

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<'home' | 'book' | 'history' | 'admin' | 'analytics'>('home');
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [selectedService, setSelectedService] = useState<Service>(INITIAL_SERVICES[0]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    id: 'u1',
    name: '',
    phone: '',
    email: ''
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<'success' | 'error' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | null>(null);
  const [adminTab, setAdminTab] = useState<'bookings' | 'services' | 'staff' | 'blocked'>('bookings');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [activeBookingForReview, setActiveBookingForReview] = useState<Booking | null>(null);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem('slotify_bookings');
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedReviews = localStorage.getItem('slotify_reviews');
      if (savedReviews) setReviews(JSON.parse(savedReviews));

      const savedBlocked = localStorage.getItem('slotify_blocked');
      if (savedBlocked) setBlockedSlots(JSON.parse(savedBlocked));

      const savedUser = localStorage.getItem('slotify_user');
      if (savedUser) setFormData(JSON.parse(savedUser));

      const savedServices = localStorage.getItem('slotify_services');
      if (savedServices) setServices(JSON.parse(savedServices));

      const savedStaff = localStorage.getItem('slotify_staff');
      if (savedStaff) setStaff(JSON.parse(savedStaff));
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage
  const saveBookings = (updated: Booking[]) => {
    setBookings(updated);
    localStorage.setItem('slotify_bookings', JSON.stringify(updated));
  };

  const saveReviews = (updated: Review[]) => {
    setReviews(updated);
    localStorage.setItem('slotify_reviews', JSON.stringify(updated));
  };

  const saveBlocked = (updated: BlockedSlot[]) => {
    setBlockedSlots(updated);
    localStorage.setItem('slotify_blocked', JSON.stringify(updated));
  };

  const saveServices = (updated: Service[]) => {
    setServices(updated);
    localStorage.setItem('slotify_services', JSON.stringify(updated));
  };

  const saveStaff = (updated: Staff[]) => {
    setStaff(updated);
    localStorage.setItem('slotify_staff', JSON.stringify(updated));
  };

  const saveUser = (user: UserProfile) => {
    setFormData(user);
    localStorage.setItem('slotify_user', JSON.stringify(user));
  };

  // Auto-complete bookings and calculate ratings
  useEffect(() => {
    const now = new Date();
    const updated = bookings.map(b => {
      const service = services.find(s => s.id === b.serviceId);
      const bookingEnd = addMinutes(parseISO(`${b.date}T${b.startTime}`), service?.duration || 0);
      if (b.status === 'Upcoming' && isAfter(now, bookingEnd)) {
        return { ...b, status: 'Completed' as const };
      }
      return b;
    });
    
    if (JSON.stringify(updated) !== JSON.stringify(bookings)) {
      saveBookings(updated);
    }
  }, [bookings, services]);

  const getStaffRating = (staffId: string) => {
    const staffReviews = reviews.filter(r => r.staffId === staffId);
    if (staffReviews.length === 0) return 5.0;
    const sum = staffReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / staffReviews.length).toFixed(1));
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    if (!activeBookingForReview) return;
    
    const newReview: Review = {
      id: 'rev' + Date.now(),
      bookingId: activeBookingForReview.id,
      staffId: activeBookingForReview.staffId,
      userId: activeBookingForReview.userId,
      userName: activeBookingForReview.userName,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    saveReviews([...reviews, newReview]);
    saveBookings(bookings.map(b => b.id === activeBookingForReview.id ? { ...b, hasReview: true } : b));
    setIsReviewModalOpen(false);
    setActiveBookingForReview(null);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !selectedStaff) return;
    
    setIsBooking(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment/booking

    if (rescheduleId) {
      const updatedBookings = bookings.map(b => b.id === rescheduleId ? {
        ...b,
        staffId: selectedStaff.id,
        serviceId: selectedService.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        price: selectedService.price,
        status: 'Upcoming' as const
      } : b);
      saveBookings(updatedBookings);
      setRescheduleId(null);
    } else {
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        userId: formData.id,
        staffId: selectedStaff.id,
        serviceId: selectedService.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        status: 'Upcoming',
        price: selectedService.price,
        userName: formData.name,
        userPhone: formData.phone,
        userEmail: formData.email,
        createdAt: new Date().toISOString()
      };
      saveBookings([...bookings, newBooking]);
    }
    saveUser(formData);
    setBookingResult('success');
    setIsBooking(false);
  };

  const cancelBooking = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' as const } : b);
    saveBookings(updated);
  };

  const filteredStaff = useMemo(() => {
    if (!selectedService) return [];
    return staff.filter(s => s.availableServices.includes(selectedService.name));
  }, [staff, selectedService]);

  const groupedServices = useMemo(() => {
    const groups: Record<string, Service[]> = {};
    services.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [services]);

  const handleBack = () => {
    if (bookingResult) {
      setBookingResult(null);
      setStep(0);
      setSelectedDate(null);
      setSelectedSlot(null);
      setSelectedStaff(null);
      setRescheduleId(null);
    } else {
      setStep(s => Math.max(0, s - 1));
    }
  };

  const resetBookingState = () => {
    setBookingResult(null);
    setStep(0);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedStaff(null);
    setRescheduleId(null);
    setPaymentMethod(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Navigation */}
      <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 px-4 py-3 sm:px-8 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => { setView('home'); setStep(0); }}
        >
          <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
            <CalendarIcon className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Slotify</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-4">
          <button 
            onClick={() => { setView('home'); setStep(0); }}
            className={cn("p-2 rounded-xl transition-all flex items-center space-x-2", view === 'home' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50")}
          >
            <Zap className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-bold">Home</span>
          </button>
          <button 
            onClick={() => { setView('book'); setStep(0); }}
            className={cn("p-2 rounded-xl transition-all flex items-center space-x-2", view === 'book' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50")}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-bold">Book</span>
          </button>
          <button 
            onClick={() => setView('history')}
            className={cn("p-2 rounded-xl transition-all flex items-center space-x-2", view === 'history' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50")}
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-bold">My Bookings</span>
          </button>
          <button 
            onClick={() => setView('admin')}
            className={cn("p-2 rounded-xl transition-all flex items-center space-x-2", view === 'admin' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50")}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-bold">Admin</span>
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={cn("p-2 rounded-xl transition-all flex items-center space-x-2", view === 'analytics' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50")}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-bold">Stats</span>
          </button>
        </div>
      </nav>

      <main className="w-full max-w-5xl p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Home 
                onStartBooking={() => setView('book')} 
                onViewAdmin={() => setView('admin')} 
              />
            </motion.div>
          )}

          {view === 'book' && (
            <motion.div 
              key="book" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 sm:p-10">
                  {/* Progress Bar */}
                  <div className="flex items-center justify-between mb-10 px-4">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                          step > s ? "bg-green-500 text-white" : step === s ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" : "bg-slate-100 text-slate-400"
                        )}>
                          {step > s ? <CheckCircle2 className="w-4 h-4" /> : s + 1}
                        </div>
                        {s < 4 && (
                          <div className={cn("h-1 flex-1 mx-2 rounded-full transition-all duration-500", step > s ? "bg-green-500" : "bg-slate-100")} />
                        )}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 0: Service Selection */}
                    {step === 0 && (
                      <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Choose a Service</h2>
                          <p className="text-slate-500 text-sm mt-1">Select the treatment or session you'd like to book.</p>
                        </div>
                        
                        <div className="space-y-8">
                          {Object.entries(groupedServices).map(([category, categoryServices]) => (
                            <div key={category} className="space-y-4">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{category}</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(categoryServices as Service[]).map(service => (
                                  <button
                                    key={service.id}
                                    onClick={() => { setSelectedService(service); setStep(1); }}
                                    className={cn(
                                      "p-5 rounded-3xl border-2 text-left transition-all group relative overflow-hidden",
                                      selectedService.id === service.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                                    )}
                                  >
                                    <div className={cn("w-10 h-10 rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg", service.color)}>
                                      <Briefcase className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{service.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{service.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                      <span className="text-sm font-black text-slate-900">${service.price}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{service.duration} mins</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Staff Selection */}
                    {step === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center space-x-3">
                          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500" /></button>
                          <h2 className="text-2xl font-bold text-slate-900">Select Specialist</h2>
                        </div>
                        <div className="space-y-3">
                          {filteredStaff.map(staff => (
                            <button
                              key={staff.id}
                              onClick={() => { setSelectedStaff(staff); setStep(2); }}
                              className={cn(
                                "w-full p-4 rounded-3xl border-2 flex items-center space-x-4 transition-all",
                                selectedStaff?.id === staff.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                              )}
                            >
                              <img src={staff.avatar} alt={staff.name} className="w-14 h-14 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
                              <div className="flex-1 text-left">
                                <h3 className="font-bold text-slate-900">{staff.name}</h3>
                                <p className="text-xs text-slate-500">{staff.role}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="text-xs font-bold text-amber-700">{getStaffRating(staff.id)}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1">({reviews.filter(r => r.staffId === staff.id).length} reviews)</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Date & Time */}
                    {step === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <div className="flex items-center space-x-3">
                          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500" /></button>
                          <h2 className="text-2xl font-bold text-slate-900">Pick Date & Time</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} bookings={bookings} staffCount={staff.length} />
                          {selectedDate && selectedStaff && (
                            <SlotPicker 
                              selectedDate={selectedDate} 
                              selectedService={selectedService} 
                              selectedStaff={selectedStaff} 
                              bookings={bookings} 
                              blockedSlots={blockedSlots}
                              selectedStartTime={selectedSlot?.start || null}
                              onSelect={(start, end) => { setSelectedSlot({ start, end }); setStep(3); }}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: User Details */}
                    {step === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex items-center space-x-3">
                          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500" /></button>
                          <h2 className="text-2xl font-bold text-slate-900">Your Information</h2>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><User className="w-3 h-3 mr-1" /> Full Name</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><Phone className="w-3 h-3 mr-1" /> Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center"><Mail className="w-3 h-3 mr-1" /> Email Address</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                          </div>
                        </div>
                        <button disabled={!formData.name || !formData.phone || !formData.email} onClick={() => setStep(4)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200">Continue to Payment</button>
                      </motion.div>
                    )}

                    {/* Step 4: Payment & Confirm */}
                    {step === 4 && (
                      <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        {!bookingResult ? (
                          <>
                            <div className="flex items-center space-x-3">
                              <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500" /></button>
                              <h2 className="text-2xl font-bold text-slate-900">Secure Payment</h2>
                            </div>
                            
                            <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4 border border-slate-100">
                              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service</span><span className="text-sm font-bold text-slate-900">{selectedService.name}</span></div>
                              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Specialist</span><span className="text-sm font-bold text-slate-900">{selectedStaff?.name}</span></div>
                              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</span><span className="text-sm font-bold text-slate-900">{selectedDate ? format(selectedDate, 'MMM do') : ''} @ {selectedSlot?.start}</span></div>
                              <div className="pt-4 border-t border-slate-200 flex justify-between items-center"><span className="text-lg font-bold text-slate-900">Total Amount</span><span className="text-2xl font-black text-blue-600">${selectedService.price}</span></div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Payment Method</p>
                              <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setPaymentMethod('card')} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center space-y-2 transition-all", paymentMethod === 'card' ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-blue-200")}>
                                  <CreditCard className="w-6 h-6 text-slate-600" />
                                  <span className="text-xs font-bold">Credit Card</span>
                                </button>
                                <button onClick={() => setPaymentMethod('upi')} className={cn("p-4 rounded-2xl border-2 flex flex-col items-center space-y-2 transition-all", paymentMethod === 'upi' ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-blue-200")}>
                                  <Smartphone className="w-6 h-6 text-slate-600" />
                                  <span className="text-xs font-bold">UPI / Phone</span>
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-3">
                              <button disabled={!paymentMethod || isBooking} onClick={handleBooking} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center">
                                {isBooking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><ShieldCheck className="w-4 h-4 mr-2" /> Pay & Confirm</>}
                              </button>
                              <button 
                                onClick={() => setIsPolicyModalOpen(true)}
                                className="flex items-center justify-center space-x-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Info className="w-3 h-3" />
                                <span>View Cancellation Policy</span>
                              </button>
                            </div>
                          </>
                        ) : bookingResult === 'success' ? (
                          <div className="text-center py-12 space-y-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                              <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-black text-slate-900">Booking Finalized!</h2>
                              <p className="text-slate-500 mt-2">Your appointment has been successfully scheduled.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                              <button 
                                onClick={() => { setView('history'); resetBookingState(); }}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all"
                              >
                                View My Bookings
                              </button>
                              <button 
                                onClick={() => { setView('home'); resetBookingState(); }}
                                className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                              >
                                Back to Home
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 space-y-8">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-inner"><AlertCircle className="w-12 h-12 text-red-600" /></div>
                            <div><h2 className="text-3xl font-black text-slate-900">Slot Taken</h2><p className="text-slate-500 mt-2">Someone just booked this slot. Please try another time.</p></div>
                            <button onClick={handleBack} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-slate-800 transition-all">Try Another Slot</button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">My Booking History</h2>
              {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100">
                  <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No bookings found yet.</p>
                  <button onClick={() => setView('book')} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Book your first appointment</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(booking => {
                    const staffMember = staff.find(s => s.id === booking.staffId);
                    const service = services.find(s => s.id === booking.serviceId);
                    const isUpcoming = booking.status === 'Upcoming' && !isBefore(parseISO(booking.date), startOfToday());
                    
                    return (
                      <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <img src={staffMember?.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                            <div>
                              <h3 className="font-bold text-slate-900">{service?.name}</h3>
                              <p className="text-xs text-slate-500">with {staffMember?.name}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            booking.status === 'Upcoming' ? "bg-blue-50 text-blue-600" : 
                            booking.status === 'Completed' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                          )}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 p-3 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                            <p className="text-sm font-bold text-slate-700">{format(parseISO(booking.date), 'MMM do, yyyy')}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                            <p className="text-sm font-bold text-slate-700">{booking.startTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          {isUpcoming && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedService(service!);
                                  setSelectedStaff(staffMember!);
                                  setSelectedDate(parseISO(booking.date));
                                  setRescheduleId(booking.id);
                                  setStep(2);
                                  setView('book');
                                }}
                                className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                              >
                                Reschedule
                              </button>
                              <button 
                                onClick={() => cancelBooking(booking.id)}
                                className="px-4 py-3 bg-white text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          
                          {booking.status === 'Completed' && !booking.hasReview && (
                            <button 
                              onClick={() => {
                                setActiveBookingForReview(booking);
                                setIsReviewModalOpen(true);
                              }}
                              className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center"
                            >
                              <MessageSquare className="w-3 h-3 mr-2" />
                              Leave a Review
                            </button>
                          )}

                          {booking.hasReview && (
                            <div className="flex items-center justify-center py-2 text-[10px] font-bold text-green-600 bg-green-50 rounded-xl">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Review Submitted
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
                <div className="flex space-x-2">
                  <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-slate-600">Live System</span>
                  </div>
                </div>
              </div>

              {/* Admin Tabs */}
              <div className="flex space-x-1 bg-white p-1 rounded-2xl border border-slate-100 w-fit">
                {(['bookings', 'services', 'staff', 'blocked'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAdminTab(tab)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                      adminTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {adminTab === 'bookings' && (
                  <>
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">All Bookings</h3>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search bookings..." className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {bookings.map(booking => {
                            const staffMember = staff.find(s => s.id === booking.staffId);
                            const service = services.find(s => s.id === booking.serviceId);
                            return (
                              <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-900">{booking.userName}</p>
                                  <p className="text-[10px] text-slate-500">{booking.userEmail}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-600">{service?.name}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-600">{staffMember?.name}</td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-900">{booking.date}</p>
                                  <p className="text-[10px] text-slate-500">{booking.startTime} - {booking.endTime}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-900">${booking.price}</td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter",
                                    booking.status === 'Upcoming' ? "bg-blue-50 text-blue-600" : 
                                    booking.status === 'Completed' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                  )}>
                                    {booking.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {adminTab === 'services' && (
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Manage Services</h3>
                      <button 
                        onClick={() => {
                          const name = prompt('Service Name?');
                          if (!name) return;
                          const newService: Service = {
                            id: 's' + Date.now(),
                            name: name as any,
                            duration: Number(prompt('Duration (mins)?', '45')),
                            price: Number(prompt('Price ($)?', '50')),
                            description: prompt('Description?', 'New service description'),
                            category: (prompt('Category?', 'Hair Services') || 'Hair Services') as any,
                            color: 'bg-blue-500'
                          };
                          saveServices([...services, newService]);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Service</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {services.map(s => (
                        <div key={s.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", s.color)}>
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{s.name}</p>
                              <p className="text-[10px] text-slate-500">{s.duration} mins &bull; ${s.price}</p>
                            </div>
                          </div>
                          <button onClick={() => saveServices(services.filter(x => x.id !== s.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'staff' && (
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Manage Staff</h3>
                      <button 
                        onClick={() => {
                          const name = prompt('Staff Name?');
                          if (!name) return;
                          const newStaff: Staff = {
                            id: 'st' + Date.now(),
                            name,
                            role: prompt('Role?', 'Specialist'),
                            avatar: `https://picsum.photos/seed/${name}/200`,
                            availableServices: services.map(s => s.name),
                            rating: 5.0
                          };
                          saveStaff([...staff, newStaff]);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Staff</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {staff.map(s => (
                        <div key={s.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img src={s.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{s.name}</p>
                              <p className="text-[10px] text-slate-500">{s.role}</p>
                            </div>
                          </div>
                          <button onClick={() => saveStaff(staff.filter(x => x.id !== s.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'blocked' && (
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Blocked Time Slots</h3>
                      <button 
                        onClick={() => {
                          const staffId = prompt('Staff ID? (e.g. st1)');
                          const date = prompt('Date? (yyyy-MM-dd)', format(new Date(), 'yyyy-MM-dd'));
                          const start = prompt('Start Time? (HH:mm)', '10:00');
                          const end = prompt('End Time? (HH:mm)', '12:00');
                          if (!staffId || !date || !start || !end) return;
                          const newBlocked: BlockedSlot = {
                            id: 'b' + Date.now(),
                            staffId,
                            date,
                            startTime: start,
                            endTime: end,
                            reason: 'Manual Block'
                          };
                          saveBlocked([...blockedSlots, newBlocked]);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Block Slot</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {blockedSlots.map(bs => {
                        const s = staff.find(x => x.id === bs.staffId);
                        return (
                          <div key={bs.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-white rounded-lg border border-slate-100"><X className="w-4 h-4 text-red-500" /></div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{s?.name} &bull; {bs.date}</p>
                                <p className="text-[10px] text-slate-500">{bs.startTime} - {bs.endTime} ({bs.reason})</p>
                              </div>
                            </div>
                            <button onClick={() => saveBlocked(blockedSlots.filter(x => x.id !== bs.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                      {blockedSlots.length === 0 && <p className="text-center py-8 text-slate-400 text-sm italic">No slots blocked manually.</p>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Business Analytics</h2>
              <Analytics bookings={bookings} services={services} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {bookingResult === 'success' && selectedDate && selectedSlot && selectedStaff && (
          <BookingConfirmationModal
            isOpen={true}
            onClose={resetBookingState}
            onGoToHistory={() => { setView('history'); resetBookingState(); }}
            onGoHome={() => { setView('home'); resetBookingState(); }}
            bookingDetails={{
              service: selectedService,
              staff: selectedStaff,
              date: selectedDate,
              slot: selectedSlot,
              email: formData.email,
              phone: formData.phone
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewModalOpen && activeBookingForReview && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => { setIsReviewModalOpen(false); setActiveBookingForReview(null); }}
            onSubmit={handleReviewSubmit}
            booking={activeBookingForReview}
            staff={staff.find(s => s.id === activeBookingForReview.staffId)!}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPolicyModalOpen && (
          <CancellationPolicyModal
            isOpen={isPolicyModalOpen}
            onClose={() => setIsPolicyModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full max-w-5xl p-8 text-center border-t border-slate-100 mt-auto">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Slotify &copy; 2026 &bull; Professional Booking System</p>
      </footer>
    </div>
  );
}
