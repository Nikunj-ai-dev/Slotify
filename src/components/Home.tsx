import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Users, 
  BarChart3, 
  Clock,
  ChevronRight,
  Star,
  CheckCircle2
} from 'lucide-react';

interface HomeProps {
  onStartBooking: () => void;
  onViewAdmin: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStartBooking, onViewAdmin }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-600 mb-6">
                <Zap className="w-4 h-4 mr-2" />
                The Future of Scheduling is Here
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
                Booking made <span className="text-blue-600">effortless.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
                Slotify is the all-in-one platform for businesses to manage appointments, 
                staff, and analytics with a beautiful, intuitive interface.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onStartBooking}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center group"
                >
                  Book an Appointment
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onViewAdmin}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Admin Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to grow</h2>
          <p className="text-slate-600">Powerful features designed to save you time and delight your customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Calendar,
              title: "Smart Scheduling",
              description: "Real-time availability tracking with intelligent slot generation and buffer management.",
              color: "bg-blue-50 text-blue-600"
            },
            {
              icon: Users,
              title: "Staff Management",
              description: "Manage multiple staff members, their individual schedules, and service expertise.",
              color: "bg-purple-50 text-purple-600"
            },
            {
              icon: BarChart3,
              title: "Business Analytics",
              description: "Deep insights into your bookings, revenue, and peak hours to optimize your business.",
              color: "bg-orange-50 text-orange-600"
            },
            {
              icon: ShieldCheck,
              title: "Secure Payments",
              description: "Integrated payment simulation for a complete end-to-end booking experience.",
              color: "bg-green-50 text-green-600"
            },
            {
              icon: Clock,
              title: "Instant Notifications",
              description: "Automated booking confirmations and reminders to reduce no-shows.",
              color: "bg-pink-50 text-pink-600"
            },
            {
              icon: Star,
              title: "Customer Profiles",
              description: "Keep track of your customers, their history, and preferences in one place.",
              color: "bg-yellow-50 text-yellow-600"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 rounded-[3rem] py-20 px-8 text-center text-white mx-4 sm:mx-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {[
            { label: "Total Bookings", value: "12,450+", sub: "Processed this year" },
            { label: "Active Businesses", value: "850+", sub: "Trusting Slotify" },
            { label: "Customer Satisfaction", value: "98.2%", sub: "Average score" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                delay: i * 0.2,
                duration: 0.8
              }}
              className="space-y-2"
            >
              <h3 className="text-5xl md:text-6xl font-black tracking-tighter text-blue-400">
                {stat.value}
              </h3>
              <p className="text-lg font-bold text-white uppercase tracking-widest">{stat.label}</p>
              <p className="text-slate-400 text-sm">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-5xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/50 relative"
        >
          <div className="absolute top-10 left-10 text-slate-100">
            <svg width="80" height="60" viewBox="0 0 80 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.3333 0L33.3333 20V60H0V20L10 0H23.3333ZM70 0L80 20V60H46.6667V20L56.6667 0H70Z" />
            </svg>
          </div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <blockquote className="text-2xl md:text-3xl font-medium text-slate-900 mb-10 leading-snug">
              "Slotify has completely transformed how we manage our salon. The interface is beautiful, and our customers love how easy it is to book. It's the best investment we've made this year."
            </blockquote>
            
            <div className="flex flex-col items-center gap-4">
              <img 
                src="https://picsum.photos/seed/person1/120/120" 
                alt="Sarah Jenkins" 
                className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-50 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-black text-xl text-slate-900">Sarah Jenkins</p>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">Founder, Glow Studio</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-blue-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to streamline your business?</h2>
            <p className="text-blue-100 mb-10 max-w-xl mx-auto text-lg">
              Join thousands of businesses that trust Slotify for their scheduling needs. 
              Start your free trial today.
            </p>
            <button
              onClick={onStartBooking}
              className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl"
            >
              Get Started Now
            </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-700 rounded-full opacity-50" />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 border-t border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">Slotify</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Making scheduling simple and beautiful for businesses worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Features</li>
              <li>Pricing</li>
              <li>Integrations</li>
              <li>Enterprise</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>About Us</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between py-8 border-t border-slate-50 text-slate-400 text-sm">
          <p>© 2026 Slotify Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <CheckCircle2 className="w-5 h-5" />
            <ShieldCheck className="w-5 h-5" />
            <Users className="w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
};
