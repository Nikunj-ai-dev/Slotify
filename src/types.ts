export type ServiceType = 'Haircut' | 'Consultation' | 'Gym Session' | 'Therapy' | 'Massage' | 'Dental Checkup';

export interface Service {
  id: string;
  name: ServiceType;
  category: 'Hair Services' | 'Wellness' | 'Consultations' | 'Medical';
  duration: number; // in minutes
  price: number;
  description: string;
  color: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatar: string;
  availableServices: ServiceType[];
  rating: number; // This can be the initial rating, but we'll calculate the live one
}

export interface Review {
  id: string;
  bookingId: string;
  staffId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  staffId: string;
  serviceId: string;
  date: string; // ISO yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  price: number;
  userName: string;
  userPhone: string;
  userEmail: string;
  createdAt: string;
  hasReview?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface BlockedSlot {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}
