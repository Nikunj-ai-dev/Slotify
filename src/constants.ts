import { Service, Staff } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Haircut',
    category: 'Hair Services',
    duration: 45,
    price: 35,
    description: 'Professional haircut and styling.',
    color: 'bg-blue-500',
  },
  {
    id: 's2',
    name: 'Consultation',
    category: 'Consultations',
    duration: 30,
    price: 50,
    description: 'One-on-one expert consultation.',
    color: 'bg-purple-500',
  },
  {
    id: 's3',
    name: 'Gym Session',
    category: 'Wellness',
    duration: 60,
    price: 20,
    description: 'Personal training or gym access.',
    color: 'bg-orange-500',
  },
  {
    id: 's4',
    name: 'Therapy',
    category: 'Wellness',
    duration: 50,
    price: 120,
    description: 'Professional counseling session.',
    color: 'bg-emerald-500',
  },
  {
    id: 's5',
    name: 'Massage',
    category: 'Wellness',
    duration: 90,
    price: 85,
    description: 'Deep tissue or Swedish massage.',
    color: 'bg-pink-500',
  },
  {
    id: 's6',
    name: 'Dental Checkup',
    category: 'Medical',
    duration: 40,
    price: 75,
    description: 'Routine cleaning and examination.',
    color: 'bg-indigo-500',
  },
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'st1',
    name: 'Dr. Sarah Wilson',
    role: 'Senior Consultant',
    avatar: 'https://picsum.photos/seed/sarah/200',
    availableServices: ['Consultation', 'Therapy'],
    rating: 4.9,
  },
  {
    id: 'st2',
    name: 'Alex Rivera',
    role: 'Master Barber',
    avatar: 'https://picsum.photos/seed/alex/200',
    availableServices: ['Haircut'],
    rating: 4.8,
  },
  {
    id: 'st3',
    name: 'Jordan Smith',
    role: 'Fitness Trainer',
    avatar: 'https://picsum.photos/seed/jordan/200',
    availableServices: ['Gym Session'],
    rating: 4.7,
  },
  {
    id: 'st4',
    name: 'Dr. Emily Chen',
    role: 'Dentist',
    avatar: 'https://picsum.photos/seed/emily/200',
    availableServices: ['Dental Checkup'],
    rating: 4.9,
  },
  {
    id: 'st5',
    name: 'Marcus Thorne',
    role: 'Massage Therapist',
    avatar: 'https://picsum.photos/seed/marcus/200',
    availableServices: ['Massage'],
    rating: 4.6,
  },
];

export const WORKING_HOURS = {
  start: '09:00',
  end: '18:00',
  buffer: 15, // minutes between slots
};
